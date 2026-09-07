# RecoverAI Technical Architecture & Systems Design

## System Overview
RecoverAI is structured around an asynchronous, bounded-autonomy microservices architecture. It decouples machine learning inference, natural language generation, and deterministic policy evaluation to ensure zero unrestricted financial actions.

## 1. Machine Learning Recovery Probability Pipeline (`app.ml.model_pipeline`)
- **Algorithm**: `GradientBoostingClassifier` with ensemble tree pruning and ColumnTransformer preprocessing.
- **Input Feature Vector**:
  - `amount_at_risk` (Float)
  - `days_overdue` (Integer)
  - `customer_ltv` (Float)
  - `payment_success_rate` (Float $[0, 1]$)
  - `previous_failure_count` (Integer)
  - `previous_recovery_count` (Integer)
  - `average_payment_delay` (Integer)
  - `communication_engagement` (Float $[0, 1]$)
  - `failure_reason` (OneHot categorical)
  - `customer_segment` (OneHot categorical)
  - `customer_health` (OneHot categorical)
  - `source_type` (OneHot categorical)
- **Output**: Calibrated recovery probability $P(\text{Recovery}) \in [0.05, 0.98]$.
- **Prioritization Formula**:
  $$\text{Expected Recovery} = \text{Amount At Risk} \times P(\text{Recovery})$$
  $$\text{Recovery Score} = f(\text{Expected Value}, P(\text{Recovery}), \text{LTV}, \text{Urgency}) \in [0, 100]$$

## 2. Deterministic Policy Engine (`app.policies.policy_engine`)
The policy engine evaluates every candidate recovery intervention against deterministic business constraints before execution:
1. `amount < 10000` $\implies$ **ALLOWED** (Full Autonomy)
2. `10000 <= amount <= 50000` $\implies$ **ALLOWED** (Limited Autonomy via gateway retries & email templates)
3. `amount > 50000` $\implies$ **APPROVAL_REQUIRED** (Human / CFO sign-off mandatory)
4. `retry_attempts >= 3` $\implies$ **BLOCKED** (Prevents bank network penalties)
5. `outreach_attempts >= 3` $\implies$ **BLOCKED** (Prevents dunning fatigue)
6. `dispute_status != NONE` $\implies$ **BLOCKED** (Freezes collection during billing disputes)
7. `customer_opted_out == True` $\implies$ **BLOCKED** (Compliance with regulatory opt-outs)

## 3. Recovery Simulation & Baseline Lift Engine (`app.workflows.recovery_simulator`)
- **Naive Baseline Strategy**: Single gateway retry + single email reminder $\implies$ captures $\approx 47\%$ of at-risk volume.
- **RecoverAI Autonomous Strategy**: Dynamic timing, adaptive exponential backoff, WhatsApp instant pay links, Hinglish conversational copy, account manager escalation $\implies$ captures $\approx 82\%$ of at-risk volume.
- **AI Lift Calculation**:
  $$\text{Incremental Recovery} = \text{RecoverAI Recovered} - \text{Baseline Recovered}$$
  $$\text{AI Lift (\%)} = \left( \frac{\text{Incremental Recovery}}{\text{Baseline Recovered}} \right) \times 100 \approx +111\%$$

## 4. Immutable Audit Logging (`app.services.audit_service`)
Every action produces an immutable audit record containing:
- `event_type`: `CASE_CREATED`, `AI_DIAGNOSIS`, `POLICY_CHECKED`, `APPROVAL_GRANTED`, `ACTION_EXECUTED`, `PAYMENT_RECOVERED`, etc.
- `actor`: `RecoverAI Agent`, `Policy Engine`, `Premanshu Kumar (CFO)`, `Batch Simulation Engine`
- `reason`: Full textual explainability rationale
- `audit_metadata`: JSON payload of inputs, model probabilities, and state transitions
