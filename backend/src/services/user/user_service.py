from src.db.mongo import users_col
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def find_by_dni(dni: str):
    return users_col.find_one({"dni": dni})

def activate_user(dni: str, data: dict):
    password_hash = hash_password(data["password"])

    result = users_col.update_one(
        {"dni": dni, "activated": False},
        {
            "$set": {
                "email": data["email"],
                "name": data["name"],
                "password_hash": password_hash,
                "activated": True
            }
        }
    )
    return result.modified_count == 1

def authenticate(dni: str, password: str):
    user = users_col.find_one({"dni": dni, "activated": True})

    if not user:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return user
