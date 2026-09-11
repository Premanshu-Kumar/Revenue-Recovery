# Walkthrough — RecoverAI (Razorpay Track 03) & Dynamic Color Themes

RecoverAI is an autonomous AI Revenue Recovery platform built for **Premanshu Kumar (CFO • Razorpay FinTech)** featuring bounded intervention workflows, ML propensity scoring, deterministic guardrails, Hinglish voice recovery, an immutable audit trail, a dark mode hero landing page, and a **dynamic color theme & login identity switcher**.

---

## 1. Key Accomplishments

### A. Dedicated Login & Identity Portal
- **1-Click Executive Profiles**:
  - **Premanshu Kumar** (`cfo@recoverai.demo`): CFO • Executive Financial Authority (Full autonomous approval & financial risk oversight >₹50,000).
  - **Rahul Verma** (`revops@recoverai.demo`): RevOps Lead (Campaign builder, ML funnel & retry sequences).
  - **Aman Gupta** (`finance@recoverai.demo`): Finance & Collections Lead (B2B overdue receivables & Promise-to-Pay tracking).
- **Security & Compliance**: SOC2 Type II compliance badge, 256-bit TLS encryption, policy engine guardrails banner.
- **Bi-directional Navigation**: Quick switch from the landing hero page into the login portal and straight into the executive workspace.

### B. Dynamic Webpage Color Customization Engine
- Integrated **6 dynamic color palettes** switchable in real time:
  1. **Electric Indigo** (Vivid Indigo `#6366f1` / Royal Violet `#8b5cf6` with deep obsidian base)
  2. **Cyber Emerald** (Matrix Mint `#10b981` / Emerald `#059669` with cyber forest base)
  3. **Royal Sapphire** (Razorpay Electric Blue `#0ea5e9` / Cobalt `#3b82f6` with deep navy base)
  4. **Sunset Gold** (Solar Amber `#f59e0b` / Fiery Coral `#f97316` with obsidian quartz base)
  5. **Neon Magenta** (Hyper Violet `#ec4899` / Cyber Pink `#db2777` with midnight base)
  6. **Obsidian Titanium** (Pure Black `#000000` / Silver Chrome `#f8fafc` with subtle white glow)
- Instant live CSS variable injection with glow reflections, active tabs, buttons, badges, and background ambient halos.
- Available via both the **TopNav Quick Dropdown** and the **Settings & Appearance** pill grid.

---

## 2. Visual Verification

### Login Portal & 1-Click Identity Switching
![Login Screen](file:///C:/Users/prema/.gemini/antigravity-ide/brain/54b13c8a-a9ec-4bbe-86b4-1717b596c208/login_page_initial_1788612912860.png)

### Live Theme Selector Dropdown
![Theme Dropdown](file:///C:/Users/prema/.gemini/antigravity-ide/brain/54b13c8a-a9ec-4bbe-86b4-1717b596c208/theme_dropdown_open_1788613056219.png)

### Cyber Emerald Theme Dashboard
![Cyber Emerald Theme](file:///C:/Users/prema/.gemini/antigravity-ide/brain/54b13c8a-a9ec-4bbe-86b4-1717b596c208/cyber_emerald_theme_1788613190731.png)

### Settings Appearance & Theme Pills
![Settings Themes](file:///C:/Users/prema/.gemini/antigravity-ide/brain/54b13c8a-a9ec-4bbe-86b4-1717b596c208/settings_neon_magenta_theme_1788613259313.png)

---

## 3. How to Run & Use

```bash
# Start FastAPI backend (Port 8000)
cd d:\Razorpay\backend
python -m uvicorn app.main:app --port 8000 --reload

# Start React + Vite frontend (Port 3000)
cd d:\Razorpay\frontend
npm run dev -- --port 3000
```

1. Open `http://localhost:3000/` in your browser.
2. Click **Login & Identity** on the sidebar or **Sign In** on the top bar to test the login experience with Premanshu Kumar.
3. Click the **Theme / Palette Icon** on the top navigation bar or go to **Settings & Themes** to switch between the 6 color palettes in real-time.
