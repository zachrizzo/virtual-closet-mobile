from typing import Optional
from datetime import datetime
import uuid
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth_schemas import UserRegister, Token
from app.utils.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
import json
import os

class AuthService:
    def __init__(self):
        self.users_file = "app/data/mock/users.json"
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        os.makedirs(os.path.dirname(self.users_file), exist_ok=True)
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump([], f)
    
    def _load_users(self) -> list:
        with open(self.users_file, 'r') as f:
            return json.load(f)
    
    def _save_users(self, users: list):
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    
    def register(self, user_data: UserRegister) -> User:
        users = self._load_users()
        
        if any(u['email'] == user_data.email for u in users):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        user_dict = {
            "id": str(uuid.uuid4()),
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "hashed_password": get_password_hash(user_data.password),
            "profile_image": None,
            "preferences": {
                "style_personality": [],
                "favorite_colors": [],
                "sizing_info": {},
                "occasion_preferences": []
            },
            "is_active": True,
            "is_verified": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        users.append(user_dict)
        self._save_users(users)
        
        return User(**user_dict)
    
    def login(self, email: str, password: str) -> Token:
        users = self._load_users()
        user_dict = next((u for u in users if u['email'] == email), None)
        
        if not user_dict or not verify_password(password, user_dict['hashed_password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user_dict['id']})
        refresh_token = create_refresh_token(data={"sub": user_dict['id']})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    
    def refresh_token(self, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    
    def get_current_user(self, token: str) -> User:
        # Handle mock token for testing
        if token == "mock-access-token":
            mock_user_dict = {
                "id": "d62ccd8d-952f-4668-ac49-c0340bff34ba",
                "email": "jane.doe@example.com",
                "first_name": "Jane",
                "last_name": "Doe",
                "hashed_password": get_password_hash("secret"),
                "profile_image": None,
                "preferences": {
                    "style_personality": ["classic", "minimalist"],
                    "favorite_colors": ["Black", "White", "Navy"],
                    "sizing_info": {
                        "top_size": "M",
                        "bottom_size": "M",
                        "dress_size": "8",
                        "shoe_size": "8"
                    },
                    "occasion_preferences": ["work", "casual"]
                },
                "is_verified": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            return User(**mock_user_dict)
        
        payload = decode_token(token)
        
        if not payload or payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        users = self._load_users()
        user_dict = next((u for u in users if u['id'] == user_id), None)
        
        if not user_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return User(**user_dict)