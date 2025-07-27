# ner-service/model/ner.py

from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import torch

class NERModel:
    """
    A class to encapsulate the NER model loading and prediction logic.
    """
    def __init__(self, model_name="d4data/biomedical-ner-all"):
        """
        Initializes and loads the NER model and tokenizer.
        
        Args:
            model_name (str): The name of the HuggingFace model to load.
        """
        print("Loading NER model...")
        try:
            # Check for GPU availability
            self.device = 0 if torch.cuda.is_available() else -1
            
            # Load the tokenizer and model from HuggingFace
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForTokenClassification.from_pretrained(model_name)
            
            # Create the NER pipeline with max aggregation strategy
            self.ner_pipeline = pipeline(
                "ner",
                model=model,
                tokenizer=tokenizer,
                aggregation_strategy="max",
                device=self.device
            )
            print(f"NER model '{model_name}' loaded successfully on {'GPU' if self.device == 0 else 'CPU'}.")
        except Exception as e:
            print(f"Error loading NER model: {e}")
            self.ner_pipeline = None

    def predict(self, text: str) -> list:
        """
        Performs Named Entity Recognition on the provided text.

        Args:
            text (str): The input text to analyze.

        Returns:
            list: A list of dictionaries, where each dictionary represents
                  a detected entity. Returns an empty list on failure.
        """
        if not self.ner_pipeline or not text.strip():
            return []

        try:
            # Run the NER pipeline on the text
            entities = self.ner_pipeline(text)
            
            # Format the output to match the API contract
            formatted_entities = [
                {
                    "text": entity.get('word'),
                    "label": entity.get('entity_group'),
                    "confidence": round(entity.get('score', 0.0), 4)
                }
                for entity in entities
            ]
            
            return formatted_entities
        except Exception as e:
            print(f"Error during NER prediction: {e}")
            return []

# Instantiate the model when the module is loaded.
# This makes it a singleton that can be imported by the Flask app.
ner_model = NERModel()
