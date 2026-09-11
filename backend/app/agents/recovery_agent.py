from typing import Dict, Any, List

class RecoveryAgent:
    """
    AI Recovery Agent responsible for diagnosis synthesis, multi-step intervention strategy formulation,
    and localized multi-lingual communication generation.
    """

    @staticmethod
    def formulate_recommendation(
        source_type: str,
        root_cause: str,
        amount: float,
        days_overdue: int,
        customer_health: str,
        preferred_channel: str = "EMAIL"
    ) -> Dict[str, Any]:
        """
        Synthesizes the optimal first action, multi-step sequence, and explainable rationale.
        """
        # Baseline deterministic recommendation logic
        if source_type == "PAYMENT_FAILURE":
            if root_cause in ["BANK_GATEWAY_DOWNTIME", "PROCESSOR_ERROR"]:
                primary_action = "PAYMENT_RETRY"
                strategy = [
                    {"step": 1, "action": "PAYMENT_RETRY", "timing": "Immediate with Smart Exponential Backoff (30m)", "channel": "GATEWAY"},
                    {"step": 2, "action": "EMAIL_NOTIFICATION", "timing": "+2 hours if retry fails", "channel": "EMAIL"},
                    {"step": 3, "action": "PAYMENT_METHOD_UPDATE", "timing": "+24 hours", "channel": "WHATSAPP"}
                ]
                reasoning = "Root cause is upstream bank gateway latency. Initiating automated retry with backoff sequence avoids unnecessary customer friction."
            elif root_cause == "EXPIRED_CARD":
                primary_action = "PAYMENT_METHOD_UPDATE"
                strategy = [
                    {"step": 1, "action": "PAYMENT_METHOD_UPDATE", "timing": "Immediate", "channel": "EMAIL"},
                    {"step": 2, "action": "WHATSAPP_REMINDER", "timing": "+24 hours with 1-click update link", "channel": "WHATSAPP"},
                    {"step": 3, "action": "ACCOUNT_MANAGER_ESCALATION", "timing": "+72 hours if unchanged", "channel": "INTERNAL"}
                ]
                reasoning = "Instrument is expired. Direct card update flow via authenticated link has 78% historical completion within 24h."
            else: # Insufficient funds / auth failed
                primary_action = "PAYMENT_RETRY"
                strategy = [
                    {"step": 1, "action": "WAIT", "timing": "48 hours (align with replenishment cycle)", "channel": "SYSTEM"},
                    {"step": 2, "action": "PAYMENT_RETRY", "timing": "Attempt 2 at optimal hour", "channel": "GATEWAY"},
                    {"step": 3, "action": "WHATSAPP_REMINDER", "timing": "Follow-up if retry declines", "channel": "WHATSAPP"}
                ]
                reasoning = "Temporary insufficient funds. Waiting 48h before retry maximizes transaction success rate to 84%."

        elif source_type == "OVERDUE_INVOICE":
            if amount > 50000 or customer_health == "Critical":
                primary_action = "EMAIL_REMINDER"
                strategy = [
                    {"step": 1, "action": "EMAIL_REMINDER", "timing": "Immediate executive reminder", "channel": "EMAIL"},
                    {"step": 2, "action": "WAIT", "timing": "48 hours grace window", "channel": "SYSTEM"},
                    {"step": 3, "action": "WHATSAPP_REMINDER", "timing": "Direct follow-up to Accounts Payable", "channel": "WHATSAPP"},
                    {"step": 4, "action": "ACCOUNT_MANAGER_ESCALATION", "timing": "+5 days for warm outreach", "channel": "INTERNAL"}
                ]
                reasoning = f"High-value B2B receivable (₹{amount:,.0f}). Progressive multi-touch sequence starting with soft digital touchpoint preserving client relationship."
            else:
                primary_action = "EMAIL_REMINDER"
                strategy = [
                    {"step": 1, "action": "EMAIL_REMINDER", "timing": "Automated dunning email", "channel": "EMAIL"},
                    {"step": 2, "action": "WHATSAPP_REMINDER", "timing": "+48 hours with instant UPI link", "channel": "WHATSAPP"},
                    {"step": 3, "action": "FINANCE_ESCALATION", "timing": "+7 days if unresolved", "channel": "INTERNAL"}
                ]
                reasoning = "Standard mid-market overdue balance. Email followed by instant WhatsApp pay link achieves 82% resolution."

        elif source_type == "SUBSCRIPTION_FAILURE":
            primary_action = "PAYMENT_METHOD_UPDATE"
            strategy = [
                {"step": 1, "action": "EMAIL_REMINDER", "timing": "Grace period advisory", "channel": "EMAIL"},
                {"step": 2, "action": "PAYMENT_RETRY", "timing": "Retry in 24h", "channel": "GATEWAY"},
                {"step": 3, "action": "PAYMENT_METHOD_UPDATE", "timing": "AutoPay re-authorization prompt", "channel": "WHATSAPP"}
            ]
            reasoning = "Subscription in grace period. Prompting payment method update prevents involuntary churn."

        elif source_type == "CHECKOUT_ABANDONMENT":
            primary_action = "CHECKOUT_REMINDER"
            strategy = [
                {"step": 1, "action": "CHECKOUT_REMINDER", "timing": "1 hour post drop-off with saved cart", "channel": "WHATSAPP"},
                {"step": 2, "action": "DISCOUNT_OFFER", "timing": "+24 hours with 5% instant checkout incentive", "channel": "EMAIL"}
            ]
            reasoning = "High intent cart abandoned at payment step. Immediate personalized reminder recovers 41% of abandoned carts."

        else: # PROMISE_TO_PAY or other
            primary_action = "ACCOUNT_MANAGER_ESCALATION"
            strategy = [
                {"step": 1, "action": "WHATSAPP_REMINDER", "timing": "Immediate polite commitment reminder", "channel": "WHATSAPP"},
                {"step": 2, "action": "ACCOUNT_MANAGER_ESCALATION", "timing": "Direct phone call from Relationship Lead", "channel": "INTERNAL"}
            ]
            reasoning = "Payment promise breached. Escalating to assigned relationship manager for personalized settlement."

        return {
            "recommended_action": primary_action,
            "strategy": strategy,
            "reasoning": reasoning
        }

    @staticmethod
    def generate_communication(
        customer_name: str,
        company_name: str,
        amount: float,
        invoice_or_ref: str,
        days_overdue: int,
        language: str = "Hinglish",
        tone: str = "Urgent & Professional",
        channel: str = "WhatsApp"
    ) -> Dict[str, str]:
        """
        Generates context-aware customer recovery communications in English, Hindi, or Hinglish.
        """
        formatted_amount = f"₹{amount:,.0f}"
        
        if language.lower() == "hinglish":
            if channel == "WhatsApp":
                subject = f"Payment Reminder: {company_name} - {invoice_or_ref}"
                body = (
                    f"Hi {customer_name}, hope you're having a great week! 🌟\n\n"
                    f"A quick reminder regarding invoice *{invoice_or_ref}* for *{formatted_amount}*, which was due {days_overdue} days ago. "
                    f"To avoid any service interruption on your account, please complete the payment using our instant 1-click Razorpay link:\n\n"
                    f"🔗 https://rzp.io/i/{invoice_or_ref.lower()}\n\n"
                    f"Agar koi dispute ya query ho, please reply here and our finance team will help you immediately. Shukriya!"
                )
            else: # Email
                subject = f"Action Required: Outstanding Invoice {invoice_or_ref} ({formatted_amount}) - {company_name}"
                body = (
                    f"Dear {customer_name},\n\n"
                    f"We hope this email finds you well.\n\n"
                    f"This is a gentle follow-up regarding invoice {invoice_or_ref} for {formatted_amount}, which is currently {days_overdue} days overdue. "
                    f"Humne aapke convenience ke liye secure Razorpay direct payment portal activate kar diya hai.\n\n"
                    f"You can review the invoice details and complete payment directly via this link:\n"
                    f"https://pay.recoverai.io/invoice/{invoice_or_ref}\n\n"
                    f"If the payment is already processed from your end, please share the transaction reference (UTR) so we can update our records.\n\n"
                    f"Warm regards,\n"
                    f"Finance & Revenue Operations Team\n"
                    f"RecoverAI Platform"
                )
        elif language.lower() == "hindi":
            subject = f"भुगतान सूचना: चालान संख्या {invoice_or_ref} ({formatted_amount})"
            body = (
                f"नमस्ते {customer_name},\n\n"
                f"यह आपके चालान *{invoice_or_ref}* (राशि: *{formatted_amount}*) के संबंध में एक आवश्यक सूचना है, जो {days_overdue} दिनों से लंबित है।\n\n"
                f"निर्बाध सेवा बनाए रखने के लिए, कृपया नीचे दिए गए सुरक्षित लिंक के माध्यम से भुगतान पूरा करें:\n"
                f"🔗 https://rzp.io/i/{invoice_or_ref.lower()}\n\n"
                f"यदि आपका कोई प्रश्न है, तो कृपया इस संदेश का उत्तर दें।\n\n"
                f"धन्यवाद,\n"
                f"वित्त एवं राजस्व संचालन टीम"
            )
        else: # English
            if channel == "WhatsApp":
                subject = f"Payment Reminder: Invoice {invoice_or_ref}"
                body = (
                    f"Hello {customer_name},\n\n"
                    f"This is a friendly reminder from Finance regarding invoice *{invoice_or_ref}* for *{formatted_amount}* ({days_overdue} days overdue).\n\n"
                    f"Please settle the outstanding balance via this secure link:\n"
                    f"🔗 https://rzp.io/i/{invoice_or_ref.lower()}\n\n"
                    f"If you have already initiated the transfer, please reply with the reference number. Thank you!"
                )
            else:
                subject = f"Statement of Account: Invoice {invoice_or_ref} - {formatted_amount} Due"
                body = (
                    f"Dear {customer_name},\n\n"
                    f"Our records indicate that invoice {invoice_or_ref} for {formatted_amount} is currently {days_overdue} days past due.\n\n"
                    f"We value our partnership with {company_name} and request your prompt attention to settle this outstanding invoice.\n\n"
                    f"Pay securely online: https://pay.recoverai.io/invoice/{invoice_or_ref}\n\n"
                    f"Should you require an updated statement or have any billing inquiries, please don't hesitate to contact us.\n\n"
                    f"Sincerely,\n"
                    f"Accounts Receivable Team"
                )

        return {
            "subject": subject,
            "body": body,
            "language": language,
            "tone": tone,
            "channel": channel
        }

recovery_agent = RecoveryAgent()
