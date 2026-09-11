import numpy as np
from typing import Dict, Any, Tuple

class ScoringEngine:
    @staticmethod
    def calculate_expected_recovery(amount_at_risk: float, recovery_probability: float) -> float:
        """
        Expected Recovery = Amount At Risk * Recovery Probability
        """
        return round(float(amount_at_risk * recovery_probability), 2)

    @staticmethod
    def calculate_recovery_score(
        amount_at_risk: float,
        recovery_probability: float,
        customer_ltv: float,
        payment_success_rate: float,
        days_overdue: int,
        customer_health: str,
        is_broken_promise: bool = False
    ) -> int:
        """
        Computes a composite priority recovery score between 0 and 100.
        Factors:
        - Expected recovery weight (40%)
        - Recovery probability (25%)
        - Customer LTV & relationship health (20%)
        - Urgency / Days overdue (15%)
        """
        # 1. Financial impact factor (0-40)
        # Log scale for amount (e.g. ₹1k -> ~10, ₹50k -> ~30, ₹100k+ -> 40)
        amount_factor = min(40.0, np.log10(max(100.0, amount_at_risk)) * 8.0)
        
        # 2. Probability factor (0-25)
        prob_factor = recovery_probability * 25.0
        
        # 3. Customer value factor (0-20)
        health_bonus = 5.0 if customer_health == "Healthy" else (-5.0 if customer_health == "Critical" else 0.0)
        rel_factor = (payment_success_rate * 15.0) + health_bonus
        rel_factor = max(0.0, min(20.0, rel_factor))
        
        # 4. Urgency factor (0-15)
        if days_overdue <= 7:
            urgency_factor = 14.0 # fresh opportunity -> high urgency to recover quickly
        elif days_overdue <= 30:
            urgency_factor = 11.0
        elif days_overdue <= 60:
            urgency_factor = 7.0
        else:
            urgency_factor = 4.0
            
        if is_broken_promise:
            urgency_factor += 5.0

        raw_score = amount_factor + prob_factor + rel_factor + urgency_factor
        final_score = int(round(np.clip(raw_score, 5.0, 99.0)))
        return final_score

    @staticmethod
    def determine_priority(recovery_score: int, expected_recovery: float, days_overdue: int) -> str:
        """
        Categorizes case priority into CRITICAL, HIGH, MEDIUM, LOW.
        """
        if recovery_score >= 85 or (expected_recovery >= 50000 and days_overdue >= 14):
            return "CRITICAL"
        elif recovery_score >= 68 or expected_recovery >= 25000:
            return "HIGH"
        elif recovery_score >= 45:
            return "MEDIUM"
        else:
            return "LOW"

scoring_engine = ScoringEngine()
