from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Campaign

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

class CampaignCreateRequest(BaseModel):
    name: str
    type: str
    workflow_steps: List[Dict[str, Any]]

@router.get("", response_model=List[dict])
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).all()
    res = []
    for c in campaigns:
        rate = round((c.revenue_recovered / c.revenue_at_risk * 100.0), 2) if c.revenue_at_risk > 0 else 0.0
        res.append({
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "status": c.status,
            "total_cases": c.total_cases,
            "revenue_at_risk": c.revenue_at_risk,
            "revenue_recovered": c.revenue_recovered,
            "recovery_rate": rate,
            "workflow_steps": c.workflow_steps or [],
            "created_at": c.created_at.isoformat()
        })
    return res

@router.post("", response_model=dict)
def create_campaign(req: CampaignCreateRequest, db: Session = Depends(get_db)):
    c = Campaign(
        name=req.name,
        type=req.type,
        status="ACTIVE",
        total_cases=0,
        revenue_at_risk=0.0,
        revenue_recovered=0.0,
        workflow_steps=req.workflow_steps
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "name": c.name, "status": c.status, "message": "Campaign created successfully"}
