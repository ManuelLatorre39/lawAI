from pydantic import BaseModel

class ActivateRequest(BaseModel):
    dni: str
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    dni: str
    password: str
