# Medical Analyzer Frontend

A React.js frontend application for the Hospital Medical Analyzer system, built with Vite.

## Features

- **Authentication System**: Secure login for hospital staff
- **Responsive Design**: Mobile-friendly interface 
- **Protected Routes**: Role-based access control
- **Modern UI**: Clean, professional interface suitable for medical professionals

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Backend Integration

Make sure the backend server is running on `http://localhost:8000` before using the frontend.

### Demo Credentials

The system comes with demo accounts for testing:

- **Doctor**: `doctor` / `password123`
- **Admin**: `admin` / `admin123`  
- **Nurse**: `nurse` / `nurse123`

To create these demo users, run the backend setup script:
```bash
cd ../backend
python create_demo_users.py
```

## Authentication Flow

1. **Login Page**: Simple username/password authentication
2. **JWT Tokens**: Secure token-based authentication
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Auto-logout**: Handles token expiration gracefully

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx      # Login form component
│   │   └── ProtectedRoute.jsx # Route protection wrapper
│   └── Dashboard.jsx          # Main dashboard after login
├── contexts/
│   └── AuthContext.jsx        # Authentication state management
├── App.jsx                    # Main app component with routing
└── main.jsx                   # App entry point
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend integrates with the FastAPI backend through:

- **Login Endpoint**: `POST /api/auth/login`
- **User Info**: `GET /api/auth/me`
- **Protected Routes**: All requests include JWT token in Authorization header


## Security Features

- **HTTPS Ready**: Production-ready security headers
- **Token Storage**: Secure localStorage management
- **Auto-refresh**: Handles token expiration
- **CORS Protection**: Proper API integration

## Next Steps

The current implementation provides the authentication foundation. Future enhancements could include:

- Patient management interface
- Medical report analysis UI
- X-ray analysis dashboard
- Real-time notifications
- Advanced search and filtering

## Troubleshooting

### Common Issues

1. **Login fails**: Ensure backend is running on port 8000
2. **CORS errors**: Check API base URL configuration
3. **Build errors**: Verify all dependencies are installed

### Development

For development with hot reload:
```bash
npm run dev
```

The app will automatically reload when you make changes to the source code.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
