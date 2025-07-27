# Virtual Closet

A comprehensive AI-powered virtual wardrobe management application with React Native mobile app and FastAPI backend.

## Project Structure

```
virtual-closet/
├── README.md                 # This file
├── backend/                  # FastAPI Backend
│   ├── app/                  # Main backend application
│   ├── pyproject.toml        # Python dependencies
│   └── README.md             # Backend documentation
├── web-frontend/             # Simple web frontend for testing
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── serve.py
├── src/                      # React Native mobile app
│   ├── screens/              # App screens
│   ├── navigation/           # Navigation configuration
│   ├── store/                # Redux store and API
│   ├── services/             # API services
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── assets/                   # Images and assets
├── package.json              # Node.js dependencies
└── app.json                  # Expo configuration
```

## Features

- **React Native Mobile App** with Expo
- **FastAPI Backend** with AI/ML capabilities
- **Virtual Try-On** using IDM-VTON
- **AI-Powered Recommendations**
- **User Authentication** with JWT
- **Wardrobe Management**
- **Outfit Creation & Planning**
- **Image Processing** and background removal
- **Web Frontend** for testing

## Quick Start

### Backend Setup

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Mobile App Setup

```bash
npm install
npm run web    # For web version
npm run ios    # For iOS
npm run android # For Android
```

### Web Frontend (for testing)

```bash
cd web-frontend
python serve.py
```

## Test Credentials

- Email: `jane.doe@example.com`
- Password: `secret`

## Documentation

- [Backend Documentation](./backend/README.md)
- [Mobile App Features](#features)
- [API Documentation](http://localhost:8000/docs) (when backend is running)

## Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- Redux Toolkit with RTK Query
- React Navigation
- React Native Paper

### Backend
- FastAPI (Python)
- PyTorch with MPS support
- JWT Authentication
- AI/ML models for virtual try-on
- Image processing with OpenCV

## Development

### Start Development Servers

```bash
# Terminal 1 - Backend
cd backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Mobile App
npm run web

# Terminal 3 - Web Frontend (optional)
cd web-frontend && python serve.py
```

### API Endpoints

- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Mobile Web App: `http://localhost:8081` (Expo)
- Web Frontend: `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is proprietary and confidential.