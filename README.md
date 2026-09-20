# RecoverAI — Autonomous AI Revenue Recovery Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4.1-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Track 03: Razorpay Innovation Challenge](https://img.shields.io/badge/Razorpay_Challenge-Track_03_AI_Revenue_Recovery-0C2340.svg?logo=razorpay&logoColor=white)](https://razorpay.com)

> **Track 03: AI Revenue Recovery** | Razorpay Innovation Challenge
> *"Detect revenue at risk. Decide the right intervention. Recover money automatically."*

---

## 🌟 Executive Summary
**RecoverAI** is an enterprise-grade Autonomous Revenue Recovery Agent designed for high-growth SaaS and FinTech platforms. Rather than merely alerting finance teams to lost revenue, RecoverAI closes the loop:

$$\text{Detect} \longrightarrow \text{Diagnose} \longrightarrow \text{Prioritize} \longrightarrow \text{Decide} \longrightarrow \text{Execute} \longrightarrow \text{Recover} \longrightarrow \text{Audit} \longrightarrow \text{Measure}$$

### 🎯 Key Business Outcome
- **Revenue At Risk Monitored**: ₹3.13 Crore (~1,000 active events across ₹18–20L+ batches)
- **Revenue Recovered**: ₹1.19+ Crore
- **Incremental AI Recovery**: ₹63+ Lakhs
- **AI Lift vs Baseline**: **+111%** over standard dunning

---

## 🏗️ Architecture & Core Components

```
                   REVENUE EVENTS STREAM
       (Failed Payments, Overdue Invoices, Checkouts, Mandates)
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Revenue Risk Detector│ (Deduplication & Ingestion)
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ Root Cause AI Engine │ (Decline classification & Signals)
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ ML Recovery Model    │ (GradientBoosting/RandomForest P[0,1])
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ Prioritization Engine│ (Score 0-100, Expected Value = Amt × Prob)
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ AI Recovery Agent    │ (Multi-step strategies, Hinglish copy)
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ DETERMINISTIC POLICY │ (<₹10k Auto, ₹10-50k Ltd, >₹50k Approval)
                  │       ENGINE         │ (Stopping rules: 3 retries, opt-outs)
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ Recovery Simulator   │ (Simulated payment execution & dunning)
                  └──────────┬───────────┘
                             ▼
                   MONEY RECOVERED
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Audit & Live Metrics │ (Cryptographic immutable audit trail)
                  └──────────────────────┘
```

---

## 🛡️ Bounded AI Autonomy & Policy Engine
RecoverAI never gives AI unrestricted financial authority. Autonomous actions are strictly bound:
- **Amount < ₹10,000**: Full autonomous execution permitted.
- **₹10,000 – ₹50,000**: Limited autonomous execution within predefined safe channels.
- **Amount > ₹50,000**: **Human / CFO approval strictly mandatory** before outreach or retries.
- **Stopping Rules**:
  - Maximum 3 gateway retries (prevents processor penalty).
  - Maximum 3 outreach communications per billing cycle.
  - Immediate freeze on active invoice disputes or customer opt-outs.

---

## 🏢 Reference Scenario: ABC Technologies
- **Customer**: ABC Technologies (Rajesh Khanna)
- **Invoice**: `INV-4821`
- **Amount at Risk**: **₹84,500**
- **Days Overdue**: 18 days
- **Payment Success Reliability**: 93%
- **ML Predicted Probability**: **82%**
- **Expected Recovery Value**: **₹69,290**
- **Policy Evaluation**: `APPROVAL_REQUIRED` (Amount exceeds ₹50,000 threshold)
- **AI Intervention**: Executive Email Reminder $\to$ 48h wait $\to$ WhatsApp 1-click Razorpay payment link $\to$ Account Manager escalation.

---

## 🚀 Quickstart & Setup Guide

### ⚡ 1-Click Launch (Windows)
Run both backend and frontend servers and automatically launch the browser in one click:
* **Option A**: Double-click [`run.bat`](run.bat) from Windows Explorer.
* **Option B**: Run `.\start.ps1` in PowerShell.

---

### 🛠️ Manual Step-by-Step Setup

#### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

#### 1. Backend Setup
```bash
# In project root
cd backend
pip install -r requirements.txt

# Run pytest to verify ML models & policy engine
python -m pytest tests/test_backend.py -v

# Seed database with 1,000 realistic cases (including ABC Technologies)
python -m app.database.seed

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```
Interactive API Docs (Swagger): `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
# In project root
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

---

## 🧭 3-Stage User Navigation Journey

1. **First Appearance — Launch Executive Platform**:
   * Initial landing state at `http://localhost:3000` with high-impact hero video, KPI benchmarks, and the **`Launch Executive Platform`** CTA.
2. **Second View — Executive Login Portal**:
   * Authenticated identity selection with 1-click demo profiles (**Premanshu Kumar, CFO • Razorpay FinTech**, RevOps Lead, Collections Lead) and 256-bit TLS security indicators.
3. **Third View — Main Dashboard & Platform Overview**:
   * Complete revenue intelligence workspace with live KPI cards, interactive recovery funnels, case management, and AI agent diagnosis.

---

## 🧪 Testing & Verification
```powershell
# Run backend test suite
python -m pytest backend/tests/test_backend.py -v
```

---

## 👥 Product Modules
1. **Overview Dashboard**: Real-time KPI row, AI Revenue Impact card, Interactive Funnel, Trend time-series, Highest-Value Opportunities.
2. **Opportunities & Cases**: Search, filter by priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), status, risk category, sorting, and pagination.
3. **AI Agent Workspace**: Customer 360, Revenue Risk metrics, Explainable AI diagnosis, Multi-step intervention sequence, Deterministic Policy Check, Multi-lingual Hinglish Communication Generator, and Action Execution.
4. **Customers 360**: Financial reliability, LTV, and risk profiles.
5. **Payment Operations**: Transaction-level failure telemetry, decline codes, and retry counts.
6. **Receivables & Aging**: B2B aging buckets ($0-7\text{d}, 8-30\text{d}, 31-60\text{d}, 60+\text{d}$) and Promise-to-Pay tracker.
7. **Campaigns**: Workflow builders for Failed Payments, Invoices, Subscriptions, and Abandoned Checkouts.
8. **Executive Analytics**: AI vs Baseline lift benchmark (+111% Lift), channel efficiency, and ROI multiple.
9. **Immutable Audit Trail**: Detailed audit trace for every AI recommendation, policy check, and settlement outcome.
10. **Global AI Assistant & Command+K**: Universal search and natural language revenue assistant.
