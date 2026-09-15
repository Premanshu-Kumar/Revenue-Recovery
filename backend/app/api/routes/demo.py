from fastapi import APIRouter
from app.database.seed import run_seed

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/reset")
def reset_demo():
    run_seed(reset=True)
    return {"status": "SUCCESS", "message": "Demo database successfully reset and re-seeded with 1,000 realistic cases"}

@router.post("/seed")
def seed_demo():
    run_seed(reset=False)
    return {"status": "SUCCESS", "message": "Demo data populated"}
