from enum import Enum

class ClothingCategory(str, Enum):
    TOPS = "tops"
    BOTTOMS = "bottoms"
    DRESSES = "dresses"
    OUTERWEAR = "outerwear"
    SHOES = "shoes"
    ACCESSORIES = "accessories"
    BAGS = "bags"
    JEWELRY = "jewelry"

class Season(str, Enum):
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"
    ALL_SEASON = "all_season"

class Occasion(str, Enum):
    CASUAL = "casual"
    WORK = "work"
    FORMAL = "formal"
    PARTY = "party"
    DATE = "date"
    ATHLETIC = "athletic"
    LOUNGE = "lounge"
    VACATION = "vacation"

class WeatherCondition(str, Enum):
    SUNNY = "sunny"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    SNOWY = "snowy"
    WINDY = "windy"
    HOT = "hot"
    COLD = "cold"
    MILD = "mild"

class StylePersonality(str, Enum):
    CLASSIC = "classic"
    TRENDY = "trendy"
    BOHEMIAN = "bohemian"
    MINIMALIST = "minimalist"
    ROMANTIC = "romantic"
    EDGY = "edgy"
    SPORTY = "sporty"
    PROFESSIONAL = "professional"