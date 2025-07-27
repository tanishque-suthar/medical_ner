# xray-analysis-service/models/xray_models.py

import os
import io
import base64
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from transformers import pipeline as hf_pipeline
from open_clip import create_model_from_pretrained, get_tokenizer
import google.generativeai as genai
import numpy as np
import cv2
import matplotlib.pyplot as plt

# --- Configuration ---
# It's recommended to load your Gemini API key from environment variables
# For example, create a .env file with: GEMINI_API_KEY="your_key_here"
from dotenv import load_dotenv
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- ChexNet Model for Pathology Detection ---

class ChexNet(nn.Module):
    """ChexNet model architecture based on DenseNet121"""
    def __init__(self, num_classes=14):
        super(ChexNet, self).__init__()
        self.densenet121 = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
        num_ftrs = self.densenet121.classifier.in_features
        self.densenet121.classifier = nn.Sequential(
            nn.Linear(num_ftrs, num_classes),
            nn.Sigmoid()
        )
    def forward(self, x):
        return self.densenet121(x)

class XRayAnalysisModel:
    """
    A class to encapsulate all X-ray analysis models and logic.
    """
    def __init__(self):
        print("Loading X-Ray analysis models...")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # --- Load ChexNet ---
        self.chexnet_labels = [
            'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration', 'Mass', 
            'Nodule', 'Pneumonia', 'Pneumothorax', 'Consolidation', 'Edema', 
            'Emphysema', 'Fibrosis', 'Pleural_Thickening', 'Hernia'
        ]
        self.chexnet_model = ChexNet(num_classes=len(self.chexnet_labels)).to(self.device)
        # Note: In a real scenario, you would load pre-trained weights for ChexNet.
        # For this prototype, it will use the ImageNet pre-trained DenseNet weights.
        self.chexnet_model.eval()
        print("ChexNet model loaded.")

        # --- Load BiomedCLIP ---
        model_and_preprocess = create_model_from_pretrained('hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224')
        if len(model_and_preprocess) == 3:
            self.biomed_clip_model, _, self.biomed_clip_preprocess = model_and_preprocess
        else:
            self.biomed_clip_model, self.biomed_clip_preprocess = model_and_preprocess
        self.biomed_clip_tokenizer = get_tokenizer('hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224')
        self.biomed_clip_model.to(self.device)
        print("BiomedCLIP model loaded.")

        # --- Configure Gemini ---
        # This part is simplified. In production, handle the API key securely.
        try:
            # The API key will be provided by the environment when run in the platform
            gemini_api_key = os.environ.get('GEMINI_API_KEY', '') # Fallback to empty string
            if gemini_api_key:
                genai.configure(api_key=gemini_api_key)
                self.gemini_model = genai.GenerativeModel('gemma-3n-e4b-it')
                print("Gemini model configured.")
            else:
                self.gemini_model = None
                print("Warning: GEMINI_API_KEY not found. Q&A and Compare features will be disabled.")
        except Exception as e:
            self.gemini_model = None
            print(f"Error configuring Gemini: {e}")


    def predict_pathologies(self, image: Image.Image, threshold=0.5):
        """Uses ChexNet to predict pathologies from an X-ray image."""
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        image_tensor = transform(image.convert("RGB")).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            predictions = self.chexnet_model(image_tensor).cpu().numpy()[0]
        
        results = []
        for i, label in enumerate(self.chexnet_labels):
            prob = float(predictions[i])
            results.append({
                "name": label,
                "probability": prob,
                "detected": prob > threshold
            })
        return results

    def generate_biomed_clip_report(self, image: Image.Image):
        """Generates a descriptive report using BiomedCLIP."""
        # A set of candidate labels to guide the report generation
        candidate_labels = ["normal", "fracture", "pneumonia", "cardiomegaly", "pleural effusion", "nodule", "opacity"]
        template = 'this is a photo of '
        texts = self.biomed_clip_tokenizer([template + label for label in candidate_labels]).to(self.device)

        with torch.no_grad():
            image_processed = self.biomed_clip_preprocess(image).unsqueeze(0).to(self.device)
            image_features, text_features, logit_scale = self.biomed_clip_model(image_processed, texts)
            logits = (logit_scale * image_features @ text_features.t()).detach().softmax(dim=-1)
        
        probs = logits.cpu().numpy()[0]
        report_lines = []
        for label, score in zip(candidate_labels, probs):
            report_lines.append(f"- {label.capitalize()}: Confidence {score:.2%}")
        
        return "Potential Findings based on BiomedCLIP analysis:\n" + "\n".join(report_lines)

    def generate_qna_answer(self, context: str, question: str):
        """Answers a question based on a context using Gemini."""
        if not self.gemini_model:
            return "Q&A feature is not available. GEMINI_API_KEY is not configured."
        
        prompt = f"""
        You are a helpful medical assistant. Based *only* on the provided report context, answer the user's question.
        
        Report Context:
        ---
        {context}
        ---
        
        Question: {question}
        
        Answer:
        """
        response = self.gemini_model.generate_content(prompt)
        return response.text

    def generate_comparison_report(self, image1: Image.Image, image2: Image.Image):
        """Compares two X-ray images using Gemini."""
        if not self.gemini_model:
            return "Comparison feature is not available. GEMINI_API_KEY is not configured."
            
        report1 = self.generate_biomed_clip_report(image1)
        report2 = self.generate_biomed_clip_report(image2)
        
        prompt = f"""
        You are an expert radiologist. Analyze and compare the two medical reports from a previous and a current X-ray.
        Highlight key differences, signs of progression, regression, or new findings.
        Provide a concise and clear comparison.

        Previous Report:
        ---
        {report1}
        ---

        Current Report:
        ---
        {report2}
        ---
        
        Comparison Analysis:
        """
        response = self.gemini_model.generate_content(prompt)
        return response.text

# Instantiate the model class as a singleton
xray_model_instance = XRayAnalysisModel()
