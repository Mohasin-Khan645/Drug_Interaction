# DRUGSAFE: Medication Safety & Drug Interaction Intelligence Platform

> **Clinical Decision Support & Pharmacovigilance Intelligence System**  
> Built with React 18, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Lucide Icons, and Recharts.

---

## 🏥 Project Overview

**DrugSafe** is a production-quality healthcare SaaS frontend designed for clinical decision support, multi-drug interaction intelligence, optical prescription extraction, and medication regimen reconciliation.

The system enforces strict Role-Based Access Control (RBAC) across four distinct clinical scopes:
- **PATIENT**: Self-service medication surveillance, prescription OCR upload, personalized safety alerts, and health profile management.
- **DOCTOR**: Assigned patient panels, clinical decision override signing, adverse event risk mitigation, and printable medical safety reports.
- **PHARMACIST**: Dispensing review queues, duplicate therapy resolution, cross-reactivity checks, and active medication reconciliation.
- **ADMIN**: Clinical rule engine configuration (Drug-Drug, Drug-Disease, Drug-Allergy, Duplication, Organ Factors), formulary management, HIPAA-compliant audit logs, and population health analytics.

---

## 🏛️ Architecture

```
USER
  ↓
REACT FRONTEND (Vite, React 18, Tailwind CSS, TanStack Query)
  ↓
AUTHENTICATION & RBAC (AuthContext, ProtectedRoute, RoleGuard)
  ↓
CENTRALIZED AXIOS API CLIENT (src/api/client.js)
  ↓
NODE.JS / EXPRESS REST API (or Isolated Mock Clinical Adapter)
  ├── Patient Service
  ├── Medication Service
  ├── Prescription & OCR Service
  ├── Clinical Safety Engine
  ├── Evidence Layer (RxNorm, DailyMed, openFDA)
  ├── AI / RAG Explanation Layer
  ├── Reports & Audit Logs
```

> [!NOTE]
> The frontend **never directly accesses PostgreSQL**. All data exchange occurs strictly through centralized REST API modules (`src/api/*`).

---

## ⚡ Key Features & Clinical Journeys

1. **Complete Clinical Decision Support (CDS) Pipeline**:
   - **Multi-Drug Interaction Checker**: Select medications via instant search tags (e.g., Warfarin, Aspirin, Lisinopril, Metformin, Simvastatin, Clarithromycin).
   - **Prioritized Findings Hierarchy**: Findings cleanly grouped into `CRITICAL`, `MAJOR`, `MODERATE`, `MINOR`, and `INFORMATIONAL` with color-blind safe text badges and icons.
   - **Pharmacological Mechanism**: Deep insight into CYP450 enzyme inhibition, clearance alteration, and additive receptor properties.
2. **Grounded AI Explanation Panel (RAG Mode)**:
   - Formally labeled: *"AI-generated explanation based on verified evidence."*
   - Strictly references retrieved evidence from DailyMed, RxNorm, and FDA labeling.
   - Never masquerades as a prescribing doctor or replaces medical judgment.
3. **Prescription OCR & Human-in-the-Loop Review**:
   - Drag-and-drop prescription document upload (PNG, JPG, PDF) with HIPAA privacy notice.
   - Stepped extraction progress showing OCR confidence ratings (`High`, `Medium`, `Low`).
   - Warning cues for low-confidence items requiring mandatory manual verification.
   - Candidates can be confirmed, reassigned, or rejected.
4. **Medication Reconciliation**:
   - Automated detection of duplicate active ingredients (e.g. Tylenol + Vicodin acetaminophen overlap).
   - Discrepancy resolution without automatic or accidental deletion of records.
5. **Clinician Review & Formal Decision Sign-Off**:
   - Doctor and Pharmacist action workflow (`Accept Finding`, `Acknowledge Risk`, `Requires Investigation`).
   - Confirmation step recording decision rationale, physician timestamp, and digital audit entry.
6. **Print-Ready Medical Safety Reports**:
   - Official medical report view with print stylesheet (`window.print()`) and PDF export formatting.
7. **Admin Command Center**:
   - User RBAC management with confirmation dialogs.
   - Rule engine management across Drug-Drug, Disease, Allergy, Duplication, and Patient Factor categories.
   - Authoritative evidence sources (RxNorm, DailyMed, openFDA, PubMed) with live sync indicators.
   - Recharts population analytics (monthly volume, severity breakdown, top checked drugs, review patterns).

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` (Tested on Node `v22.14.0`)
- npm `v9+`

### Installation
```bash
# 1. Clone or navigate to the repository
cd Drug_interaction

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

The application will be accessible at: **`http://localhost:3000`**

### Running Automated Tests
```bash
npm run test
```

### Production Build & Verification
```bash
npm run build
```

---

## 🔑 Role Demonstration & Quick Testing

To easily inspect all 4 distinct roles without configuring an external database:
1. Open the **Login** page (`/login`).
2. Click any of the **1-Click Demo Profiles**:
   - **Patient**: `Sarah Jenkins` (`sarah.jenkins@example.com`)
   - **Physician**: `Dr. Marcus Chen, MD` (`marcus.chen@drugsafe.hospital.org`)
   - **Pharmacist**: `Elena Rostova, PharmD` (`elena.rostova@healthrx.org`)
   - **Administrator**: `David Vance` (`admin@drugsafe.io`)
3. Alternatively, use the **Role Switcher** dropdown in the top navigation bar at any time to switch perspective instantly.

---

## ⚙️ Environment Configuration

Configuration is managed via `.env`:
```env
# DrugSafe Platform Configuration
VITE_APP_NAME=DrugSafe
VITE_APP_TAGLINE=Medication Safety Intelligence

# API Backend Configuration
# Set VITE_USE_MOCK_API=false when connecting to a live Node.js/Express backend
VITE_API_URL=/api
VITE_USE_MOCK_API=true
```

When `VITE_USE_MOCK_API=true` (default), the centralized Axios client uses the isolated mock clinical adapter (`src/api/mock/mockAdapter.js`) with realistic pharmacological interaction algorithms. Set `VITE_USE_MOCK_API=false` to route requests directly to your Node.js/Express API.
