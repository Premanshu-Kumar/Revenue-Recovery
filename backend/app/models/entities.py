import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum, Index
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(String(50), default="Finance Manager")
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=get_utc_now)

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False, index=True)
    company = Column(String(150), nullable=False, index=True)
    email = Column(String(120), nullable=True)
    phone = Column(String(30), nullable=True)
    industry = Column(String(80), nullable=False)
    country = Column(String(50), default="India")
    segment = Column(String(30), default="Mid-Market") # Enterprise, Mid-Market, SMB, Startup
    lifetime_value = Column(Float, default=0.0)
    average_monthly_revenue = Column(Float, default=0.0)
    payment_success_rate = Column(Float, default=0.90)
    average_payment_delay = Column(Integer, default=3) # in days
    total_transactions = Column(Integer, default=0)
    successful_transactions = Column(Integer, default=0)
    failed_transactions = Column(Integer, default=0)
    dispute_count = Column(Integer, default=0)
    customer_health = Column(String(30), default="Healthy") # Healthy, At Risk, Critical
    preferred_channel = Column(String(30), default="EMAIL") # EMAIL, WHATSAPP, PHONE
    opted_out = Column(Boolean, default=False)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=get_utc_now)

    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="customer", cascade="all, delete-orphan")
    recovery_cases = relationship("RecoveryCase", back_populates="customer", cascade="all, delete-orphan")
    promises = relationship("PromiseToPay", back_populates="customer", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False, index=True)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(50), default="CREDIT_CARD") # CREDIT_CARD, UPI, NETBANKING, NACH, DEBIT_CARD
    status = Column(String(30), default="FAILED", index=True) # SUCCESS, FAILED, PENDING, REFUNDED
    failure_reason = Column(String(80), nullable=True) # INSUFFICIENT_FUNDS, EXPIRED_CARD, CARD_DECLINED, PROCESSOR_ERROR, AUTHENTICATION_FAILED, BANK_ERROR, MANDATE_FAILURE, UNKNOWN
    processor = Column(String(50), default="Razorpay")
    retry_count = Column(Integer, default=0)
    subscription_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, index=True)
    
    customer = relationship("Customer", back_populates="payments")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False, index=True)
    currency = Column(String(10), default="INR")
    issue_date = Column(DateTime, default=get_utc_now)
    due_date = Column(DateTime, nullable=False, index=True)
    paid_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="OVERDUE", index=True) # PAID, OPEN, OVERDUE, DISPUTED, CANCELLED
    days_overdue = Column(Integer, default=0)
    dispute_status = Column(String(30), default="NONE") # NONE, UNDER_REVIEW, RESOLVED
    created_at = Column(DateTime, default=get_utc_now)
    
    customer = relationship("Customer", back_populates="invoices")
    promises = relationship("PromiseToPay", back_populates="invoice")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    plan = Column(String(50), default="Growth") # Starter, Growth, Business, Enterprise
    monthly_amount = Column(Float, nullable=False)
    status = Column(String(30), default="PAST_DUE", index=True) # ACTIVE, PAST_DUE, CANCELLED, PAUSED
    start_date = Column(DateTime, default=get_utc_now)
    renewal_date = Column(DateTime, nullable=False)
    payment_method = Column(String(50), default="CREDIT_CARD")
    failure_reason = Column(String(80), nullable=True)
    failed_renewal_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=get_utc_now)
    
    customer = relationship("Customer", back_populates="subscriptions")

class CheckoutSession(Base):
    __tablename__ = "checkout_sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True, index=True)
    cart_value = Column(Float, nullable=False)
    items_count = Column(Integer, default=1)
    started_at = Column(DateTime, default=get_utc_now)
    last_activity_at = Column(DateTime, default=get_utc_now)
    checkout_stage = Column(String(30), default="PAYMENT") # CART, ADDRESS, PAYMENT, REVIEW
    device_type = Column(String(30), default="DESKTOP")
    traffic_source = Column(String(50), default="Direct")
    status = Column(String(30), default="ABANDONED", index=True) # COMPLETED, ABANDONED, EXPIRED
    created_at = Column(DateTime, default=get_utc_now)

class PromiseToPay(Base):
    __tablename__ = "promise_to_pay"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=True)
    promised_amount = Column(Float, nullable=False)
    promise_date = Column(DateTime, nullable=False)
    status = Column(String(30), default="BROKEN", index=True) # ACTIVE, FULFILLED, BROKEN, CANCELLED
    created_at = Column(DateTime, default=get_utc_now)
    
    customer = relationship("Customer", back_populates="promises")
    invoice = relationship("Invoice", back_populates="promises")

