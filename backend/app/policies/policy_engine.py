from typing import Dict, Any, Tuple
from app.config import settings

class PolicyEvaluationResult:
    def __init__(self, status: str, reason: str, requires_approval: bool = False, is_blocked: bool = False):
        self.status = status # "ALLOWED", "APPROVAL_REQUIRED", "BLOCKED"
        self.reason = reason
        self.requires_approval = requires_approval
        self.is_blocked = is_blocked

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "reason": self.reason,
            "requires_approval": self.requires_approval,
            "is_blocked": self.is_blocked
        }

class PolicyEngine:
    def __init__(self):
        self.auto_limit = settings.AUTO_RECOVERY_THRESHOLD_INR
        self.limited_limit = settings.LIMITED_RECOVERY_THRESHOLD_INR
        self.max_retries = settings.MAX_RETRY_ATTEMPTS
        self.max_outreach = settings.MAX_OUTREACH_ATTEMPTS

    def evaluate(self, case_data: Dict[str, Any], action_type: str = None) -> PolicyEvaluationResult:
        """
        Deterministic evaluation of recovery actions against governance rules.
        """
        amount = float(case_data.get("amount_at_risk", 0.0))
        outreach_attempts = int(case_data.get("outreach_attempts", 0))
        retry_attempts = int(case_data.get("retry_attempts", 0))
        customer_opted_out = bool(case_data.get("customer_opted_out", False))
        dispute_status = str(case_data.get("dispute_status", "NONE"))
        customer_health = str(case_data.get("customer_health", "Healthy"))
        source_type = str(case_data.get("source_type", "OVERDUE_INVOICE"))
        action = action_type or str(case_data.get("recommended_action", "EMAIL_REMINDER"))

        # Rule 1: Customer Opted Out
        if customer_opted_out:
            return PolicyEvaluationResult(
                status="BLOCKED",
                reason="Policy Violation: Customer has explicitly opted out of automated communications.",
                is_blocked=True
            )

        # Rule 2: Active Invoice Dispute
        if dispute_status in ["UNDER_REVIEW", "DISPUTED"]:
            return PolicyEvaluationResult(
                status="BLOCKED",
                reason="Policy Violation: Active dispute detected on invoice. Outreach blocked pending dispute resolution.",
                is_blocked=True
            )

        # Rule 3: Stopping Rule on Retries
        if action == "PAYMENT_RETRY" and retry_attempts >= self.max_retries:
            return PolicyEvaluationResult(
                status="BLOCKED",
                reason=f"Stopping Rule: Maximum gateway retry attempts ({self.max_retries}) exceeded to prevent chargeback penalties.",
                is_blocked=True
            )

        # Rule 4: Stopping Rule on Communications
        if action in ["EMAIL_REMINDER", "WHATSAPP_REMINDER", "CHECKOUT_REMINDER"] and outreach_attempts >= self.max_outreach:
            return PolicyEvaluationResult(
                status="BLOCKED",
                reason=f"Stopping Rule: Maximum outreach frequency ({self.max_outreach}) reached for this billing cycle.",
                is_blocked=True
            )

        # Rule 5: High Value Invoice / Transaction threshold (> ₹50,000)
        if amount > self.limited_limit:
            return PolicyEvaluationResult(
                status="APPROVAL_REQUIRED",
                reason=f"High-Value Guardrail: Amount (₹{amount:,.0f}) exceeds autonomous recovery ceiling (₹{self.limited_limit:,.0f}). CFO / Human approval mandatory.",
                requires_approval=True
            )

        # Rule 6: Critical Account with Broken Promise or High Priority
        if customer_health == "Critical" and amount > 25000:
            return PolicyEvaluationResult(
                status="APPROVAL_REQUIRED",
                reason="Relationship Guardrail: Account marked Critical health. Account Manager sign-off required prior to automated outreach.",
                requires_approval=True
            )

        # Rule 7: Discount offer or write-off action
        if action in ["DISCOUNT_OFFER", "ACCOUNT_MANAGER_ESCALATION", "FINANCE_ESCALATION"]:
            return PolicyEvaluationResult(
                status="APPROVAL_REQUIRED",
                reason="Financial Guardrail: Commercial incentive or executive escalation requires manager verification.",
                requires_approval=True
            )

        # Rule 8: Medium Value (₹10,000 - ₹50,000)
        if amount > self.auto_limit:
            return PolicyEvaluationResult(
                status="ALLOWED",
                reason=f"Limited Autonomous Range (₹{self.auto_limit:,.0f} - ₹{self.limited_limit:,.0f}): Permitted within predefined templates and gateway retries.",
                requires_approval=False
            )

        # Rule 9: Low Value (< ₹10,000)
        return PolicyEvaluationResult(
            status="ALLOWED",
            reason=f"Full Autonomous Recovery (₹{amount:,.0f} < ₹{self.auto_limit:,.0f}): Permitted by default safety rules.",
            requires_approval=False
        )

# Global singleton
policy_engine = PolicyEngine()
