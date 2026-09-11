from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import SimulationRunRequest, SimulationRunResponse
from app.workflows.recovery_simulator import recovery_simulator

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/run", response_model=SimulationRunResponse)
def run_simulation(req: SimulationRunRequest = None, db: Session = Depends(get_db)):
    batch_size = req.batch_size if req else 1000
    auto_approve = req.auto_approve_eligible if req else True
    
    res = recovery_simulator.run_batch_simulation(
        db=db,
        batch_size=batch_size,
        auto_approve=auto_approve
    )
    return SimulationRunResponse(**res)
