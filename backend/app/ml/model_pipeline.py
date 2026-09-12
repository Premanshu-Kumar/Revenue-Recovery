import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, accuracy_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "recovery_model.joblib")

NUMERIC_FEATURES = [
    "amount_at_risk",
    "days_overdue",
    "customer_ltv",
    "payment_success_rate",
    "previous_failure_count",
    "previous_recovery_count",
    "average_payment_delay",
    "communication_engagement"
]

CATEGORICAL_FEATURES = [
    "failure_reason",
    "customer_segment",
    "customer_health",
    "source_type"
]

def generate_synthetic_training_data(n_samples: int = 4000) -> pd.DataFrame:
    np.random.seed(42)
    
    segments = np.random.choice(["Enterprise", "Mid-Market", "SMB", "Startup"], size=n_samples, p=[0.2, 0.35, 0.3, 0.15])
    health = np.random.choice(["Healthy", "At Risk", "Critical"], size=n_samples, p=[0.65, 0.25, 0.10])
    source_types = np.random.choice(
        ["PAYMENT_FAILURE", "OVERDUE_INVOICE", "SUBSCRIPTION_FAILURE", "CHECKOUT_ABANDONMENT", "MANDATE_FAILURE", "PROMISE_TO_PAY"],
        size=n_samples,
        p=[0.35, 0.25, 0.15, 0.12, 0.08, 0.05]
    )
    
    failure_reasons = []
    for st in source_types:
        if st == "PAYMENT_FAILURE":
            fr = np.random.choice(["INSUFFICIENT_FUNDS", "EXPIRED_CARD", "CARD_DECLINED", "PROCESSOR_ERROR", "AUTHENTICATION_FAILED", "BANK_ERROR"])
        elif st == "OVERDUE_INVOICE":
            fr = np.random.choice(["LATE_PAYMENT", "FORGOTTEN_INVOICE", "CASH_FLOW_DELAY", "DISPUTED", "UNKNOWN"])
        elif st == "SUBSCRIPTION_FAILURE":
            fr = np.random.choice(["EXPIRED_CARD", "INSUFFICIENT_FUNDS", "MANDATE_EXPIRED", "CARD_DECLINED"])
        elif st == "CHECKOUT_ABANDONMENT":
            fr = np.random.choice(["PAYMENT_FRICTION", "UNEXPECTED_COST", "USER_DROP_OFF", "TECHNICAL_ISSUE"])
        elif st == "MANDATE_FAILURE":
            fr = np.random.choice(["MANDATE_REJECTED", "LIMIT_EXCEEDED", "BANK_SERVER_DOWN"])
        else:
            fr = np.random.choice(["BROKEN_PROMISE", "CUSTOMER_UNREACHABLE"])
        failure_reasons.append(fr)
        
    amounts = np.zeros(n_samples)
    for i, seg in enumerate(segments):
        if seg == "Enterprise":
            amounts[i] = np.random.gamma(shape=5, scale=18000) # ~90k
        elif seg == "Mid-Market":
            amounts[i] = np.random.gamma(shape=4, scale=9000) # ~36k
        elif seg == "SMB":
            amounts[i] = np.random.gamma(shape=3, scale=4000) # ~12k
        else:
            amounts[i] = np.random.gamma(shape=2, scale=3500) # ~7k
            
    days_overdue = np.random.exponential(scale=14, size=n_samples).astype(int)
    customer_ltv = amounts * np.random.uniform(5, 40, size=n_samples)
    payment_success_rate = np.clip(np.random.normal(0.85, 0.15, size=n_samples), 0.2, 0.99)
    prev_failures = np.random.poisson(lam=1.5, size=n_samples)
    prev_recoveries = np.random.poisson(lam=2.8, size=n_samples)
    avg_delay = np.random.poisson(lam=4, size=n_samples)
    comm_engagement = np.clip(np.random.normal(0.7, 0.2, size=n_samples), 0.0, 1.0)
    
    # Target probability synthesis with realistic financial rules
    # Higher success with healthy customers, lower days overdue, high past success rate, higher engagement
    health_boost = np.where(health == "Healthy", 0.4, np.where(health == "Critical", -0.5, 0.0))
    reason_boost = np.where(np.isin(failure_reasons, ["INSUFFICIENT_FUNDS", "FORGOTTEN_INVOICE", "TECHNICAL_ISSUE"]), 0.5, -0.4)

    logits = (
        2.5 * payment_success_rate
        - 0.04 * days_overdue
        + 1.2 * comm_engagement
        + 0.15 * np.log1p(prev_recoveries)
        - 0.25 * np.log1p(prev_failures)
        + health_boost
        + reason_boost
    )
    
    probs = 1 / (1 + np.exp(-logits))
    # True target binary outcome
    y = (np.random.uniform(0, 1, size=n_samples) < probs).astype(int)
    
    df = pd.DataFrame({
        "amount_at_risk": amounts,
        "days_overdue": days_overdue,
        "customer_ltv": customer_ltv,
        "payment_success_rate": payment_success_rate,
        "previous_failure_count": prev_failures,
        "previous_recovery_count": prev_recoveries,
        "average_payment_delay": avg_delay,
        "communication_engagement": comm_engagement,
        "failure_reason": failure_reasons,
        "customer_segment": segments,
        "customer_health": health,
        "source_type": source_types,
        "recovered": y
    })
    return df

