# ONEGOV — National Citizen Services Interoperability Platform
## Complete Technical Architecture & Workflow Guide

---

## 🏛️ 1. Executive Summary & Problem Context

Government departments and public agencies in India have independently developed digital portals, registries, and databases. However, these systems operate in silos with different:
- **Data Formats** (JSON, SOAP/XML, Flat File Drops, SQL DBs)
- **Citizen Identifiers** (Aadhaar, PAN, ABC IDs, UAN)
- **Authentication Mechanisms** (Independent passwords, OTPs)
- **Access Policies & Consent Frameworks**

As a result, citizens face repeated data entry, multiple document uploads, and disconnected tracking. 

**ONEGOV** solves this by providing a **Unified Interoperability Middleware Layer** connecting independent government systems without requiring existing departmental applications to be replaced or redesigned.

---

## 🔄 2. End-to-End System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │                      CITIZEN                           │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
    [1. Public Quick Tracker]                                      [2. DigiLocker / MeriPehchan]
  Enter Ref ID: OG-2026-IND-8842                                      Federated OIDC 2.0 SSO Login
               │                                                               │
               │                                               ┌───────────────┴───────────────┐
               │                                               ▼                               ▼
               │                                     (Aarav Sharma - Student)       (Verified JWT Bearer)
               │                                               │
               │                                               ▼
               │                                    [3. Categorized Intake Form]
               │                                  Autofilled verified demographic
               │                                               │
               │                                               ▼
               │                                 [4. Services Recommendation Hub]
               │                                 AI-matched schemes (NSP, PMKVY)
               │                                               │
               │                                               ▼
               │                                  [5. DPDP Act Consent Gateway]
               │                                  Citizen approves systems & terms
               │                                               │
               └───────────────────────┬───────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                      ONEGOV INTEROPERABILITY MIDDLEWARE CORE                            │
    │                                                                                         │
    │  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌───────────────────────┐  │
    │  │   Multi-Protocol Bridge  │  │  Resilience & Breakers   │  │   OCDS Normalization  │  │
    │  │ • ABC NAD (SOAP 1.2 XML) │  │ • Closed/Open/Half-Open  │  │ • Maps disparate data │  │
    │  │ • CBDT Revenue (SQL Row) │  │ • Dead-Letter Queue(DLQ) │  │   into OCDS v2.4 JSON │  │
    │  │ • EPFO/UIDAI (REST/JSON) │  │ • Exponential Retries    │  │ • Checksum validation │  │
    │  └────────────┬─────────────┘  └────────────┬─────────────┘  └───────────┬───────────┘  │
    └───────────────┼─────────────────────────────┼────────────────────────────┼──────────────┘
                    │                             │                            │
                    ▼                             ▼                            ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                       [6. 5-STAGE WORKFLOW STATE MACHINE]                               │
    │  [1. Identity] ──> [2. Academic ABC] ──> [3. Revenue Income] ──> [4. Rules] ──> [5. Pay]│
    └─────────────────────────────────────────────┬───────────────────────────────────────────┘
                                                  │
                                                  ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                       [7. GOVERNMENT OFFICER & ADMIN PORTAL]                            │
    │   • Live Telemetry (Latency Gauges)     • Review Queue (Approve ✓ / Reject ✗)           │
    │   • Circuit Breaker Outage Injector     • Dead-Letter Queue (DLQ) Reprocessing          │
    │   • Digital Sanction Certificate Order with QR Attestation Section 65B Compliant        │
    └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 3. Detailed Component Workflows

### 3.1. Single Sign-On (SSO) & Federated Identity (OIDC 2.0)
- **Goal:** Eliminate repeated authentication across departmental portals.
- **Workflow:**
  1. Citizen clicks **"🇮🇳 DigiLocker SSO"** in the top navigation.
  2. The system executes the OIDC Authorization challenge (`/api/auth/oidc/authorize`).
  3. The National Identity Provider issues a signed **HS256 JWT Bearer Token** containing verified claims:
     - `sub`: Unique Interoperability Citizen ID (`IND-8842`)
     - `aadhaar_masked`: `XXXX-XXXX-8842`
     - `verified_credentials`: `["UIDAI_AADHAAR_eKYC", "NAD_ACADEMIC_CREDENTIALS", "CBDT_INCOME_LINKAGE"]`
  4. The client automatically hydrates the citizen intake profile with zero manual typing.