class RecoveryCase(Base):
    __tablename__ = "recovery_cases"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. RV-10284
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False, index=True) # PAYMENT_FAILURE, OVERDUE_INVOICE, SUBSCRIPTION_FAILURE, CHECKOUT_ABANDONMENT, MANDATE_FAILURE, PROMISE_TO_PAY
    source_id = Column(String(80), nullable=False)
    amount_at_risk = Column(Float, nullable=False, index=True)
    recovered_amount = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    days_overdue = Column(Integer, default=0)
    
    # Intelligence & ML fields
    recovery_probability = Column(Float, default=0.5, index=True)
    expected_recovery = Column(Float, default=0.0)
    recovery_score = Column(Integer, default=50) # 0-100
    priority = Column(String(20), default="MEDIUM", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    root_cause = Column(String(80), nullable=True)
    root_cause_confidence = Column(Float, default=0.85)
    
    # Policy & Workflow Status
    recommended_action = Column(String(50), default="EMAIL_REMINDER") # PAYMENT_RETRY, EMAIL_REMINDER, WHATSAPP_REMINDER, PAYMENT_METHOD_UPDATE, CHECKOUT_REMINDER, DISCOUNT_OFFER, ACCOUNT_MANAGER_ESCALATION, FINANCE_ESCALATION, NO_ACTION, WAIT
    policy_status = Column(String(30), default="APPROVAL_REQUIRED") # ALLOWED, APPROVAL_REQUIRED, BLOCKED
    policy_reason = Column(String(255), nullable=True)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    status = Column(String(30), default="Detected", index=True) 
    # Lifecycle: Detected, Diagnosing, Recommendation Ready, Approval Required, Approved, Scheduled, Recovery In Progress, Customer Responded, Payment Pending, Recovered, Escalated, Paused, Closed, Unrecoverable
    
    outreach_attempts = Column(Integer, default=0)
    retry_attempts = Column(Integer, default=0)
    baseline_recovered_amount = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=get_utc_now, index=True)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    customer = relationship("Customer", back_populates="recovery_cases")
    actions = relationship("RecoveryAction", back_populates="case", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="case", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="case", cascade="all, delete-orphan")

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("recovery_cases.id"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False) # PAYMENT_RETRY, EMAIL_REMINDER, WHATSAPP_REMINDER, etc.
    channel = Column(String(30), default="EMAIL") # EMAIL, WHATSAPP, GATEWAY, INTERNAL
    status = Column(String(30), default="PENDING") # PENDING, SCHEDULED, EXECUTED, SUCCESS, FAILED, BLOCKED
    scheduled_at = Column(DateTime, default=get_utc_now)
    executed_at = Column(DateTime, nullable=True)
    result = Column(String(255), nullable=True)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    case = relationship("RecoveryCase", back_populates="actions")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("recovery_cases.id"), nullable=False, index=True)
    diagnosis = Column(Text, nullable=False)
    recommendation = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.88)
    reasoning_summary = Column(Text, nullable=False)
    supporting_signals = Column(JSON, nullable=True) # list of string signals
    multi_step_strategy = Column(JSON, nullable=True) # list of sequential steps
    generated_copy = Column(JSON, nullable=True) # {"en": "...", "hi": "...", "hinglish": "..."}
    created_at = Column(DateTime, default=get_utc_now)
    
    case = relationship("RecoveryCase", back_populates="recommendations")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("recovery_cases.id"), nullable=True, index=True)
    event_type = Column(String(60), nullable=False, index=True) # CASE_CREATED, AI_DIAGNOSIS, POLICY_CHECKED, APPROVAL_GRANTED, ACTION_EXECUTED, PAYMENT_RECOVERED, CASE_PAUSED, etc.
    actor = Column(String(60), default="RecoverAI Agent") # RecoverAI Agent, Policy Engine, CFO / User, System
    action = Column(String(100), nullable=False)
    reason = Column(Text, nullable=True)
    audit_metadata = Column(JSON, nullable=True)
    result = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=get_utc_now, index=True)
    
    case = relationship("RecoveryCase", back_populates="audit_events")

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False) # FAILED_PAYMENT, OVERDUE_INVOICE, SUBSCRIPTION_RECOVERY, CHECKOUT_ABANDONMENT, MANDATE_RECOVERY
    status = Column(String(30), default="ACTIVE") # ACTIVE, PAUSED, DRAFT, COMPLETED
    total_cases = Column(Integer, default=0)
    revenue_at_risk = Column(Float, default=0.0)
    revenue_recovered = Column(Float, default=0.0)
    workflow_steps = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    condition = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    approval_required = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

# Indexing optimizations
Index("idx_cases_status_priority", RecoveryCase.status, RecoveryCase.priority)
Index("idx_cases_amount_prob", RecoveryCase.amount_at_risk, RecoveryCase.recovery_probability)
Index("idx_audit_timestamp", AuditEvent.timestamp.desc())