class RecoveryModelPipeline:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self._load_or_train()

    def _build_pipeline(self):
        numeric_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="median"))
        ])
        
        categorical_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="UNKNOWN")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])
        
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, NUMERIC_FEATURES),
                ("cat", categorical_transformer, CATEGORICAL_FEATURES)
            ]
        )
        
        clf = GradientBoostingClassifier(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=4,
            random_state=42
        )
        
        return Pipeline(steps=[("preprocessor", preprocessor), ("classifier", clf)])

    def train(self, data: pd.DataFrame = None):
        if data is None:
            data = generate_synthetic_training_data(n_samples=4500)
            
        X = data[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
        y = data["recovered"]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        pipeline = self._build_pipeline()
        pipeline.fit(X_train, y_train)
        
        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)[:, 1]
        
        metrics = {
            "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
            "precision": round(float(precision_score(y_test, y_pred)), 4),
            "recall": round(float(recall_score(y_test, y_pred)), 4),
            "f1": round(float(f1_score(y_test, y_pred)), 4),
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4)
        }
        
        # Save pipeline
        joblib.dump({"pipeline": pipeline, "metrics": metrics}, MODEL_PATH)
        self.model = pipeline
        self.is_trained = True
        return metrics

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                saved = joblib.load(MODEL_PATH)
                self.model = saved["pipeline"]
                self.is_trained = True
                return
            except Exception:
                pass
        self.train()

    def predict_probability(self, feature_dict: dict) -> float:
        """
        Takes raw feature dictionary, processes through model, returns probability [0.0, 1.0].
        """
        if not self.is_trained or self.model is None:
            self._load_or_train()
            
        row = {
            "amount_at_risk": float(feature_dict.get("amount_at_risk", 10000)),
            "days_overdue": int(feature_dict.get("days_overdue", 5)),
            "customer_ltv": float(feature_dict.get("customer_ltv", 50000)),
            "payment_success_rate": float(feature_dict.get("payment_success_rate", 0.85)),
            "previous_failure_count": int(feature_dict.get("previous_failure_count", 1)),
            "previous_recovery_count": int(feature_dict.get("previous_recovery_count", 3)),
            "average_payment_delay": int(feature_dict.get("average_payment_delay", 4)),
            "communication_engagement": float(feature_dict.get("communication_engagement", 0.75)),
            "failure_reason": str(feature_dict.get("failure_reason", "INSUFFICIENT_FUNDS")),
            "customer_segment": str(feature_dict.get("customer_segment", "Mid-Market")),
            "customer_health": str(feature_dict.get("customer_health", "Healthy")),
            "source_type": str(feature_dict.get("source_type", "OVERDUE_INVOICE"))
        }
        
        df = pd.DataFrame([row])
        try:
            proba = float(self.model.predict_proba(df)[0, 1])
            # Bounded output for realistic display
            return round(np.clip(proba, 0.05, 0.98), 2)
        except Exception:
            # Fallback deterministic formula
            base = 0.65
            if row["days_overdue"] > 30: base -= 0.2
            if row["payment_success_rate"] > 0.85: base += 0.15
            if row["customer_health"] == "Healthy": base += 0.1
            return round(np.clip(base, 0.1, 0.95), 2)

# Global singleton instance
recovery_ml_pipeline = RecoveryModelPipeline()
