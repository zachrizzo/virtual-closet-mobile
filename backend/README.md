# Virtual Closet Backend API

A comprehensive FastAPI backend for the Virtual Closet app - an AI-powered wardrobe management and styling application.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Wardrobe Management**: Complete CRUD operations for clothing items
- **Outfit Creation**: Create and manage outfit combinations
- **AI Recommendations**: Smart outfit suggestions based on occasion, weather, and style
- **Image Processing**: Background removal and image optimization
- **Virtual Try-On**: AI-powered virtual clothing try-on (with IDM-VTON)
- **Analytics**: Wardrobe statistics and wear tracking

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Authentication**: JWT tokens with python-jose
- **Image Processing**: Pillow, OpenCV
- **AI/ML**: PyTorch with MPS support (Apple Silicon)
- **Background Removal**: U-2-Net
- **Virtual Try-On**: IDM-VTON integration
- **Development**: Poetry for dependency management

## Installation

### 1. Install Dependencies

```bash
# Install Poetry if you haven't already
curl -sSL https://install.python-poetry.org | python3 -

# Install project dependencies
poetry install
```

### 2. Set Up AI Models

The AI models are stored on your external drive. Follow the setup guide:

```bash
# Check the AI models setup guide
cat AI_MODELS_SETUP.md

# Or manually download models
cat MANUAL_MODEL_DOWNLOAD.md
```

### 3. Create Mock Data

```bash
poetry run python scripts/create_mock_data.py
```

### 4. Environment Variables

Create a `.env` file in the backend root:

```env
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Running the Server

### Development Mode

```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/preferences` - Update style preferences
- `GET /api/v1/users/analytics` - Get wardrobe analytics

### Wardrobe
- `GET /api/v1/clothing` - List clothing items
- `POST /api/v1/clothing` - Add clothing item
- `GET /api/v1/clothing/{id}` - Get specific item
- `PUT /api/v1/clothing/{id}` - Update item
- `DELETE /api/v1/clothing/{id}` - Remove item
- `POST /api/v1/clothing/{id}/upload-image` - Upload item image
- `POST /api/v1/clothing/{id}/process-image` - Process image (background removal)

### Outfits
- `GET /api/v1/outfits` - List outfits
- `POST /api/v1/outfits` - Create outfit
- `GET /api/v1/outfits/{id}` - Get specific outfit
- `PUT /api/v1/outfits/{id}` - Update outfit
- `DELETE /api/v1/outfits/{id}` - Delete outfit
- `POST /api/v1/outfits/{id}/wear` - Mark as worn
- `POST /api/v1/outfits/{id}/generate-image` - Generate outfit collage

### AI Services
- `POST /api/v1/ai/recommendations` - Get outfit recommendations
- `POST /api/v1/ai/style-advice` - Get styling advice
- `POST /api/v1/ai/occasion-outfits` - Get occasion-specific outfits
- `POST /api/v1/ai/weather-outfits` - Get weather-appropriate outfits
- `POST /api/v1/ai/virtual-tryon` - Generate virtual try-on

## Testing

### Run Tests

```bash
poetry run pytest
```

### Test Coverage

```bash
poetry run pytest --cov=app --cov-report=html
```

## Development

### Code Formatting

```bash
# Format code with Black
poetry run black app/

# Sort imports
poetry run isort app/

# Type checking
poetry run mypy app/
```

### Mock User Credentials

For development, use these credentials:
- **Email**: jane.doe@example.com
- **Password**: secret

## Project Structure

```
virtual-closet-backend/
├── app/
│   ├── ai/                 # AI/ML models and services
│   ├── config/            # Configuration and constants
│   ├── data/              # Mock data storage
│   ├── models/            # Pydantic data models
│   ├── routers/           # API endpoints
│   ├── schemas/           # Request/response schemas
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── scripts/               # Utility scripts
├── tests/                 # Test suite
├── pyproject.toml        # Poetry configuration
└── README.md
```

## Deployment

### Docker

```bash
# Build image
docker build -t virtual-closet-backend .

# Run container
docker run -p 8000:8000 virtual-closet-backend
```

### Environment Variables for Production

- `SECRET_KEY`: Strong secret key for JWT
- `DATABASE_URL`: Production database URL (when migrating from mock data)
- `REDIS_URL`: Redis URL for caching
- `CDN_URL`: CDN for serving images
- `OPENAI_API_KEY`: For GPT-4 Vision integration

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and formatting
4. Submit a pull request

## License

This project is proprietary and confidential.