---

### 3.2. DPDP Act 2023 Consent Gateway
- **Goal:** Strict statutory compliance ensuring citizen data is accessed only for authorized purposes.
- **Workflow:**
  1. When selecting a scheme (e.g., *National Scholarship Portal*), a **Consent Modal** displays the exact systems required (`Education System`, `Income System`, `Identity System`).
  2. The citizen reviews the legal purpose binding and clicks **"Give Consent & Apply"**.
  3. The backend generates a cryptographically signed consent record (`/api/consent/grant`) with a unique `CNS-xxxxxx` token, timestamp, and 30-day expiration window.

---

### 3.3. Multi-Protocol Legacy Adapters & OCDS Transformation Engine
- **Goal:** Integrate heterogeneous legacy systems without replacing existing backend infrastructure.
- **Adapters Implemented:**
  - **`SoapXmlAdapter`:** Parses legacy SOAP 1.2 / XML-RPC envelopes from the Academic Bank of Credits (ABC) & National Academic Depository (NAD).
  - **`LegacyDatabaseAdapter`:** Transforms legacy tabular SQL rows (e.g. `INC_CERT_NUM`, `ANN_INC_VAL`) from State Revenue portals.
  - **`RestJsonAdapter`:** Bridges modern OpenAPI REST endpoints (UIDAI e-KYC, Skill India).
- **OCDS (ONEGOV Common Data Standard v2.4):**
  - Transforms all inbound protocols into a canonical schema validated with cryptographic checksums:
```json
{
  "standard_version": "OCDS-v2.4",
  "citizen_id": "IND-8842",
  "verified_identity": {
    "legal_name": "Aarav Sharma",
    "dob": "2003-08-14",
    "state": "Delhi",
    "identity_verified": true
  },
  "academic_records": {
    "institution": "Delhi Technological University",
    "program": "B.Tech Computer Science",
    "academic_score": "8.85",
    "status": "ACTIVE",
    "source_protocol": "SOAP_1.2_XML"
  },
  "socio_economic": {
    "family_annual_income": 180000,
    "income_verified": true,
    "eligibility_tier": "Tier-1 Priority Beneficiary",
    "source_protocol": "LEGACY_SQL_TABLE_SYNC"
  },
  "transformation_metrics": {
    "execution_time_ms": 28,
    "validation_checksum": "PASS_100_PERCENT"
  }
}
```

---

### 3.4. 5-Stage Multi-Department Workflow State Machine
- **Goal:** Orchestrate cross-department application processing with unified status tracking.
- **Stages:**
  1. **Stage 1 — Identity Verification:** DigiLocker / UIDAI biometric token validation.
  2. **Stage 2 — Academic Credential Check:** ABC Registry SOAP XML record query.
  3. **Stage 3 — Income / Revenue Verification:** CBDT & State Revenue SQL Gateway cross-check.
  4. **Stage 4 — Autonomous Rules Engine:** Scheme quota and entitlement determination.
  5. **Stage 5 — Disbursement & Sanction Order:** Final sign-off and instant DBT receipt generation.

---

### 3.5. Fault Tolerance & Resilience Layer (Circuit Breakers + DLQ)
- **Goal:** Ensure the national gateway never crashes when individual departmental systems experience downtime.
- **State Machine:**
  - **`CLOSED`:** Normal healthy operation.
  - **`OPEN`:** Tripped after 3 consecutive timeouts/failures. Fast-fails requests without blocking citizen traffic.
  - **`HALF-OPEN`:** Tests recovering systems after a 15-second cooldown.
- **Dead-Letter Queue (DLQ):**
  - Failed messages are automatically preserved in the DLQ with full payload, timestamp, and failure reason (`CIRCUIT_BREAKER_OPEN_TIMEOUT`).
  - Government officers can reprocess messages with 1-click once departmental connectivity is restored.

---

### 3.6. Official Digital Sanction Certificate with QR Attestation
- **Goal:** Provide citizens and authorities with tamper-evident proof of entitlement.
- **Features:**
  - Generates a **Digital Sanction Order** upon reaching Stage 5 (`/api/certificate/<ref_id>`).
  - Cryptographic digital seal hash (`0xSEAL_9F8C...`).
  - Embedded SVG QR Code linking to verification URL.
  - Compliant with Section 65B of the Indian Evidence Act.
  - 1-Click **"Print / Save as PDF"** clean print layout.

