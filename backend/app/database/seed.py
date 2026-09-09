import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine, Base
from app.models.entities import (
    User, Customer, Payment, Invoice, Subscription, CheckoutSession,
    PromiseToPay, RecoveryCase, RecoveryAction, AIRecommendation,
    AuditEvent, Campaign, Policy, get_utc_now
)
from app.ml.model_pipeline import recovery_ml_pipeline
from app.policies.policy_engine import policy_engine
from app.services.root_cause import RootCauseClassifier
from app.services.scoring_engine import scoring_engine
from app.agents.recovery_agent import recovery_agent

def run_seed(reset: bool = True):
    print("🚀 Initializing RecoverAI Database Seed...")
    if reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        # 1. Create Default Users
        print("👤 Creating demo users...")
        users = [
            User(name="Premanshu Kumar", email="cfo@recoverai.demo", role="CFO", status="ACTIVE"),
            User(name="Rahul Verma", email="revops@recoverai.demo", role="Revenue Operations Manager", status="ACTIVE"),
            User(name="Aman Gupta", email="finance@recoverai.demo", role="Finance / Collections Lead", status="ACTIVE"),
            User(name="Sneha Patel", email="payops@recoverai.demo", role="Payment Operations Lead", status="ACTIVE"),
            User(name="Vikram Mehta", email="am@recoverai.demo", role="Senior Account Manager", status="ACTIVE"),
        ]
        db.add_all(users)
        db.flush()

        # 2. Create Default Policies
        print("🛡️ Creating deterministic governance policies...")
        policies = [
            Policy(name="Micro-Recovery Full Autonomy", condition="amount < 10000", action="AUTO_EXECUTE", approval_required=False, enabled=True),
            Policy(name="Mid-Value Limited Autonomy", condition="10000 <= amount <= 50000", action="LIMITED_AUTO_RETRY", approval_required=False, enabled=True),
            Policy(name="High-Value Financial Guardrail", condition="amount > 50000", action="HUMAN_APPROVAL_REQUIRED", approval_required=True, enabled=True),
            Policy(name="Gateway Retry Stopping Rule", condition="retry_attempts >= 3", action="BLOCK_RETRY", approval_required=False, enabled=True),
            Policy(name="Outreach Frequency Limit", condition="outreach_attempts >= 3", action="BLOCK_COMMUNICATION", approval_required=False, enabled=True),
            Policy(name="Customer Opt-Out Respect", condition="customer_opted_out == True", action="BLOCK_ALL", approval_required=False, enabled=True),
            Policy(name="Dispute Freeze Guardrail", condition="dispute_status != NONE", action="FREEZE_OUTREACH", approval_required=False, enabled=True)
        ]
        db.add_all(policies)

        # 3. Create Default Campaigns
        print("📢 Creating Recovery Campaigns...")
        campaigns = [
            Campaign(
                name="Failed Payment Instant Recovery",
                type="FAILED_PAYMENT",
                status="ACTIVE",
                total_cases=274,
                revenue_at_risk=485000.0,
                revenue_recovered=238000.0,
                workflow_steps=[
                    {"step": 1, "action": "PAYMENT_RETRY", "delay": "30m"},
                    {"step": 2, "action": "EMAIL_REMINDER", "delay": "2h"},
                    {"step": 3, "action": "WHATSAPP_REMINDER", "delay": "24h"}
                ]
            ),
            Campaign(
                name="B2B Receivables Chaser",
                type="OVERDUE_INVOICE",
                status="ACTIVE",
                total_cases=165,
                revenue_at_risk=840000.0,
                revenue_recovered=312000.0,
                workflow_steps=[
                    {"step": 1, "action": "EMAIL_REMINDER", "delay": "Immediate"},
                    {"step": 2, "action": "WAIT", "delay": "48h"},
                    {"step": 3, "action": "WHATSAPP_REMINDER", "delay": "24h"},
                    {"step": 4, "action": "ACCOUNT_MANAGER_ESCALATION", "delay": "5d"}
                ]
            ),
            Campaign(
                name="Subscription Dunning Sequencer",
                type="SUBSCRIPTION_RECOVERY",
                status="ACTIVE",
                total_cases=61,
                revenue_at_risk=185000.0,
                revenue_recovered=98000.0,
                workflow_steps=[
                    {"step": 1, "action": "PAYMENT_METHOD_UPDATE", "delay": "Immediate"},
                    {"step": 2, "action": "PAYMENT_RETRY", "delay": "24h"}
                ]
            ),
            Campaign(
                name="Checkout Drop-Off Re-engagement",
                type="CHECKOUT_ABANDONMENT",
                status="ACTIVE",
                total_cases=94,
                revenue_at_risk=210000.0,
                revenue_recovered=64000.0,
                workflow_steps=[
                    {"step": 1, "action": "CHECKOUT_REMINDER", "delay": "1h"},
                    {"step": 2, "action": "DISCOUNT_OFFER", "delay": "24h"}
                ]
            ),
            Campaign(
                name="Mandate Failure Auto-Retry",
                type="MANDATE_RECOVERY",
                status="ACTIVE",
                total_cases=31,
                revenue_at_risk=122600.0,
                revenue_recovered=42850.0,
                workflow_steps=[
                    {"step": 1, "action": "PAYMENT_RETRY", "delay": "12h"},
                    {"step": 2, "action": "WHATSAPP_REMINDER", "delay": "24h"}
                ]
            )
        ]
        db.add_all(campaigns)
        db.flush()

        # 4. Create Canonical Reference Case: ABC Technologies
        print("🏢 Seeding Canonical Scenario: ABC Technologies (RV-10284, INV-4821, ₹84,500)...")
        abc_customer = Customer(
            id=str(uuid.uuid4()),
            name="Rajesh Khanna",
            company="ABC Technologies",
            email="finance@abctechnologies.in",
            phone="+91 98201 48210",
            industry="Enterprise SaaS",
            country="India",
            segment="Enterprise",
            lifetime_value=840000.0,
            average_monthly_revenue=84500.0,
            payment_success_rate=0.93,
            average_payment_delay=5,
            total_transactions=14,
            successful_transactions=13,
            failed_transactions=1,
            dispute_count=0,
            customer_health="Healthy",
            preferred_channel="EMAIL",
            opted_out=False,
            status="ACTIVE",
            created_at=now - timedelta(days=240)
        )
        db.add(abc_customer)
        db.flush()

        abc_invoice = Invoice(
            id=str(uuid.uuid4()),
            invoice_number="INV-4821",
            customer_id=abc_customer.id,
            amount=84500.0,
            currency="INR",
            issue_date=now - timedelta(days=48),
            due_date=now - timedelta(days=18),
            paid_date=None,
            status="OVERDUE",
            days_overdue=18,
            dispute_status="NONE",
            created_at=now - timedelta(days=48)
        )
        db.add(abc_invoice)
        db.flush()

        # ABC Case creation
        abc_case = RecoveryCase(
            id=str(uuid.uuid4()),
            case_number="RV-10284",
            customer_id=abc_customer.id,
            source_type="OVERDUE_INVOICE",
            source_id=abc_invoice.id,
            amount_at_risk=84500.0,
            recovered_amount=0.0,
            days_overdue=18,
            recovery_probability=0.82,
            expected_recovery=69290.0,
            recovery_score=94,
            priority="CRITICAL",
            root_cause="LATE_B2B_PAYMENT_CYCLE",
            root_cause_confidence=0.91,
            recommended_action="EMAIL_REMINDER",
            policy_status="APPROVAL_REQUIRED",
            policy_reason="High-Value Guardrail: Amount (₹84,500) exceeds autonomous recovery ceiling (₹50,000). Human approval mandatory.",
            status="Approval Required",
            outreach_attempts=0,
            retry_attempts=0,
            baseline_recovered_amount=0.0,
            created_at=now - timedelta(hours=2)
        )
        db.add(abc_case)
        db.flush()

        abc_rec = AIRecommendation(
            case_id=abc_case.id,
            diagnosis="Late B2B payment cycle. Client historically pays within 5-7 days; 13 previous invoices settled reliably. Account is active with ₹8.4L LTV.",
            recommendation="EMAIL_REMINDER",
            confidence=0.91,
            reasoning_summary="High-value enterprise account with strong relationship history. Progressive sequence starting with executive reminder ensures prompt settlement without friction.",
            supporting_signals=[
                "Customer normally pays within 5 days",
                "13 previous invoices were successfully paid",
                "Zero dispute history on record",
                "Account remains active and healthy",
                "Current invoice is 18 days overdue"
            ],
            multi_step_strategy=[
                {"step": 1, "action": "EMAIL_REMINDER", "timing": "Immediate executive reminder", "channel": "EMAIL"},
                {"step": 2, "action": "WAIT", "timing": "Wait 48 hours for billing cycle processing", "channel": "SYSTEM"},
                {"step": 3, "action": "WHATSAPP_REMINDER", "timing": "Direct follow-up to Accounts Payable", "channel": "WHATSAPP"},
                {"step": 4, "action": "ACCOUNT_MANAGER_ESCALATION", "timing": "+5 days for warm outreach", "channel": "INTERNAL"}
            ],
            generated_copy={
                "en": recovery_agent.generate_communication("Rajesh Khanna", "ABC Technologies", 84500.0, "INV-4821", 18, "English")["body"],
                "hi": recovery_agent.generate_communication("Rajesh Khanna", "ABC Technologies", 84500.0, "INV-4821", 18, "Hindi")["body"],
                "hinglish": recovery_agent.generate_communication("Rajesh Khanna", "ABC Technologies", 84500.0, "INV-4821", 18, "Hinglish")["body"]
            }
        )
        db.add(abc_rec)

        abc_audit = AuditEvent(
            case_id=abc_case.id,
            event_type="CASE_DETECTED",
            actor="Revenue Risk Detector",
            action="Detected Overdue Invoice Risk (₹84,500)",
            reason="Invoice INV-4821 is 18 days past due. AI computed 82% recovery probability (₹69,290 expected).",
            audit_metadata={"amount": 84500, "probability": 0.82, "score": 94, "policy": "APPROVAL_REQUIRED"},
            result="PENDING_APPROVAL",
            timestamp=now - timedelta(hours=2)
        )
        db.add(abc_audit)

        # 5. Generate 500+ Synthetic Customers
        print("👥 Generating 500 synthetic customer accounts...")
        companies = [
            "Nova Retail Labs", "Orbit Labs", "Vertex Systems", "Krypton Cloud", "Zephyr Media",
            "Zenith FinTech", "Pulse Logistics", "Nexus Analytics", "Aura Health", "Starlight AI",
            "BluePeak Global", "Quantum Scale", "Solstice Media", "HyperDrive Motors", "Echo Infotech",
            "Crestline B2B", "Lumina Design", "Vanguard Infra", "Titan Robotics", "Horizon Dynamics",
            "AlphaWave Tech", "Stratum Software", "Silverline Capital", "OmniCore Networks", "Proxima Cloud"
        ]
        first_names = ["Aarav", "Aditi", "Rohan", "Pooja", "Vikram", "Ananya", "Karan", "Divya", "Siddharth", "Meera", "Arjun", "Neha"]
        last_names = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Mehta", "Gupta", "Iyer", "Joshi", "Bose", "Kulkarni", "Singh"]
        industries = ["Enterprise SaaS", "E-Commerce", "FinTech", "Healthcare", "EdTech", "Logistics", "Media & Entertainment"]
        segments = ["Enterprise", "Mid-Market", "SMB", "Startup"]

        customer_objs = [abc_customer]
        for i in range(1, 520):
            seg = random.choices(segments, weights=[0.15, 0.35, 0.35, 0.15])[0]
            if seg == "Enterprise":
                ltv = random.uniform(500000, 2500000)
                mrr = ltv / random.uniform(12, 24)
            elif seg == "Mid-Market":
                ltv = random.uniform(150000, 600000)
                mrr = ltv / random.uniform(10, 18)
            elif seg == "SMB":
                ltv = random.uniform(40000, 150000)
                mrr = ltv / random.uniform(6, 12)
            else:
                ltv = random.uniform(15000, 50000)
                mrr = ltv / random.uniform(4, 8)

            c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            base_comp = random.choice(companies)
            comp_name = f"{base_comp} {i}" if i > len(companies) else base_comp
            
            tot_tx = random.randint(5, 50)
            success_rate = random.choices([0.95, 0.88, 0.78, 0.60], weights=[0.6, 0.25, 0.1, 0.05])[0]
            succ_tx = int(tot_tx * success_rate)
            fail_tx = tot_tx - succ_tx
            
            health = "Healthy" if success_rate >= 0.85 else ("At Risk" if success_rate >= 0.7 else "Critical")
            
            cust = Customer(
                id=str(uuid.uuid4()),
                name=c_name,
                company=comp_name,
                email=f"{c_name.lower().replace(' ', '.')}@{comp_name.lower().replace(' ', '')}.com",
                phone=f"+91 {random.randint(90000, 99999)} {random.randint(10000, 99999)}",
                industry=random.choice(industries),
                country="India",
                segment=seg,
                lifetime_value=round(ltv, 2),
                average_monthly_revenue=round(mrr, 2),
                payment_success_rate=round(success_rate, 2),
                average_payment_delay=random.randint(1, 14),
                total_transactions=tot_tx,
                successful_transactions=succ_tx,
                failed_transactions=fail_tx,
                dispute_count=0 if random.random() > 0.08 else 1,
                customer_health=health,
                preferred_channel=random.choice(["EMAIL", "WHATSAPP", "PHONE"]),
                opted_out=(random.random() < 0.02),
                status="ACTIVE",
                created_at=now - timedelta(days=random.randint(30, 720))
            )
            customer_objs.append(cust)
            db.add(cust)

        db.flush()

        # 6. Generate 5,000+ Payments
        print("💳 Generating 5,000 payment transaction records...")
        payment_methods = ["CREDIT_CARD", "UPI", "NETBANKING", "NACH", "DEBIT_CARD"]
        failure_reasons = [
            "INSUFFICIENT_FUNDS", "EXPIRED_CARD", "CARD_DECLINED",
            "PROCESSOR_ERROR", "AUTHENTICATION_FAILED", "BANK_ERROR", "MANDATE_FAILURE"
        ]
        
        failed_payment_objs = []
        for i in range(5100):
            cust = random.choice(customer_objs)
            # Weighted payment status
            status = random.choices(["SUCCESS", "FAILED", "PENDING", "REFUNDED"], weights=[0.82, 0.14, 0.03, 0.01])[0]
            
            if cust.segment == "Enterprise":
                amt = random.uniform(25000, 150000)
            elif cust.segment == "Mid-Market":
                amt = random.uniform(8000, 45000)
            else:
                amt = random.uniform(1500, 15000)

            fail_reason = random.choice(failure_reasons) if status == "FAILED" else None
            p = Payment(
                customer_id=cust.id,
                amount=round(amt, 2),
                currency="INR",
                payment_method=random.choice(payment_methods),
                status=status,
                failure_reason=fail_reason,
                processor="Razorpay",
                retry_count=random.randint(0, 2) if status == "FAILED" else 0,
                created_at=now - timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
            )
            db.add(p)
            if status == "FAILED":
                failed_payment_objs.append(p)
                
        db.flush()

        # 7. Generate 2,000+ Invoices
        print("🧾 Generating 2,000 invoices with aging buckets...")
        overdue_invoices = [abc_invoice]
        for i in range(1, 2050):
            cust = random.choice(customer_objs)
            status = random.choices(["PAID", "OPEN", "OVERDUE", "DISPUTED"], weights=[0.75, 0.12, 0.11, 0.02])[0]
            
            days_ago = random.randint(10, 180)
            issue_d = now - timedelta(days=days_ago)
            due_d = issue_d + timedelta(days=30)
            
            days_overdue = max(0, (now - due_d).days) if status in ["OVERDUE", "DISPUTED"] else 0
            if cust.segment == "Enterprise":
                amt = random.uniform(40000, 220000)
            elif cust.segment == "Mid-Market":
                amt = random.uniform(15000, 65000)
            else:
                amt = random.uniform(3000, 25000)

            inv = Invoice(
                invoice_number=f"INV-{20000 + i}",
                customer_id=cust.id,
                amount=round(amt, 2),
                currency="INR",
                issue_date=issue_d,
                due_date=due_d,
                paid_date=(due_d - timedelta(days=2)) if status == "PAID" else None,
                status=status,
                days_overdue=days_overdue,
                dispute_status="UNDER_REVIEW" if status == "DISPUTED" else "NONE",
                created_at=issue_d
            )
            db.add(inv)
            if status == "OVERDUE":
                overdue_invoices.append(inv)

        db.flush()

        # 8. Generate 500 Subscriptions
        print("🔁 Generating 500 subscriptions...")
        failed_subs = []
        for i in range(520):
            cust = random.choice(customer_objs)
            status = random.choices(["ACTIVE", "PAST_DUE", "CANCELLED"], weights=[0.82, 0.12, 0.06])[0]
            plan = random.choice(["Starter", "Growth", "Business", "Enterprise"])
            monthly_amt = 2999.0 if plan == "Starter" else (7999.0 if plan == "Growth" else (19999.0 if plan == "Business" else 49999.0))
            
            sub = Subscription(
                customer_id=cust.id,
                plan=plan,
                monthly_amount=monthly_amt,
                status=status,
                start_date=now - timedelta(days=random.randint(60, 400)),
                renewal_date=now + timedelta(days=random.randint(1, 30)) if status == "ACTIVE" else (now - timedelta(days=random.randint(1, 15))),
                payment_method=random.choice(["CREDIT_CARD", "NACH", "UPI"]),
                failure_reason=random.choice(["CARD_EXPIRED", "INSUFFICIENT_FUNDS", "MANDATE_DECLINED"]) if status == "PAST_DUE" else None,
                failed_renewal_count=random.randint(1, 3) if status == "PAST_DUE" else 0,
                created_at=now - timedelta(days=random.randint(60, 400))
            )
            db.add(sub)
            if status == "PAST_DUE":
                failed_subs.append(sub)

        db.flush()

        # 9. Generate 1,500 Checkout Sessions
        print("🛒 Generating 1,500 checkout sessions...")
        abandoned_checkouts = []
        for i in range(1550):
            cust = random.choice(customer_objs)
            status = random.choices(["COMPLETED", "ABANDONED", "EXPIRED"], weights=[0.68, 0.25, 0.07])[0]
            stage = random.choice(["PAYMENT", "REVIEW", "ADDRESS", "CART"]) if status != "COMPLETED" else "REVIEW"
            
            chk = CheckoutSession(
                customer_id=cust.id,
                cart_value=round(random.uniform(2500, 35000), 2),
                items_count=random.randint(1, 6),
                started_at=now - timedelta(hours=random.randint(1, 120)),
                last_activity_at=now - timedelta(hours=random.randint(1, 120)),
                checkout_stage=stage,
                device_type=random.choice(["DESKTOP", "MOBILE", "TABLET"]),
                traffic_source=random.choice(["Direct", "Google Ads", "Organic Search", "Email Campaign"]),
                status=status,
                created_at=now - timedelta(hours=random.randint(1, 120))
            )
            db.add(chk)
            if status == "ABANDONED":
                abandoned_checkouts.append(chk)

        db.flush()

        # 10. Generate 200 Promise to Pay records
        print("🤝 Generating 200 Promise to Pay commitments...")
        broken_promises = []
        for i in range(210):
            cust = random.choice(customer_objs)
            status = random.choices(["ACTIVE", "FULFILLED", "BROKEN"], weights=[0.35, 0.45, 0.20])[0]
            prom = PromiseToPay(
                customer_id=cust.id,
                promised_amount=round(random.uniform(10000, 75000), 2),
                promise_date=now - timedelta(days=random.randint(1, 10)) if status == "BROKEN" else (now + timedelta(days=random.randint(1, 14))),
                status=status,
                created_at=now - timedelta(days=random.randint(5, 30))
            )
            db.add(prom)
            if status == "BROKEN":
                broken_promises.append(prom)

        db.flush()

        # 11. Create ~1,000 Realistic Recovery Cases with Full ML Predictions & Audit Trails
        print("⚡ Synthesizing 1,000+ AI Recovery Cases across risk categories...")
        
        # Breakdown targets:
        # 274 payment failures, 165 overdue invoices, 94 checkout abandonments, 61 subscription failures, 31 mandate failures, etc.
        case_candidates = []
        
        for p in failed_payment_objs[:274]:
            case_candidates.append({
                "source_type": "PAYMENT_FAILURE",
                "source_id": p.id,
                "customer_id": p.customer_id,
                "amount": p.amount,
                "days_overdue": random.randint(1, 12),
                "failure_reason": p.failure_reason or "INSUFFICIENT_FUNDS",
                "created_at": p.created_at
            })

        for inv in overdue_invoices[1:166]: # skip 0 since abc_invoice is seeded
            case_candidates.append({
                "source_type": "OVERDUE_INVOICE",
                "source_id": inv.id,
                "customer_id": inv.customer_id,
                "amount": inv.amount,
                "days_overdue": inv.days_overdue,
                "failure_reason": "LATE_PAYMENT",
                "created_at": inv.created_at
            })

        for chk in abandoned_checkouts[:94]:
            case_candidates.append({
                "source_type": "CHECKOUT_ABANDONMENT",
                "source_id": chk.id,
                "customer_id": chk.customer_id,
                "amount": chk.cart_value,
                "days_overdue": 1,
                "failure_reason": "PAYMENT_FRICTION",
                "created_at": chk.created_at
            })

        for sub in failed_subs[:61]:
            case_candidates.append({
                "source_type": "SUBSCRIPTION_FAILURE",
                "source_id": sub.id,
                "customer_id": sub.customer_id,
                "amount": sub.monthly_amount,
                "days_overdue": random.randint(2, 18),
                "failure_reason": sub.failure_reason or "MANDATE_DECLINED",
                "created_at": sub.created_at
            })

        for prom in broken_promises[:31]:
            case_candidates.append({
                "source_type": "PROMISE_TO_PAY",
                "source_id": prom.id,
                "customer_id": prom.customer_id,
                "amount": prom.promised_amount,
                "days_overdue": random.randint(3, 14),
                "failure_reason": "BROKEN_PROMISE",
                "created_at": prom.created_at
            })

        # Fill up to ~1,000 cases with realistic distributions
        remaining_needed = 1000 - (len(case_candidates) + 1)
        for i in range(max(0, remaining_needed)):
            cust = random.choice(customer_objs)
            st = random.choices(
                ["PAYMENT_FAILURE", "OVERDUE_INVOICE", "SUBSCRIPTION_FAILURE", "CHECKOUT_ABANDONMENT", "MANDATE_FAILURE"],
                weights=[0.4, 0.25, 0.15, 0.12, 0.08]
            )[0]
            amt = random.uniform(1500, 65000)
            case_candidates.append({
                "source_type": st,
                "source_id": str(uuid.uuid4()),
                "customer_id": cust.id,
                "amount": round(amt, 2),
                "days_overdue": random.randint(1, 35),
                "failure_reason": "PROCESSOR_ERROR" if st == "PAYMENT_FAILURE" else "LATE_PAYMENT",
                "created_at": now - timedelta(days=random.randint(1, 45))
            })

        # Process each candidate through ML model, scoring engine, policy engine, and simulator
        recovered_count = 0
        total_target_recovered = 380 # have ~38% recovered already in historical batch
        
        for idx, cand in enumerate(case_candidates):
            cust = db.query(Customer).filter(Customer.id == cand["customer_id"]).first()
            if not cust:
                continue

            amt = cand["amount"]
            days_ov = cand["days_overdue"]
            st = cand["source_type"]
            fr = cand["failure_reason"]
            
            root_res = RootCauseClassifier.classify(st, {
                "failure_reason": fr,
                "days_overdue": days_ov,
                "payment_success_rate": cust.payment_success_rate,
                "customer_health": cust.customer_health,
                "average_payment_delay": cust.average_payment_delay,
                "total_transactions": cust.total_transactions,
                "lifetime_value": cust.lifetime_value,
                "customer_segment": cust.segment,
                "amount_at_risk": amt,
                "source_type": st
            })

            ml_features = {
                "amount_at_risk": amt,
                "days_overdue": days_ov,
                "customer_ltv": cust.lifetime_value,
                "payment_success_rate": cust.payment_success_rate,
                "previous_failure_count": cust.failed_transactions,
                "previous_recovery_count": max(0, cust.successful_transactions - 1),
                "average_payment_delay": cust.average_payment_delay,
                "communication_engagement": 0.85 if cust.customer_health == "Healthy" else 0.45,
                "failure_reason": fr,
                "customer_segment": cust.segment,
                "customer_health": cust.customer_health,
                "source_type": st
            }
            rec_prob = recovery_ml_pipeline.predict_probability(ml_features)
            expected_rec = scoring_engine.calculate_expected_recovery(amt, rec_prob)
            rec_score = scoring_engine.calculate_recovery_score(
                amount_at_risk=amt,
                recovery_probability=rec_prob,
                customer_ltv=cust.lifetime_value,
                payment_success_rate=cust.payment_success_rate,
                days_overdue=days_ov,
                customer_health=cust.customer_health,
                is_broken_promise=(st == "PROMISE_TO_PAY")
            )
            priority = scoring_engine.determine_priority(rec_score, expected_rec, days_ov)
            
            rec_output = recovery_agent.formulate_recommendation(
                source_type=st,
                root_cause=root_res.root_cause,
                amount=amt,
                days_overdue=days_ov,
                customer_health=cust.customer_health,
                preferred_channel=cust.preferred_channel
            )
            
            policy_eval = policy_engine.evaluate({
                "amount_at_risk": amt,
                "outreach_attempts": 0,
                "retry_attempts": 0,
                "customer_opted_out": cust.opted_out,
                "dispute_status": getattr(cust, "dispute_status", "NONE"),
                "customer_health": cust.customer_health,
                "source_type": st,
                "recommended_action": rec_output["recommended_action"]
            })

            # Historical state distribution (some recovered, some in progress, some approval required, some detected)
            is_historical_recovered = (recovered_count < total_target_recovered and rec_prob > 0.65 and not policy_eval.is_blocked)
            if is_historical_recovered:
                recovered_count += 1
                c_status = "Recovered"
                rec_amount = amt
                baseline_amt = round(amt * 0.47, 2)
            elif policy_eval.requires_approval:
                c_status = "Approval Required"
                rec_amount = 0.0
                baseline_amt = 0.0
            elif random.random() < 0.3:
                c_status = "Recovery In Progress"
                rec_amount = 0.0
                baseline_amt = 0.0
            else:
                c_status = "Detected"
                rec_amount = 0.0
                baseline_amt = 0.0

            case_num = f"RV-{20000 + idx}"
            case_entity = RecoveryCase(
                case_number=case_num,
                customer_id=cust.id,
                source_type=st,
                source_id=cand["source_id"],
                amount_at_risk=amt,
                recovered_amount=rec_amount,
                days_overdue=days_ov,
                recovery_probability=rec_prob,
                expected_recovery=expected_rec,
                recovery_score=rec_score,
                priority=priority,
                root_cause=root_res.root_cause,
                root_cause_confidence=root_res.confidence,
                recommended_action=rec_output["recommended_action"],
                policy_status=policy_eval.status,
                policy_reason=policy_eval.reason,
                status=c_status,
                outreach_attempts=1 if c_status in ["Recovered", "Recovery In Progress"] else 0,
                retry_attempts=1 if (c_status in ["Recovered", "Recovery In Progress"] and rec_output["recommended_action"] == "PAYMENT_RETRY") else 0,
                baseline_recovered_amount=baseline_amt,
                created_at=cand["created_at"]
            )
            db.add(case_entity)
            db.flush()

            # Recommendation
            ai_rec = AIRecommendation(
                case_id=case_entity.id,
                diagnosis=f"{root_res.root_cause}: Identified from {st.lower().replace('_', ' ')} event.",
                recommendation=rec_output["recommended_action"],
                confidence=root_res.confidence,
                reasoning_summary=rec_output["reasoning"],
                supporting_signals=root_res.supporting_signals,
                multi_step_strategy=rec_output["strategy"]
            )
            db.add(ai_rec)

            # Audit Event
            audit_e = AuditEvent(
                case_id=case_entity.id,
                event_type="PAYMENT_RECOVERED" if c_status == "Recovered" else "CASE_DETECTED",
                actor="RecoverAI Agent" if c_status == "Recovered" else "Revenue Risk Detector",
                action=f"Recovered ₹{rec_amount:,.2f}" if c_status == "Recovered" else f"Detected {st} risk of ₹{amt:,.2f}",
                reason=f"Recovery workflow settled via {rec_output['recommended_action']}" if c_status == "Recovered" else f"Identified {root_res.root_cause}",
                audit_metadata={
                    "case_number": case_num,
                    "amount": amt,
                    "probability": rec_prob,
                    "status": c_status
                },
                result="RECOVERED" if c_status == "Recovered" else "DETECTED",
                timestamp=cand["created_at"]
            )
            db.add(audit_e)

        db.commit()
        print("✅ Database successfully seeded with 1,000+ realistic recovery records!")
        
        # Verify aggregate metrics
        total_risk = sum(c.amount_at_risk for c in db.query(RecoveryCase).all())
        total_rec = sum(c.recovered_amount for c in db.query(RecoveryCase).all())
        print(f"📊 Total Revenue At Risk: ₹{total_risk:,.2f}")
        print(f"💰 Total Revenue Recovered: ₹{total_rec:,.2f}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed(reset=True)
