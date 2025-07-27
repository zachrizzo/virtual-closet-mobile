from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.schemas.auth_schemas import Token, UserRegister
from app.schemas.user_schemas import UserResponse
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
auth_service = AuthService()

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    return auth_service.get_current_user(token)

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    user = auth_service.register(user_data)
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return auth_service.login(form_data.username, form_data.password)

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    return auth_service.refresh_token(refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user