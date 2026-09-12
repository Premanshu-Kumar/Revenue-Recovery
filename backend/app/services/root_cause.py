from typing import Dict, Any, List

class RootCauseAnalysis:
    def __init__(self, root_cause: str, confidence: float, supporting_signals: List[str]):
        self.root_cause = root_cause
        self.confidence = confidence
        self.supporting_signals = supporting_signals

    def to_dict(self) -> Dict[str, Any]:
        return {
            "root_cause": self.root_cause,
            "confidence": self.confidence,
            "supporting_signals": self.supporting_signals
        }

class RootCauseClassifier:
    """
    Classifies root causes for payment failures, overdue invoices, subscriptions, and checkouts.
    """
    @staticmethod
    def classify(source_type: str, details: Dict[str, Any]) -> RootCauseAnalysis:
        failure_reason = str(details.get("failure_reason", "")).upper()
        days_overdue = int(details.get("days_overdue", 0))
        success_rate = float(details.get("payment_success_rate", 0.85))
        customer_health = str(details.get("customer_health", "Healthy"))
        stage = str(details.get("checkout_stage", "PAYMENT"))
        
        if source_type == "OVERDUE_INVOICE":
            if days_overdue <= 10 and success_rate > 0.8:
                return RootCauseAnalysis(
                    root_cause="FORGOTTEN_INVOICE",
                    confidence=0.92,
                    supporting_signals=[
                        f"Customer historically pays within {details.get('average_payment_delay', 4)} days",
                        f"High historical payment reliability ({int(success_rate*100)}%)",
                        f"Invoice is mildly overdue ({days_overdue} days)",
                        "No dispute opened on billing portal"
                    ]
                )
            elif days_overdue > 30 or customer_health == "Critical":
                return RootCauseAnalysis(
                    root_cause="CASH_FLOW_DELAY",
                    confidence=0.88,
                    supporting_signals=[
                        f"Invoice overdue by {days_overdue} days exceeding normal threshold",
                        f"Account marked with {customer_health} health indicator",
                        "Prolonged response latency on recent reminders"
                    ]
                )
            else:
                return RootCauseAnalysis(
                    root_cause="LATE_B2B_PAYMENT_CYCLE",
                    confidence=0.91,
                    supporting_signals=[
                        f"Customer normally processes vendor payouts on mid-month cycles",
                        f"{details.get('total_transactions', 12)} previous invoices successfully paid",
                        "Zero formal billing disputes reported",
                        f"Account active with ₹{details.get('lifetime_value', 840000):,.0f} LTV"
                    ]
                )

        elif source_type == "PAYMENT_FAILURE":
            if "INSUFFICIENT" in failure_reason:
                return RootCauseAnalysis(
                    root_cause="INSUFFICIENT_FUNDS",
                    confidence=0.94,
                    supporting_signals=[
                        "Direct issuer decline reason code: 51 (Insufficient Funds)",
                        "Customer has active recurring mandate authorization",
                        "High likelihood of replenishment within 48-72h salary/billing window"
                    ]
                )
            elif "EXPIRED" in failure_reason:
                return RootCauseAnalysis(
                    root_cause="EXPIRED_CARD",
                    confidence=0.98,
                    supporting_signals=[
                        "Card expiry date passed in gateway metadata",
                        "Customer has not updated primary billing instrument",
                        "Direct payment update link required"
                    ]
                )
            elif "AUTHENTICATION" in failure_reason or "OTP" in failure_reason:
                return RootCauseAnalysis(
                    root_cause="AUTHENTICATION_TIMEOUT",
                    confidence=0.89,
                    supporting_signals=[
                        "2FA OTP session expired during 3D-Secure challenge",
                        "Customer initiated transaction but abandoned OTP entry",
                        "Safe for automated retry or 1-click payment link"
                    ]
                )
            elif "PROCESSOR" in failure_reason or "BANK" in failure_reason:
                return RootCauseAnalysis(
                    root_cause="BANK_GATEWAY_DOWNTIME",
                    confidence=0.93,
                    supporting_signals=[
                        "Temporary 500/504 gateway response from issuing bank network",
                        "No account balance or authorization defect on customer side",
                        "Ideal candidate for exponential backoff retry"
                    ]
                )
            else:
                return RootCauseAnalysis(
                    root_cause="CARD_DECLINED_GENERIC",
                    confidence=0.84,
                    supporting_signals=[
                        "Bank issued generic decline response code 05",
                        "Requires fallback payment instrument or mandate re-authorization"
                    ]
                )

        elif source_type == "SUBSCRIPTION_FAILURE":
            return RootCauseAnalysis(
                root_cause="RECURRING_MANDATE_DEGRADATION",
                confidence=0.90,
                supporting_signals=[
                    "Auto-debit attempt failed on scheduled renewal date",
                    "Customer subscription is in Grace Period",
                    "Requires card update flow or UPI AutoPay re-link"
                ]
            )

        elif source_type == "CHECKOUT_ABANDONMENT":
            if stage == "PAYMENT":
                return RootCauseAnalysis(
                    root_cause="PAYMENT_FRICTION",
                    confidence=0.87,
                    supporting_signals=[
                        "User dropped off at final payment selection stage",
                        "High intent cart with multiple items",
                        "Checkout link recovery with 1-click payment offers optimal conversion"
                    ]
                )
            else:
                return RootCauseAnalysis(
                    root_cause="UNEXPECTED_COST_OR_DROP",
                    confidence=0.82,
                    supporting_signals=[
                        f"Session stalled at {stage} step",
                        "User navigated away without completing checkout"
                    ]
                )

        elif source_type == "PROMISE_TO_PAY":
            return RootCauseAnalysis(
                root_cause="BROKEN_PAYMENT_PROMISE",
                confidence=0.95,
                supporting_signals=[
                    "Customer agreed to settlement date but no transaction occurred",
                    "Grace period elapsed with zero confirmation",
                    "Priority upgraded to CRITICAL for direct human escalation"
                ]
            )

        return RootCauseAnalysis(
            root_cause="UNKNOWN_REVENUE_RISK",
            confidence=0.75,
            supporting_signals=["Generic risk signal detected in revenue ingestion stream"]
        )
