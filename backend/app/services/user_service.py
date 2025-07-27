from typing import Optional
import json
import os
from datetime import datetime
from app.models.user import User
from app.schemas.user_schemas import UserUpdate, UserPreferencesUpdate, UserAnalytics
from fastapi import HTTPException, status

class UserService:
    def __init__(self):
        self.users_file = "app/data/mock/users.json"
        self.clothing_file = "app/data/mock/clothing.json"
        self.outfits_file = "app/data/mock/outfits.json"
        self._ensure_files_exist()
    
    def _ensure_files_exist(self):
        os.makedirs(os.path.dirname(self.users_file), exist_ok=True)
        for file in [self.users_file, self.clothing_file, self.outfits_file]:
            if not os.path.exists(file):
                with open(file, 'w') as f:
                    json.dump([], f)
    
    def _load_users(self) -> list:
        with open(self.users_file, 'r') as f:
            return json.load(f)
    
    def _save_users(self, users: list):
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    
    def _load_clothing(self) -> list:
        with open(self.clothing_file, 'r') as f:
            return json.load(f)
    
    def _load_outfits(self) -> list:
        with open(self.outfits_file, 'r') as f:
            return json.load(f)
    
    def update_user(self, user_id: str, user_update: UserUpdate) -> User:
        users = self._load_users()
        user_index = next((i for i, u in enumerate(users) if u['id'] == user_id), None)
        
        if user_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        update_data = user_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            users[user_index][key] = value
        
        users[user_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_users(users)
        
        return User(**users[user_index])
    
    def update_preferences(self, user_id: str, preferences: UserPreferencesUpdate) -> User:
        users = self._load_users()
        user_index = next((i for i, u in enumerate(users) if u['id'] == user_id), None)
        
        if user_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        update_data = preferences.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key == 'sizing_info' and value:
                users[user_index]['preferences']['sizing_info'].update(value.dict(exclude_unset=True))
            else:
                users[user_index]['preferences'][key] = value
        
        users[user_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_users(users)
        
        return User(**users[user_index])
    
    def get_user_analytics(self, user_id: str) -> UserAnalytics:
        clothing = self._load_clothing()
        outfits = self._load_outfits()
        
        user_clothing = [c for c in clothing if c.get('user_id') == user_id]
        user_outfits = [o for o in outfits if o.get('user_id') == user_id]
        
        total_value = sum(item.get('cost', 0) for item in user_clothing)
        
        most_worn = sorted(user_clothing, key=lambda x: x.get('wear_count', 0), reverse=True)[:5]
        least_worn = sorted(user_clothing, key=lambda x: x.get('wear_count', 0))[:5]
        
        color_freq = {}
        for item in user_clothing:
            color = item.get('color', {}).get('primary')
            if color:
                color_freq[color] = color_freq.get(color, 0) + 1
        
        favorite_colors = [{"color": k, "count": v} for k, v in sorted(color_freq.items(), key=lambda x: x[1], reverse=True)]
        
        cost_per_wear = {}
        for item in user_clothing:
            if item.get('wear_count', 0) > 0 and item.get('cost', 0) > 0:
                cpw = item['cost'] / item['wear_count']
                cost_per_wear[item['name']] = round(cpw, 2)
        
        return UserAnalytics(
            total_items=len(user_clothing),
            total_outfits=len(user_outfits),
            most_worn_items=[{"name": i['name'], "wear_count": i.get('wear_count', 0)} for i in most_worn],
            least_worn_items=[{"name": i['name'], "wear_count": i.get('wear_count', 0)} for i in least_worn],
            cost_per_wear=cost_per_wear,
            favorite_colors=favorite_colors,
            wardrobe_value=round(total_value, 2)
        )