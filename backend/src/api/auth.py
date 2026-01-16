from fastapi import APIRouter, HTTPException
from src.services.user.user_service import find_by_dni, activate_user, authenticate
from src.services.auth.auth_service import create_access_token
from src.api.schemas.auth import ActivateRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/activate")
def activate(data: ActivateRequest):

    user = find_by_dni(data.dni)

    if not user:
        raise HTTPException(status_code=404, detail="DNI no encontrado")

    if user.get("activated"):
        raise HTTPException(status_code=400, detail="Usuario ya activado")

    success = activate_user(data.dni, data.dict())

    if not success:
        raise HTTPException(status_code=400, detail="No se pudo activar")

    return {"message": "Cuenta activada correctamente"}

@router.post("/login")
def login(data :LoginRequest):

    user = authenticate(data.dni, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({
        "sub": user["dni"],
        "role": user.get("role", "user")
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