---

### 3.7. Floating Multilingual AI Assistant & Voice Co-Pilot
- **Goal:** Assist citizens across language barriers with real-time eligibility guidance.
- **Features:**
  - Powered by **Groq LLaMA-3.3-70B** with instant rule-based fallback.
  - **Multilingual Support:** English, Hindi (हिंदी), and Tamil (தமிழ்).
  - **Voice Recognition (Speech-to-Text):** Web Speech API microphone input.
  - **Voice Feedback (Text-to-Speech):** Audio response synthesis.

---

## 📡 4. Core API Specification

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/health` | `GET` | Health check for all 6 interoperability subsystems. |
| `/api/auth/providers` | `GET` | List supported National SSO providers (DigiLocker, e-Pramaan). |
| `/api/auth/oidc/token` | `POST` | Issue signed OIDC JWT token with verified citizen demographic claims. |
| `/api/consent/grant` | `POST` | Register DPDP Act 2023 cryptographic consent record. |
| `/api/interop/query` | `POST` | Query connected department APIs and transform into OCDS v2.4 JSON. |
| `/api/interop/adapters/test` | `POST` | Benchmark multi-protocol adapters (SOAP 1.2 XML & Direct SQL Table). |
| `/api/workflow/apply` | `POST` | Submit multi-department application into the state machine. |
| `/api/workflow/<ref_id>/advance` | `POST` | Progress application to the next verification stage. |
| `/api/workflow/<ref_id>` | `GET` | Query real-time application verification status. |
| `/api/certificate/<ref_id>` | `GET` | Generate verifiable Digital Sanction Certificate and QR metadata. |
| `/api/chat` | `POST` | Multilingual AI Co-Pilot query endpoint (English, Hindi, Tamil). |
| `/api/admin/overview` | `GET` | Fetch live admin KPI metrics and gateway operational states. |
| `/api/admin/applications` | `GET` | List all cross-department applications in the official review queue. |
| `/api/admin/applications/<ref_id>/action`| `POST` | Approve, reject, or request information on an application stage. |
| `/api/resilience/status` | `GET` | Inspect circuit breaker states and Dead-Letter Queue items. |
| `/api/resilience/circuit-breaker/toggle` | `POST` | Inject or clear fault simulation on specific department gateways. |
| `/api/resilience/dlq/<id>/retry` | `POST` | Reprocess failed DLQ messages. |
| `/api/audit-logs` | `GET` | Retrieve immutable SHA256 audit ledger records. |

---

## 🚀 5. How to Run & Test the Application

### 5.1. Start Backend Server
```bash
python backend/app.py
```
The server will start at `http://localhost:5000`.

### 5.2. Walkthrough Checklist for Evaluators
1. **Public Tracking:** On `http://localhost:5000`, enter `OG-2026-IND-8842` in the top search box and click **"Track Status →"**.
2. **Federated SSO:** Click **"🇮🇳 DigiLocker SSO"** in the navbar, select *Aarav Sharma (Student)*, and authorize.
3. **Discover Services:** Select the **"Students"** pathway, continue through the form, and view personalized schemes.
4. **Adapter Benchmarking:** Click **"🔬 Inspect OCDS & Adapters"** to view live SOAP 1.2 XML and SQL Table conversions.
5. **DPDP Consent & Apply:** Click **"Apply with Single Profile →"** on any scheme, grant consent, and simulate pipeline completion.
6. **Download Sanction Order:** When Stage 5 completes, click **"📜 View Official Sanction Order"** and test **"Print / Save as PDF"**.
7. **AI Voice Co-Pilot:** Click the floating **"AI Co-Pilot"** button in the bottom-right corner, switch languages to Hindi or Tamil, and speak or type a question.
8. **Officer Portal & Resilience Testing:** Click **"🏛️ Officer Portal"** in the navbar, click **"💥 Toggle Revenue Gateway Outage"** to trip the Circuit Breaker to `OPEN`, inspect the Dead-Letter Queue, and approve pending applications.
