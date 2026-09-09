from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str
    status: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    company: str
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: str
    country: str
    segment: str
    lifetime_value: float
    average_monthly_revenue: float
    payment_success_rate: float
    average_payment_delay: int
    customer_health: str
    preferred_channel: str
    opted_out: bool = False
    status: str

class CustomerResponse(CustomerBase):
    id: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    dispute_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Recovery Case & Action Schemas
class RecoveryActionResponse(BaseModel):
    id: str
    case_id: str
    action_type: str
    channel: str
    status: str
    scheduled_at: datetime
    executed_at: Optional[datetime] = None
    result: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AIRecommendationResponse(BaseModel):
    id: str
    case_id: str
    diagnosis: str
    recommendation: str
    confidence: float
    reasoning_summary: str
    supporting_signals: Optional[List[str]] = None
    multi_step_strategy: Optional[List[Dict[str, Any]]] = None
    generated_copy: Optional[Dict[str, str]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditEventResponse(BaseModel):
    id: str
    case_id: Optional[str] = None
    event_type: str
    actor: str
    action: str
    reason: Optional[str] = None
    audit_metadata: Optional[Dict[str, Any]] = None
    result: Optional[str] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class RecoveryCaseListResponse(BaseModel):
    id: str
    case_number: str
    customer_id: str
    customer_name: Optional[str] = None
    customer_company: Optional[str] = None
    customer_segment: Optional[str] = None
    customer_health: Optional[str] = None
    source_type: str
    source_id: str
    amount_at_risk: float
    recovered_amount: float
    currency: str
    days_overdue: int
    recovery_probability: float
    expected_recovery: float
    recovery_score: int
    priority: str
    root_cause: Optional[str] = None
    root_cause_confidence: float
    recommended_action: str
    policy_status: str
    policy_reason: Optional[str] = None
    status: str
    outreach_attempts: int
    retry_attempts: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RecoveryCaseDetailResponse(RecoveryCaseListResponse):
    customer: Optional[CustomerResponse] = None
    actions: List[RecoveryActionResponse] = []
    recommendations: List[AIRecommendationResponse] = []
    audit_events: List[AuditEventResponse] = []
    model_config = ConfigDict(from_attributes=True)

# Dashboard Response Schema
class DashboardKPISummary(BaseModel):
    revenue_at_risk: float
    revenue_recovered: float
    incremental_recovery: float
    baseline_recovered: float
    recovery_rate: float
    ai_lift: float
    active_cases: int
    recovered_cases: int
    critical_cases: int
    pending_approvals: int
    total_customers: int

class DashboardResponse(BaseModel):
    kpis: DashboardKPISummary
    risk_breakdown: List[Dict[str, Any]]
    funnel: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    top_opportunities: List[RecoveryCaseListResponse]
    recovery_trends: List[Dict[str, Any]]

# Action Execution Request
class CaseActionRequest(BaseModel):
    action_type: Optional[str] = None
    notes: Optional[str] = None
    override_policy: Optional[bool] = False
    custom_message: Optional[str] = None
    channel: Optional[str] = None

class SimulationRunRequest(BaseModel):
    batch_size: Optional[int] = 1000
    auto_approve_eligible: Optional[bool] = True

class SimulationRunResponse(BaseModel):
    cases_processed: int
    revenue_at_risk: float
    revenue_recovered: float
    baseline_recovered: float
    incremental_recovery: float
    recovery_rate: float
    ai_lift: float
    actions_executed: int
    auto_approved_count: int
    approval_required_count: int
    status: str

# Message generation request
class MessageGenerateRequest(BaseModel):
    case_id: str
    language: str = "Hinglish" # English, Hindi, Hinglish
    tone: str = "Urgent & Professional" # Friendly, Urgent & Professional, Relationship-focused, Formal
    channel: str = "WhatsApp" # Email, WhatsApp, SMS
