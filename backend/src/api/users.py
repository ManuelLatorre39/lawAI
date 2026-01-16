from fastapi import APIRouter, Depends
from src.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
def read_me(dni: str = Depends(get_current_user)):
    return {"dni": dni}
