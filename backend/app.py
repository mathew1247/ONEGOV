import os
import json
import time
import hmac
import hashlib
import base64
import random
import datetime
import xml.etree.ElementTree as ET
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"

app = Flask(__name__, static_folder=str(PROJECT_DIR))
CORS(app)

JWT_SECRET = os.getenv("JWT_SECRET", "oneg-national-interop-secret-key-2026")

# ============================================================================
# JWT & FEDERATED IDENTITY UTILITIES (Built-in, zero-dependency)
# ============================================================================
def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_jwt_token(payload: dict, secret: str = JWT_SECRET) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signature_raw = hmac.new(secret.encode('utf-8'), f"{header_b64}.{payload_b64}".encode('utf-8'), hashlib.sha256).digest()
    sig_b64 = base64url_encode(signature_raw)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_jwt_token(token: str, secret: str = JWT_SECRET):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None, "Invalid token structure"
        header_b64, payload_b64, sig_b64 = parts
        expected_sig = base64url_encode(hmac.new(secret.encode('utf-8'), f"{header_b64}.{payload_b64}".encode('utf-8'), hashlib.sha256).digest())
        if not hmac.compare_digest(sig_b64, expected_sig):
            return None, "Signature mismatch"
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if "exp" in payload and payload["exp"] < time.time():
            return None, "Token expired"
        return payload, None
    except Exception as e:
        return None, str(e)


# ============================================================================
# LEGACY ADAPTER ENGINE (SOAP/XML, Legacy DB Tabular, Batch CSV, REST)
# ============================================================================
class SoapXmlAdapter:
    """Adapter for legacy SOAP 1.2 / XML-RPC registries (e.g. ABC / National Academic Depository)."""
    @staticmethod
    def parse_envelope(xml_text: str) -> dict:
        try:
            root = ET.fromstring(xml_text)
            records = {}
            for elem in root.iter():
                if elem.text and elem.text.strip() and len(elem) == 0:
                    tag_clean = elem.tag.split('}')[-1]
                    records[tag_clean] = elem.text.strip()
            return records
        except Exception as e:
            return {"error": f"SOAP XML Parse Error: {e}"}

    @staticmethod
    def generate_soap_response(data: dict) -> str:
        items_xml = "".join([f"<{k}>{v}</{k}>" for k, v in data.items()])
        return f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:oneg="http://oneg.gov.in/legacy/nad">
  <soap:Header>
    <oneg:SecurityToken>ST-{int(time.time())}</oneg:SecurityToken>
  </soap:Header>
  <soap:Body>
    <oneg:GetAcademicRecordResponse>
      {items_xml}
    </oneg:GetAcademicRecordResponse>
  </soap:Body>
</soap:Envelope>"""

    @staticmethod
    def normalize_to_ocds(raw_soap_data: dict) -> dict:
        return {
            "source_protocol": "SOAP_1.2_XML",
            "institution": raw_soap_data.get("InstitutionName", raw_soap_data.get("institution", "Anna University")),
            "program": raw_soap_data.get("DegreeCourse", raw_soap_data.get("course", "B.Tech IT")),
            "academic_score": raw_soap_data.get("CumulativeScore", raw_soap_data.get("cgpa", "8.85")),
            "status": raw_soap_data.get("EnrollmentStatus", raw_soap_data.get("status", "ACTIVE")),
            "abc_id": raw_soap_data.get("AbcCredentialId", "ABC-8832-9912")
        }


class LegacyDatabaseAdapter:
    """Adapter for legacy Direct SQL / Tabular systems (e.g. State Revenue & Land Records)."""
    @staticmethod
    def normalize_tabular_row(row_dict: dict) -> dict:
        return {
            "source_protocol": "LEGACY_SQL_TABLE_SYNC",
            "certificate_no": row_dict.get("INC_CERT_NUM", row_dict.get("cert_no", "INC-TN-2025-0091")),
            "annual_income_inr": int(row_dict.get("ANN_INC_VAL", row_dict.get("annual_income", 180000))),
            "category": row_dict.get("INC_TIER_CD", "LOW_INCOME_TIER_1"),
            "valid_until": row_dict.get("EXPIRY_DT", "2026-03-31"),
            "verified": True
        }


class RestJsonAdapter:
    """Adapter for modern REST / JSON gateways (e.g. DigiLocker e-KYC / Skill India)."""
    @staticmethod
    def normalize(json_payload: dict) -> dict:
        return {
            "source_protocol": "REST_OAS3_JSON",
            "payload": json_payload,
            "status": "NORMALIZED_SUCCESS"
        }


# ============================================================================
# FAULT TOLERANCE & CIRCUIT BREAKER ENGINE
# ============================================================================
class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 3, cooldown_seconds: int = 15):
        self.name = name
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.state = "CLOSED"  # CLOSED, OPEN, HALF-OPEN
        self.failure_count = 0
        self.last_failure_time = 0
        self.manual_override = False

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def can_execute(self) -> bool:
        if self.manual_override:
            return False
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.cooldown_seconds:
                self.state = "HALF-OPEN"
                return True
            return False
        if self.state == "HALF-OPEN":
            return True
        return True

    def get_status(self) -> dict:
        return {
            "name": self.name,
            "state": self.state if not self.manual_override else "OPEN (Manual Outage Injected)",
            "raw_state": "OPEN" if self.manual_override else self.state,
            "failure_count": self.failure_count,
            "threshold": self.failure_threshold,
            "last_failure_time": datetime.datetime.fromtimestamp(self.last_failure_time, datetime.timezone.utc).isoformat() if self.last_failure_time else None,
            "manual_override": self.manual_override
        }


# In-Memory Database & System Registry
in_memory_store = {
    "subscriptions": [],
    "profiles": {
        "IND-8842": {
            "userId": "IND-8842",
            "fullName": "Aarav Sharma",
            "dob": "2003-08-14",
            "mobile": "9876543210",
            "email": "aarav.sharma@example.gov.in",
            "state": "Delhi",
            "district": "Central Delhi",
            "pincode": "110001",
            "category": "student",
            "eduLevel": "Undergraduate",
            "course": "B.Tech Computer Science",
            "college": "Delhi Technological University",
            "currentYear": "3rd Year",
            "studentSkills": "Python, Web Development, SQL",
            "familyIncome": "₹2.5 Lakhs - ₹5 Lakhs",
            "verifiedSSO": True,
            "authProvider": "DigiLocker / MeriPehchan",
            "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    },
    "consents": {
        "CNS-881021": {
            "consent_id": "CNS-881021",
            "service_id": "S001",
            "citizen_id": "IND-8842",
            "requesting_dept": "Ministry of Education",
            "systems_authorized": ["Identity System", "Education System", "Income System"],
            "purpose": "National Scholarship Eligibility Verification",
            "data_requested": "Aadhaar e-KYC, Academic Marksheet, Family Income Tier",
            "status": "GRANTED",
            "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat(),
            "legal_framework": "DPDP Act 2023 Compliant"
        },
        "CNS-541092": {
            "consent_id": "CNS-541092",
            "service_id": "S002",
            "citizen_id": "IND-5412",
            "requesting_dept": "Min. of Skill Development",
            "systems_authorized": ["Identity System", "Skill System"],
            "purpose": "PMKVY Skill Certification Enrollment",
            "data_requested": "Identity Verification, Educational Qualification Token",
            "status": "GRANTED",
            "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)).isoformat(),
            "legal_framework": "DPDP Act 2023 Compliant"
        }
    },
    "applications": {
        "OG-2026-IND-8842": {
            "refId": "OG-2026-IND-8842",
            "serviceId": "S001",
            "serviceName": "National Scholarship Portal (NSP)",
            "dept": "Ministry of Education",
            "citizenId": "IND-8842",
            "citizenName": "Aarav Sharma",
            "currentStageIndex": 2,
            "overallStatus": "Stage 3: Education Verification In Progress",
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "slaDeadline": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3)).isoformat(),
            "slaBreached": False,
            "stages": [
                {"id": 1, "name": "Citizen Request", "status": "VERIFIED", "dept": "Citizen Portal", "authority": "ONEGOV Portal", "time": "Completed", "icon": "✓"},
                {"id": 2, "name": "Identity Verification", "status": "VERIFIED", "dept": "Identity Dept", "authority": "DigiLocker / UIDAI (SIMULATED)", "time": "Completed", "icon": "✓"},
                {"id": 3, "name": "Education Verification", "status": "IN_PROGRESS", "dept": "Education Dept", "authority": "Academic Bank of Credits (SOAP XML)", "time": "Live", "icon": "⏳"},
                {"id": 4, "name": "Revenue Verification", "status": "PENDING", "dept": "Revenue Dept", "authority": "CBDT / State Revenue SQL Gateway", "time": "Queued", "icon": "○"},
                {"id": 5, "name": "Rules / Eligibility Check", "status": "PENDING", "dept": "Interoperability Core", "authority": "ONEGOV Rules Engine", "time": "Queued", "icon": "○"},
                {"id": 6, "name": "Final Processing / Disbursement", "status": "PENDING", "dept": "Welfare Dept", "authority": "National Treasury / Welfare Direct Benefit", "time": "Queued", "icon": "○"}
            ]
        },
        "OG-2026-IND-5412": {
            "refId": "OG-2026-IND-5412",
            "serviceId": "E001",
            "serviceName": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
            "dept": "Ministry of Skill Development & Entrepreneurship",
            "citizenId": "IND-5412",
            "citizenName": "Priya Sundaram",
            "currentStageIndex": 4,
            "overallStatus": "Stage 5: Rules & Eligibility Check",
            "createdAt": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=18)).isoformat(),
            "slaDeadline": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=2)).isoformat(),
            "slaBreached": False,
            "stages": [
                {"id": 1, "name": "Citizen Request", "status": "VERIFIED", "dept": "Citizen Portal", "authority": "ONEGOV Portal", "time": "Completed", "icon": "✓"},
                {"id": 2, "name": "Identity Verification", "status": "VERIFIED", "dept": "Identity Dept", "authority": "DigiLocker / UIDAI (SIMULATED)", "time": "Completed", "icon": "✓"},
                {"id": 3, "name": "Education Verification", "status": "VERIFIED", "dept": "Education Dept", "authority": "ABC Registry", "time": "Completed", "icon": "✓"},
                {"id": 4, "name": "Revenue Verification", "status": "VERIFIED", "dept": "Revenue Dept", "authority": "CBDT SQL Gateway", "time": "Completed", "icon": "✓"},
                {"id": 5, "name": "Rules / Eligibility Check", "status": "IN_PROGRESS", "dept": "Interoperability Core", "authority": "ONEGOV Engine", "time": "Live", "icon": "⏳"},
                {"id": 6, "name": "Final Processing / Disbursement", "status": "PENDING", "dept": "Welfare Dept", "authority": "MSDE / Welfare Treasury", "time": "Queued", "icon": "○"}
            ]
        }
    },
    "audit_logs": [
        {
            "id": "LOG-INIT-001",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "event": "GATEWAY_INITIALIZED",
            "service": "ONEGOV Python Flask Interoperability Core",
            "status": "SUCCESS",
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "latencyMs": 12
        }
    ],
    "dead_letter_queue": []
}

# Department Gateway Circuit Breakers
circuit_breakers = {
    "identity": CircuitBreaker("UIDAI / DigiLocker Identity Gateway"),
    "education": CircuitBreaker("Academic Bank of Credits (SOAP/XML)"),
    "income": CircuitBreaker("CBDT / State Revenue Gateway (Direct SQL)"),
    "employment": CircuitBreaker("EPFO / Skill India Gateway (REST)"),
}

# Groq Client Initialization
groq_api_key = os.getenv("GROQ_API_KEY", "gsk_placeholder_key")
groq_client = None
if groq_api_key and groq_api_key != "gsk_placeholder_key":
    try:
        from groq import Groq
        groq_client = Groq(api_key=groq_api_key)
    except Exception as e:
        print(f"Warning: Groq SDK initialization failed: {e}")

# Load Local Datasets safely
def load_json_dataset(filename):
    paths = [
        FRONTEND_DIR / filename,
        PROJECT_DIR / filename,
        BASE_DIR / filename
    ]
    for p in paths:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Could not read {p}: {e}")
    return {}

schemes_data = load_json_dataset("tamil_nadu_schemes.json").get("schemes", [])
jobs_data = load_json_dataset("jobs.json").get("jobs", [])
courses_data = load_json_dataset("courses.json").get("courses", [])
certs_data = load_json_dataset("certifications.json").get("certifications", [])
benefits_data = load_json_dataset("tn_financial_benefits.json").get("financial_benefits", [])

# Audit Logger Helper (Reused across Phase 1 & Phase 2)
def record_audit_log(event, service, status, details=None):
    details = details or {}
    actor = details.get("actor", "System Engine")
    role = details.get("role", "SYSTEM")
    ref_id = details.get("refId") or details.get("consent_id") or "N/A"
    
    entry = {
        "id": f"LOG-{random.randint(100000, 999999)}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "event": event,
        "actor": actor,
        "role": role,
        "refId": ref_id,
        "service": service,
        "status": status,
        "action": f"{event} executed by {actor}",
        "details": details,
        "hash": f"0x{random.randint(0x10000000, 0xFFFFFFFF):x}{random.randint(0x10000000, 0xFFFFFFFF):x}",
        "latencyMs": random.randint(14, 65)
    }
    in_memory_store["audit_logs"].insert(0, entry)
    if len(in_memory_store["audit_logs"]) > 200:
        in_memory_store["audit_logs"].pop()
    return entry


# ============================================================================
# STATIC ROUTES & FRONTEND SERVING
# ============================================================================
@app.route("/")
def serve_index():
    return send_file(str(PROJECT_DIR / "index.html"))

@app.route("/style.css")
def serve_css():
    return send_file(str(PROJECT_DIR / "style.css"))

@app.route("/script.js")
def serve_js():
    return send_file(str(PROJECT_DIR / "script.js"))

@app.route("/frontend/")
@app.route("/frontend/index.html")
def serve_frontend_root():
    return send_from_directory(str(FRONTEND_DIR), "index.html")

@app.route("/frontend/<path:filename>")
def serve_frontend_files(filename):
    return send_from_directory(str(FRONTEND_DIR), filename)




# ============================================================================
# 1. FEDERATED IDENTITY & SSO (OIDC / DIGILOCKER / MERIPEHCHAN)
# ============================================================================
@app.route("/api/auth/providers", methods=["GET"])
def get_auth_providers():
    return jsonify({
        "success": True,
        "providers": [
            {
                "id": "digilocker",
                "name": "DigiLocker / MeriPehchan National SSO",
                "authority": "National Informatics Centre (NIC) & MeitY",
                "protocol": "OpenID Connect (OIDC) / OAuth 2.0",
                "scopes": ["openid", "profile", "identity.aadhaar_kyc", "academic.abc_nad", "income.cbdt"],
                "icon": "🇮🇳"
            },
            {
                "id": "epramaan",
                "name": "e-Pramaan National e-Authentication",
                "authority": "C-DAC",
                "protocol": "SAML 2.0 / OIDC",
                "scopes": ["openid", "profile"],
                "icon": "🛡️"
            }
        ]
    })

@app.route("/api/auth/oidc/authorize", methods=["POST"])
def oidc_authorize():
    data = request.get_json() or {}
    provider = data.get("provider", "digilocker")
    citizen_type = data.get("citizen_type", "student")
    
    mock_citizens = {
        "student": {
            "sub": "IND-8842",
            "name": "Aarav Sharma",
            "aadhaar_masked": "XXXX-XXXX-8842",
            "dob": "2003-08-14",
            "gender": "M",
            "state": "Delhi",
            "district": "Central Delhi",
            "pincode": "110001",
            "mobile": "9876543210",
            "email": "aarav.sharma@example.gov.in",
            "category": "student",
            "eduLevel": "Undergraduate",
            "course": "B.Tech Computer Science",
            "college": "Delhi Technological University",
            "currentYear": "3rd Year",
            "familyIncome": "₹2.5 Lakhs - ₹5 Lakhs",
            "studentSkills": "Python, Web Development, SQL"
        },
        "employed": {
            "sub": "IND-3321",
            "name": "Sunita Verma",
            "aadhaar_masked": "XXXX-XXXX-3321",
            "dob": "1994-05-22",
            "gender": "F",
            "state": "Maharashtra",
            "district": "Pune",
            "pincode": "411001",
            "mobile": "9812345678",
            "email": "sunita.verma@example.gov.in",
            "category": "employed",
            "empStatus": "Employed Full-Time",
            "empType": "Private",
            "jobRole": "Senior Software Engineer",
            "highestQualification": "B.Tech IT",
            "annualIncome": "₹7 Lakhs - ₹15 Lakhs",
            "empSkills": "Cloud Infrastructure, DevOps"
        },
        "unemployed": {
            "sub": "IND-5412",
            "name": "Priya Sundaram",
            "aadhaar_masked": "XXXX-XXXX-5412",
            "dob": "2001-11-19",
            "gender": "F",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "pincode": "600001",
            "mobile": "9445123456",
            "email": "priya.sundaram@example.gov.in",
            "category": "unemployed",
            "unempQual": "Graduate",
            "unempCourse": "B.Sc Electronics",
            "unempSkills": "Python, Technical Support, Tally",
            "prevExp": "Fresher"
        }
    }

    citizen_data = mock_citizens.get(citizen_type, mock_citizens["student"])
    auth_code = f"AUTH_CODE_{random.randint(10000000, 99999999)}"

    record_audit_log("OIDC_AUTH_CHALLENGE", f"Federated SSO ({provider.upper()})", "SUCCESS", {
        "sub": citizen_data["sub"],
        "auth_code": auth_code
    })

    return jsonify({
        "success": True,
        "auth_code": auth_code,
        "redirect_uri": "/auth/callback",
        "state": data.get("state", "oneg_session_init"),
        "claims_preview": {
            "name": citizen_data["name"],
            "aadhaar": citizen_data["aadhaar_masked"],
            "state": citizen_data["state"]
        }
    })

@app.route("/api/auth/oidc/token", methods=["POST"])
def oidc_token():
    data = request.get_json() or {}
    auth_code = data.get("auth_code")
    citizen_type = data.get("citizen_type", "student")

    mock_citizens = {
        "student": {
            "sub": "IND-8842",
            "name": "Aarav Sharma",
            "aadhaar_masked": "XXXX-XXXX-8842",
            "dob": "2003-08-14",
            "gender": "M",
            "state": "Delhi",
            "district": "Central Delhi",
            "pincode": "110001",
            "mobile": "9876543210",
            "email": "aarav.sharma@example.gov.in",
            "category": "student",
            "eduLevel": "Undergraduate",
            "course": "B.Tech Computer Science",
            "college": "Delhi Technological University",
            "currentYear": "3rd Year",
            "familyIncome": "₹2.5 Lakhs - ₹5 Lakhs",
            "studentSkills": "Python, Web Development, SQL"
        },
        "employed": {
            "sub": "IND-3321",
            "name": "Sunita Verma",
            "aadhaar_masked": "XXXX-XXXX-3321",
            "dob": "1994-05-22",
            "gender": "F",
            "state": "Maharashtra",
            "district": "Pune",
            "pincode": "411001",
            "mobile": "9812345678",
            "email": "sunita.verma@example.gov.in",
            "category": "employed",
            "empStatus": "Employed Full-Time",
            "empType": "Private",
            "jobRole": "Senior Software Engineer",
            "highestQualification": "B.Tech IT",
            "annualIncome": "₹7 Lakhs - ₹15 Lakhs",
            "empSkills": "Cloud Infrastructure, DevOps"
        },
        "unemployed": {
            "sub": "IND-5412",
            "name": "Priya Sundaram",
            "aadhaar_masked": "XXXX-XXXX-5412",
            "dob": "2001-11-19",
            "gender": "F",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "pincode": "600001",
            "mobile": "9445123456",
            "email": "priya.sundaram@example.gov.in",
            "category": "unemployed",
            "unempQual": "Graduate",
            "unempCourse": "B.Sc Electronics",
            "unempSkills": "Python, Technical Support, Tally",
            "prevExp": "Fresher"
        }
    }

    citizen = mock_citizens.get(citizen_type, mock_citizens["student"])
    now = int(time.time())
    jwt_payload = {
        "iss": "https://auth.meripehchan.gov.in",
        "sub": citizen["sub"],
        "aud": "oneg-national-portal",
        "iat": now,
        "exp": now + 86400,  # 24 hours
        "citizen": citizen,
        "auth_provider": "DigiLocker / MeriPehchan (OIDC 2.0)",
        "verified_credentials": ["UIDAI_AADHAAR_eKYC", "NAD_ACADEMIC_CREDENTIALS", "CBDT_INCOME_LINKAGE"]
    }

    token = create_jwt_token(jwt_payload)
    
    # Save into in-memory store
    user_id = citizen["sub"]
    in_memory_store["profiles"][user_id] = {**citizen, "userId": user_id, "verifiedSSO": True}

    record_audit_log("JWT_BEARER_ISSUED", "MeriPehchan OIDC Identity Provider", "SUCCESS", {
        "sub": user_id,
        "token_preview": token[:24] + "..."
    })

    return jsonify({
        "success": True,
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 86400,
        "citizen_claims": citizen
    })

@app.route("/api/auth/userinfo", methods=["GET"])
def oidc_userinfo():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Bearer token required"}), 401
    
    token = auth_header[7:]
    payload, err = verify_jwt_token(token)
    if err:
        return jsonify({"error": err}), 401
    
    return jsonify({
        "success": True,
        "claims": payload.get("citizen", {}),
        "auth_provider": payload.get("auth_provider"),
        "verified_credentials": payload.get("verified_credentials")
    })


# ============================================================================
# 2. RESILIENCE & CIRCUIT BREAKER ENDPOINTS
# ============================================================================
@app.route("/api/resilience/status", methods=["GET"])
def resilience_status():
    breakers_data = {k: v.get_status() for k, v in circuit_breakers.items()}
    return jsonify({
        "success": True,
        "circuit_breakers": breakers_data,
        "dlq_count": len(in_memory_store["dead_letter_queue"]),
        "dlq_items": in_memory_store["dead_letter_queue"]
    })

@app.route("/api/resilience/circuit-breaker/toggle", methods=["POST"])
def toggle_circuit_breaker():
    data = request.get_json() or {}
    dept_key = data.get("dept_key")
    if dept_key not in circuit_breakers:
        return jsonify({"error": f"Unknown department key: {dept_key}"}), 400

    cb = circuit_breakers[dept_key]
    cb.manual_override = not cb.manual_override
    new_state = "OPEN (Simulated Outage)" if cb.manual_override else "CLOSED (Healthy)"

    record_audit_log("CIRCUIT_BREAKER_TOGGLED", f"Resilience Controller ({cb.name})", "WARN" if cb.manual_override else "SUCCESS", {
        "newState": new_state
    })

    return jsonify({
        "success": True,
        "dept_key": dept_key,
        "name": cb.name,
        "manual_override": cb.manual_override,
        "state": new_state
    })

@app.route("/api/resilience/dlq", methods=["GET"])
def get_dlq():
    return jsonify({
        "success": True,
        "total": len(in_memory_store["dead_letter_queue"]),
        "items": in_memory_store["dead_letter_queue"]
    })

@app.route("/api/resilience/dlq/<item_id>/retry", methods=["POST"])
def retry_dlq_item(item_id):
    item = next((x for x in in_memory_store["dead_letter_queue"] if x["id"] == item_id), None)
    if not item:
        return jsonify({"error": "Item not found in DLQ"}), 404

    # Remove from DLQ and record success
    in_memory_store["dead_letter_queue"] = [x for x in in_memory_store["dead_letter_queue"] if x["id"] != item_id]
    record_audit_log("DLQ_MESSAGE_REPROCESSED", "Resilience DLQ Worker", "SUCCESS", {
        "item_id": item_id,
        "targetService": item.get("service")
    })

    return jsonify({
        "success": True,
        "message": f"Message {item_id} successfully re-dispatched and resolved.",
        "remaining_dlq_count": len(in_memory_store["dead_letter_queue"])
    })


# ============================================================================
# 3. INTEROPERABILITY MIDDLEWARE & ADAPTERS
# ============================================================================
@app.route("/api/interop/adapters/test", methods=["POST"])
def test_adapters():
    """Demonstrates multi-protocol adapter normalization (SOAP XML -> JSON, Tabular -> JSON)."""
    # 1. SOAP XML Sample
    raw_soap_sample = SoapXmlAdapter.generate_soap_response({
        "InstitutionName": "Anna University",
        "DegreeCourse": "B.Tech Information Technology",
        "CumulativeScore": "8.85",
        "EnrollmentStatus": "ACTIVE",
        "AbcCredentialId": "ABC-8832-9912"
    })
    parsed_soap = SoapXmlAdapter.parse_envelope(raw_soap_sample)
    normalized_soap = SoapXmlAdapter.normalize_to_ocds(parsed_soap)

    # 2. Legacy Tabular SQL Row
    legacy_sql_row = {
        "INC_CERT_NUM": "INC-TN-2025-0091",
        "ANN_INC_VAL": 180000,
        "INC_TIER_CD": "LOW_INCOME_TIER_1",
        "EXPIRY_DT": "2026-03-31"
    }
    normalized_sql = LegacyDatabaseAdapter.normalize_tabular_row(legacy_sql_row)

    return jsonify({
        "success": True,
        "adapters_tested": {
            "soap_xml_adapter": {
                "raw_protocol": "SOAP 1.2 XML Envelope",
                "raw_envelope_preview": raw_soap_sample[:180] + "...",
                "parsed_dict": parsed_soap,
                "normalized_ocds": normalized_soap
            },
            "legacy_sql_adapter": {
                "raw_protocol": "Direct SQL Row / Tabular Data",
                "raw_row": legacy_sql_row,
                "normalized_ocds": normalized_sql
            },
            "rest_json_adapter": {
                "raw_protocol": "OpenAPI REST / JSON",
                "status": "ONLINE"
            }
        }
    })

@app.route("/api/interop/query", methods=["POST"])
def interop_query():
    data = request.get_json() or {}
    citizen_id = data.get("citizen_id", "IND-8842")
    target_systems = data.get("systems", ["Identity System", "Education System", "Income System"])

    raw_responses = {}
    errors = {}

    # Check Circuit Breakers before calling systems
    if "Identity System" in target_systems:
        if circuit_breakers["identity"].can_execute():
            raw_responses["Identity System"] = {
                "format": "JSON / UIDAI e-KYC Token (REST)",
                "raw": {
                    "uid_hash": "a4f8...b129",
                    "name": "Aarav Sharma",
                    "dob": "2003-08-14",
                    "gender": "M",
                    "state": "Delhi",
                    "auth_status": "SUCCESS"
                }
            }
            circuit_breakers["identity"].record_success()
        else:
            errors["Identity System"] = "Circuit Breaker OPEN: Identity Gateway unreachable"
            in_memory_store["dead_letter_queue"].append({
                "id": f"DLQ-{random.randint(10000, 99999)}",
                "service": "UIDAI Identity Gateway",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "payload": {"citizen_id": citizen_id},
                "error": "CIRCUIT_BREAKER_OPEN_TIMEOUT"
            })

    if "Education System" in target_systems:
        if circuit_breakers["education"].can_execute():
            raw_soap = SoapXmlAdapter.generate_soap_response({
                "InstitutionName": "Delhi Technological University",
                "DegreeCourse": "B.Tech Computer Science",
                "CumulativeScore": "8.85",
                "EnrollmentStatus": "ACTIVE",
                "AbcCredentialId": "ABC-8832-9912"
            })
            parsed_xml = SoapXmlAdapter.parse_envelope(raw_soap)
            normalized_academic = SoapXmlAdapter.normalize_to_ocds(parsed_xml)
            raw_responses["Education System"] = {
                "format": "SOAP 1.2 / XML Envelope (ABC NAD Registry)",
                "raw": parsed_xml,
                "normalized": normalized_academic
            }
            circuit_breakers["education"].record_success()
        else:
            errors["Education System"] = "Circuit Breaker OPEN: ABC NAD SOAP Registry unreachable"

    if "Income System" in target_systems:
        if circuit_breakers["income"].can_execute():
            legacy_row = {
                "INC_CERT_NUM": "INC-DL-2025-0091",
                "ANN_INC_VAL": 180000,
                "INC_TIER_CD": "LOW_INCOME_TIER_1",
                "EXPIRY_DT": "2026-03-31"
            }
            normalized_inc = LegacyDatabaseAdapter.normalize_tabular_row(legacy_row)
            raw_responses["Income System"] = {
                "format": "Direct SQL Table Sync (CBDT Revenue Gateway)",
                "raw": legacy_row,
                "normalized": normalized_inc
            }
            circuit_breakers["income"].record_success()
        else:
            errors["Income System"] = "Circuit Breaker OPEN: State Revenue SQL Gateway is in Outage"
            in_memory_store["dead_letter_queue"].append({
                "id": f"DLQ-{random.randint(10000, 99999)}",
                "service": "CBDT / Revenue Gateway",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "payload": {"citizen_id": citizen_id, "systems": target_systems},
                "error": "REVENUE_PORTAL_TIMEOUT_TRIPPED"
            })

    if "Employment System" in target_systems or "Skill System" in target_systems:
        if circuit_breakers["employment"].can_execute():
            raw_responses["Skill & Employment System"] = {
                "format": "REST / JSON (NCVET & EPFO)",
                "raw": {
                    "uan": "101928374655",
                    "skills": ["Python", "SQL", "Data Analytics"],
                    "certifications_count": 2,
                    "employment_status": "STUDENT_INTERN"
                }
            }
            circuit_breakers["employment"].record_success()

    # Transform into ONEGOV Common Data Standard (OCDS)
    normalized_ocds = {
        "standard_version": "OCDS-v2.4",
        "citizen_id": citizen_id,
        "verified_identity": {
            "legal_name": raw_responses.get("Identity System", {}).get("raw", {}).get("name", "Aarav Sharma"),
            "dob": raw_responses.get("Identity System", {}).get("raw", {}).get("dob", "2003-08-14"),
            "state": raw_responses.get("Identity System", {}).get("raw", {}).get("state", "Delhi"),
            "identity_verified": "Identity System" in raw_responses
        },
        "academic_records": raw_responses.get("Education System", {}).get("normalized", {
            "institution": "Delhi Technological University",
            "program": "B.Tech Computer Science",
            "academic_score": "8.85",
            "status": "ACTIVE"
        }),
        "socio_economic": {
            "family_annual_income": raw_responses.get("Income System", {}).get("raw", {}).get("ANN_INC_VAL", 180000),
            "income_verified": "Income System" in raw_responses,
            "eligibility_tier": "Tier-1 Priority Beneficiary"
        },
        "transformation_metrics": {
            "sources_queried": len(target_systems),
            "sources_responding": len(raw_responses),
            "faults_detected": len(errors),
            "execution_time_ms": random.randint(22, 65),
            "validation_checksum": "PASS_100_PERCENT" if not errors else "DEGRADED_PARTIAL_PASS"
        }
    }

    record_audit_log("INTEROP_QUERY_EXECUTED", "ONEGOV Schema Transformation Engine (Python)", "SUCCESS" if not errors else "PARTIAL_DEGRADED", {
        "systems": target_systems,
        "errors": errors
    })

    return jsonify({
        "success": True,
        "raw_department_responses": raw_responses,
        "errors": errors,
        "normalized_ocds": normalized_ocds
    })


# ============================================================================
# 4. GOVERNMENT OFFICER & ADMIN MANAGEMENT PORTAL
# ============================================================================
@app.route("/api/admin/overview", methods=["GET"])
def admin_overview():
    total_apps = len(in_memory_store["applications"])
    approved_count = sum(1 for a in in_memory_store["applications"].values() if a.get("currentStageIndex", 0) >= len(a.get("stages", [])))
    in_review_count = total_apps - approved_count
    
    return jsonify({
        "success": True,
        "metrics": {
            "total_applications": total_apps,
            "in_review": in_review_count,
            "approved": approved_count,
            "verification_accuracy": "99.8%",
            "avg_processing_time_sec": "1.4s",
            "sla_compliance_rate": "98.5%",
            "active_gateways": f"{sum(1 for cb in circuit_breakers.values() if cb.state == 'CLOSED')} / {len(circuit_breakers)} Online"
        },
        "circuit_breakers": {k: v.get_status() for k, v in circuit_breakers.items()},
        "recent_audit_count": len(in_memory_store["audit_logs"]),
        "dlq_pending_count": len(in_memory_store["dead_letter_queue"])
    })

@app.route("/api/admin/applications", methods=["GET"])
def admin_get_applications():
    app_list = list(in_memory_store["applications"].values())
    return jsonify({
        "success": True,
        "total": len(app_list),
        "applications": app_list
    })

@app.route("/api/admin/applications/<ref_id>/action", methods=["POST"])
def admin_application_action(ref_id):
    data = request.get_json() or {}
    action = data.get("action")  # "APPROVE_STAGE", "APPROVE_FINAL", "REJECT", "VERIFY_STAGE"
    officer_notes = data.get("notes", "Verified across national registry APIs.")
    rejection_reason = data.get("reason", "Eligibility criteria not satisfied")

    app_record = in_memory_store["applications"].get(ref_id)
    if not app_record:
        return jsonify({"error": "Application not found"}), 404

    current_idx = app_record.get("currentStageIndex", 0)
    stages = app_record.get("stages", [])

    if action == "APPROVE_STAGE":
        if current_idx < len(stages):
            stages[current_idx]["status"] = "VERIFIED"
            stages[current_idx]["icon"] = "✓"
            stages[current_idx]["time"] = datetime.datetime.now(datetime.timezone.utc).strftime("%d %b %Y, %H:%M UTC")
            if current_idx + 1 < len(stages):
                stages[current_idx + 1]["status"] = "IN_PROGRESS"
                stages[current_idx + 1]["icon"] = "⏳"
                stages[current_idx + 1]["time"] = "Live"
                app_record["currentStageIndex"] = current_idx + 1
                app_record["overallStatus"] = f"Stage {current_idx + 2}: {stages[current_idx + 1]['name']} In Progress"
            else:
                app_record["currentStageIndex"] = len(stages)
                app_record["overallStatus"] = "APPROVED & SANCTIONED"
        
        record_audit_log("APPROVAL", "Government Officer Portal", "SUCCESS", {
            "refId": ref_id,
            "actor": "Government Officer",
            "role": "OFFICER",
            "stage": stages[min(current_idx, len(stages)-1)]["name"] if stages else "Approval",
            "notes": officer_notes
        })

    elif action == "APPROVE_FINAL":
        app_record["currentStageIndex"] = len(stages)
        app_record["overallStatus"] = "APPROVED & SANCTIONED"
        timestamp_now = datetime.datetime.now(datetime.timezone.utc).strftime("%d %b %Y, %H:%M UTC")
        for st in stages:
            st["status"] = "VERIFIED"
            st["icon"] = "✓"
            st["time"] = timestamp_now

        record_audit_log("APPROVAL", "Government Officer Portal", "SUCCESS", {
            "refId": ref_id,
            "actor": "Government Officer",
            "role": "OFFICER",
            "action": f"Application {ref_id} approved by Government Officer",
            "notes": officer_notes
        })

    elif action == "REJECT":
        app_record["overallStatus"] = f"REJECTED: {rejection_reason}"
        timestamp_now = datetime.datetime.now(datetime.timezone.utc).strftime("%d %b %Y, %H:%M UTC")
        if current_idx < len(stages):
            stages[current_idx]["status"] = "FAILED"
            stages[current_idx]["icon"] = "✕"
            stages[current_idx]["time"] = f"Rejected: {rejection_reason} ({timestamp_now})"

        record_audit_log("REJECTION", "Government Officer Portal", "FAILED", {
            "refId": ref_id,
            "actor": "Government Officer",
            "role": "OFFICER",
            "reason": rejection_reason,
            "action": f"Application {ref_id} rejected: {rejection_reason}",
            "notes": officer_notes
        })

    elif action == "VERIFY_STAGE":
        verify_status = data.get("status", "VERIFIED")
        stage_name = "Stage Processing"
        timestamp_now = datetime.datetime.now(datetime.timezone.utc).strftime("%d %b %Y, %H:%M UTC")
        if current_idx < len(stages):
            stage_name = stages[current_idx]["name"]
            stages[current_idx]["status"] = verify_status
            stages[current_idx]["icon"] = "✓" if verify_status == "VERIFIED" else ("✕" if verify_status == "FAILED" else "⏳")
            stages[current_idx]["time"] = timestamp_now

            if verify_status == "VERIFIED":
                if current_idx + 1 < len(stages):
                    stages[current_idx + 1]["status"] = "IN_PROGRESS"
                    stages[current_idx + 1]["icon"] = "⏳"
                    stages[current_idx + 1]["time"] = "Live"
                    app_record["currentStageIndex"] = current_idx + 1
                    app_record["overallStatus"] = f"Stage {current_idx + 2}: {stages[current_idx + 1]['name']} In Progress"
                else:
                    app_record["currentStageIndex"] = len(stages)
                    app_record["overallStatus"] = "APPROVED & SANCTIONED"
            elif verify_status == "FAILED":
                app_record["overallStatus"] = f"FAILED: Verification Failed at {stage_name}"

        record_audit_log("VERIFICATION", "Government Officer Portal", "SUCCESS" if verify_status == "VERIFIED" else "FAILED", {
            "refId": ref_id,
            "actor": "Government Officer",
            "role": "OFFICER",
            "stage": stage_name,
            "status": verify_status,
            "action": f"Stage '{stage_name}' marked as {verify_status} for {ref_id}",
            "notes": officer_notes
        })

    return jsonify({
        "success": True,
        "action": action,
        "application": app_record
    })

@app.route("/api/audit-logs/record", methods=["POST"])
def post_audit_log():
    data = request.get_json() or {}
    event = data.get("event", "API_REQUEST")
    service = data.get("service", "ONEGOV Platform Core")
    status = data.get("status", "SUCCESS")
    details = data.get("details", {})
    entry = record_audit_log(event, service, status, details)
    return jsonify({"success": True, "log": entry})

@app.route("/api/admin/telemetry", methods=["GET"])
def admin_telemetry():
    """Real-time latency benchmarks and live department throughput metrics."""
    return jsonify({
        "success": True,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "gateways": [
            {"name": "DigiLocker / UIDAI Identity Gateway", "latency_ms": random.randint(15, 28), "status": circuit_breakers["identity"].state, "throughput_rpm": 1420},
            {"name": "Academic Bank of Credits (ABC SOAP)", "latency_ms": random.randint(35, 52), "status": circuit_breakers["education"].state, "throughput_rpm": 890},
            {"name": "CBDT / State Revenue SQL Gateway", "latency_ms": random.randint(45, 80), "status": circuit_breakers["income"].state, "throughput_rpm": 640},
            {"name": "EPFO / Skill India REST Gateway", "latency_ms": random.randint(20, 38), "status": circuit_breakers["employment"].state, "throughput_rpm": 1120}
        ]
    })


# ============================================================================
# 5. CITIZEN CORE API ENDPOINTS (WORKFLOW, ONBOARDING, CONSENT, AI)
# ============================================================================
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "OK",
        "service": "ONEGOV National Interoperability Middleware",
        "engine": "Python 3.12 / Flask 3.1",
        "subsystems": {
            "federated_sso": "ONLINE (DigiLocker/MeriPehchan OIDC)",
            "resilience_engine": "ONLINE (Circuit Breakers + DLQ)",
            "legacy_adapters": "ONLINE (SOAP XML, Direct SQL, REST)",
            "dpdp_consent_gateway": "ONLINE",
            "workflow_orchestrator": "ONLINE",
            "groq_ai_profiler": "ONLINE" if groq_client else "FALLBACK_RULE_ENGINE"
        }
    })

# AI Assistant Chat (Multilingual: English, Hindi, Tamil)
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    messages = data.get("messages", [])
    language = data.get("language", "en") # en, hi, ta
    if not messages or not isinstance(messages, list):
        return jsonify({"error": "messages array is required"}), 400

    user_query = messages[-1].get("content", "") if messages else ""

    if groq_client:
        try:
            system_prompt = (
                "You are ONEGOV AI Co-Pilot, an intelligent, empathetic national citizen services assistant for India. "
                "You provide precise guidance on scholarships, jobs, welfare schemes, DigiLocker e-KYC, and multi-department interoperability. "
                f"Respond clearly and helpfully in the requested language: {language.upper()} (English, Hindi, or Tamil). "
                "Keep answers concise, structured, and informative with bullet points where appropriate."
            )
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "system", "content": system_prompt}, *messages],
                model="llama-3.3-70b-versatile",
                temperature=0.2
            )
            reply = chat_completion.choices[0].message
            return jsonify({"reply": {"role": reply.role, "content": reply.content}})
        except Exception as e:
            print(f"Groq Chat API error: {e}")

    # Rich Multilingual Rule-Based Fallback
    query_lower = user_query.lower()
    if language == "hi" or "नमस्ते" in user_query or "योजना" in user_query:
        if "scholarship" in query_lower or "छात्रवृत्ति" in user_query:
            content = "नमस्ते! राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) के तहत केंद्र और राज्य सरकार की छात्रवृत्तियां उपलब्ध हैं। ONEGOV आपके डिजीलॉकर और शैक्षणिक बैंक ऑफ क्रेडिट्स (ABC) से सीधे सत्यापन करके आपको तुरंत पात्र योजनाओं से जोड़ता है।"
        else:
            content = "नमस्ते! मैं ONEGOV AI सहायक हूँ। मैं आपको राष्ट्रीय छात्रवृत्ति, रोजगार योजनाओं और प्रमाण पत्र सत्यापन में मदद कर सकता हूँ।"
    elif language == "ta" or "வணக்கம்" in user_query or "திட்டம்" in user_query:
        if "scholarship" in query_lower or "கல்வி" in user_query:
            content = "வணக்கம்! தேசிய உதவித்தொகை போர்டல் (NSP) மூலம் நீங்கள் கல்வி உதவித்தொகைக்கு விண்ணப்பிக்கலாம். ONEGOV உங்கள் கல்வி மற்றும் வருமான சான்றிதழ்களை நேரடி API மூலம் தானாகவே சரிபார்க்கிறது."
        else:
            content = "வணக்கம்! நான் ONEGOV AI வழிகாட்டி. அரசு திட்டங்கள், வேலைவாய்ப்புகள் மற்றும் சான்றிதழ் விவரங்களை சரிபார்க்க நான் உங்களுக்கு உதவுகிறேன்."
    else:
        if "scholarship" in query_lower or "student" in query_lower:
            content = "ONEGOV connects directly with the National Scholarship Portal (NSP) and Academic Bank of Credits (ABC). With 1-Click DigiLocker verification, your academic marksheets and family income are cross-verified across ministries without repetitive document uploads."
        elif "digilocker" in query_lower or "sso" in query_lower or "login" in query_lower:
            content = "With DigiLocker / MeriPehchan Federated SSO on ONEGOV, you authenticate once using your Aadhaar-linked identity. All participating government platforms receive cryptographically signed DPDP tokens without exposing raw passwords."
        elif "track" in query_lower or "status" in query_lower:
            content = "You can track your application anytime using your Unified Reference ID (e.g., OG-2026-IND-8842) on the homepage. It displays live verification milestones across DigiLocker, ABC Depository, and the Revenue Gateway."
        else:
            content = "I am your ONEGOV AI Assistant! I can help you discover personalized government schemes, explain eligibility criteria, guide your DigiLocker verification, and track cross-department applications in real-time."

    return jsonify({
        "reply": {
            "role": "assistant",
            "content": content
        }
    })

# Digital Sanction Certificate Verification & Download
@app.route("/api/certificate/<ref_id>", methods=["GET"])
def get_sanction_certificate(ref_id):
    app_record = in_memory_store["applications"].get(ref_id)
    if not app_record:
        app_record = {
            "refId": ref_id,
            "serviceName": "National Scholarship Portal (NSP)",
            "dept": "Ministry of Education",
            "citizenId": "IND-8842",
            "citizenName": "Aarav Sharma",
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    cert_no = f"SANCTION-{ref_id}"
    verification_hash = hashlib.sha256(f"{ref_id}:{app_record.get('citizenId')}:{app_record.get('serviceName')}".encode()).hexdigest()
    qr_payload = f"https://oneg.gov.in/verify/{cert_no}?hash=0x{verification_hash[:16]}"

    certificate = {
        "certificateNumber": cert_no,
        "refId": ref_id,
        "issueDate": datetime.datetime.now(datetime.timezone.utc).strftime("%d %B %Y, %H:%M UTC"),
        "beneficiaryName": app_record.get("citizenName", "Aarav Sharma"),
        "citizenId": app_record.get("citizenId", "IND-8842"),
        "serviceName": app_record.get("serviceName", "National Scholarship Portal (NSP)"),
        "ministry": app_record.get("dept", "Ministry of Education"),
        "digitalSeal": f"0xSEAL_{verification_hash[:24].upper()}",
        "verificationUrl": qr_payload,
        "status": "SANCTIONED & DISBURSED",
        "signatories": [
            {"authority": "National Informatics Centre (NIC)", "role": "Interoperability Gateway Root", "status": "CRYPTOGRAPHICALLY_SIGNED"},
            {"authority": "Academic Bank of Credits (ABC)", "role": "Academic Depository Verifier", "status": "RECORD_AUTHENTICATED"},
            {"authority": "Central Board of Direct Taxes (CBDT)", "role": "Revenue & Income Verification", "status": "INCOME_CONFIRMED"},
            {"authority": "Ministry of Finance - DBT Bharat", "role": "Public Financial Management System", "status": "DISBURSEMENT_SANCTIONED"}
        ]
    }

    record_audit_log("SANCTION_CERTIFICATE_GENERATED", "Digital Certificate Engine", "SUCCESS", {
        "certNo": cert_no,
        "refId": ref_id
    })

    return jsonify({
        "success": True,
        "certificate": certificate
    })

# Audit Vault & Telemetry Logs
@app.route("/api/audit-logs", methods=["GET"])
def get_audit_logs():
    return jsonify({
        "success": True,
        "totalLogs": len(in_memory_store["audit_logs"]),
        "logs": in_memory_store["audit_logs"]
    })

# AI Profile Eligibility Analyzer
@app.route("/api/analyze-profile", methods=["POST"])
def analyze_profile():
    profile = request.get_json() or {}
    if not profile:
        return jsonify({"error": "profile is required"}), 400

    result = None
    if groq_client:
        try:
            system_prompt = "You are the ONEGOV AI Citizen Profiler. Analyze the user profile and match it against government schemes, jobs, courses, certifications, and financial benefits. Return ONLY valid JSON with keys: matchedSchemes, matchedJobs, matchedCourses, skillGaps, matchedCertifications, matchedBenefits."
            user_prompt = f"USER PROFILE:\n{json.dumps(profile, indent=2)}"
            
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.1
            )
            raw_text = chat_completion.choices[0].message.content.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            result = json.loads(raw_text.strip())
        except Exception as e:
            print(f"Groq Profiler Error, using rule-based fallback: {e}")

    if not result:
        matched_schemes = [s.get("id") for s in schemes_data[:3] if s.get("id")]
        matched_jobs = [j.get("job_id") for j in jobs_data[:3] if j.get("job_id")]
        matched_courses = [c.get("id") for c in courses_data[:3] if c.get("id")]
        matched_certs = [c.get("certification_id") for c in certs_data[:2] if c.get("certification_id")]
        matched_benefits = [b.get("id") for b in benefits_data[:2] if b.get("id")]

        result = {
            "matchedSchemes": matched_schemes or ["tn-pudhumai-penn", "S001", "S002"],
            "matchedJobs": matched_jobs or ["JOB001", "JOB002"],
            "matchedCourses": matched_courses or ["C001", "C002"],
            "skillGaps": ["Cloud Computing", "Data Analytics", "API Interoperability"],
            "matchedCertifications": matched_certs or ["CERT001"],
            "matchedBenefits": matched_benefits or ["FIN-TN-001"]
        }

    record_audit_log("AI_PROFILE_MATCHED", "Python Groq Profiler", "SUCCESS", {
        "schemesCount": len(result.get("matchedSchemes", []))
    })

    return jsonify(result)

# Onboarding Profile Storage
@app.route("/api/onboarding", methods=["POST"])
def save_onboarding():
    data = request.get_json() or {}
    user_id = data.get("userId") or data.get("user_id") or f"IND-{random.randint(1000, 9999)}"
    data["userId"] = user_id
    data["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    in_memory_store["profiles"][user_id] = data
    record_audit_log("CITIZEN_PROFILE_SAVED", "Identity & Onboarding Service", "SUCCESS", {"userId": user_id})

    return jsonify({
        "success": True,
        "message": "Onboarding profile saved successfully",
        "data": data,
        "userId": user_id
    }), 201

@app.route("/api/onboarding/<user_id>", methods=["GET"])
def get_onboarding(user_id):
    profile = in_memory_store["profiles"].get(user_id)
    if profile:
        return jsonify({"success": True, "data": profile})
    return jsonify({"success": False, "message": "Profile not found"}), 404

# Web Push Notifications
@app.route("/api/notifications/vapid-key", methods=["GET"])
def get_vapid_key():
    key = os.getenv("VAPID_PUBLIC_KEY", "BGtu3qMMWkvN2B2FJh3OTkg2JJf5eA2Y8hx7DdX8zuMA5qWNXTppbHmqSUArT5dF5W6C4D5GZ4B6dnbyeD3mT_A")
    return jsonify({"publicKey": key})

@app.route("/api/notifications/subscribe", methods=["POST"])
def subscribe_notifications():
    data = request.get_json() or {}
    if not data or not data.get("endpoint"):
        return jsonify({"error": "Subscription endpoint is required"}), 400
    
    endpoint = data.get("endpoint")
    existing = [s for s in in_memory_store["subscriptions"] if s.get("endpoint") == endpoint]
    if not existing:
        in_memory_store["subscriptions"].append(data)
    
    record_audit_log("NOTIFICATION_SUBSCRIBED", "Web Push Service", "SUCCESS")
    return jsonify({"success": True, "message": "Subscription registered successfully"}), 201

@app.route("/api/notifications/send", methods=["POST"])
def send_notification():
    data = request.get_json() or {}
    title = data.get("title")
    body = data.get("body")
    if not title or not body:
        return jsonify({"error": "Title and body are required"}), 400
    
    record_audit_log("NOTIFICATION_BROADCAST", "Web Push Service", "SUCCESS", {"title": title})
    return jsonify({"success": True, "count": len(in_memory_store["subscriptions"])})

# DPDP Consent Gateway
@app.route("/api/consent/grant", methods=["POST"])
def grant_consent():
    data = request.get_json() or {}
    consent_id = f"CNS-{random.randint(100000, 999999)}"
    now = datetime.datetime.now(datetime.timezone.utc)
    expires = now + datetime.timedelta(days=30)

    consent_record = {
        "consent_id": consent_id,
        "service_id": data.get("service_id", "S001"),
        "citizen_id": data.get("citizen_id", "IND-8842"),
        "requesting_dept": data.get("requesting_dept", "Ministry of Education"),
        "systems_authorized": data.get("required_systems", ["Education System", "Income System", "Identity System"]),
        "purpose": data.get("purpose", "Multi-department automated verification and entitlement determination"),
        "data_requested": data.get("data_requested", "Aadhaar e-KYC, Academic Marksheet Token, Income Declaration"),
        "status": "GRANTED",
        "timestamp": now.isoformat(),
        "expires_at": expires.isoformat(),
        "legal_framework": "DPDP Act 2023 Compliant",
        "signature": f"0xSIG_{random.randint(0x10000000, 0xFFFFFFFF):x}"
    }

    in_memory_store["consents"][consent_id] = consent_record
    record_audit_log("CONSENT_GRANTED", "ONEGOV DPDP Consent Gateway", "SUCCESS", {
        "consent_id": consent_id,
        "systems": consent_record["systems_authorized"]
    })

    return jsonify({"success": True, "consent": consent_record}), 201

@app.route("/api/consent/deny", methods=["POST"])
def deny_consent():
    data = request.get_json() or {}
    consent_id = f"CNS-DENIED-{random.randint(100000, 999999)}"
    now = datetime.datetime.now(datetime.timezone.utc)

    consent_record = {
        "consent_id": consent_id,
        "service_id": data.get("service_id", "S001"),
        "citizen_id": data.get("citizen_id", "IND-8842"),
        "requesting_dept": data.get("requesting_dept", "Department Requesting Access"),
        "systems_authorized": [],
        "purpose": data.get("purpose", "Service Application Data Access"),
        "data_requested": data.get("data_requested", "Verified Identity & Academic Credentials"),
        "status": "DENIED",
        "timestamp": now.isoformat(),
        "legal_framework": "DPDP Act 2023 Compliant"
    }

    in_memory_store["consents"][consent_id] = consent_record
    record_audit_log("CONSENT_DENIED", "ONEGOV DPDP Consent Gateway", "WARN", {
        "consent_id": consent_id,
        "reason": "Citizen explicitly denied consent"
    })

    return jsonify({"success": True, "consent": consent_record}), 200

@app.route("/api/consent/history", methods=["GET"])
def get_consent_history():
    history = list(in_memory_store["consents"].values())
    history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return jsonify({
        "success": True,
        "total": len(history),
        "history": history
    })

# Workflow State Machine & Application Tracking
@app.route("/api/workflow/apply", methods=["POST"])
def workflow_apply():
    data = request.get_json() or {}
    ref_id = f"OG-2026-IND-{random.randint(1000, 9999)}"
    citizen_id = data.get("citizen_id", "IND-8842")
    citizen_name = data.get("citizen_name", "Aarav Sharma")

    stages = [
        {"id": 1, "name": "Citizen Request", "status": "VERIFIED", "dept": "Citizen Portal", "authority": "ONEGOV Portal", "time": "Completed", "icon": "✓"},
        {"id": 2, "name": "Identity Verification", "status": "VERIFIED", "dept": "Identity Dept", "authority": "DigiLocker / UIDAI (SIMULATED)", "time": "Completed", "icon": "✓"},
        {"id": 3, "name": "Education Verification", "status": "IN_PROGRESS", "dept": "Education Dept", "authority": "Academic Bank of Credits (SOAP XML)", "time": "Live", "icon": "⏳"},
        {"id": 4, "name": "Revenue Verification", "status": "PENDING", "dept": "Revenue Dept", "authority": "CBDT / State Revenue SQL Gateway", "time": "Queued", "icon": "○"},
        {"id": 5, "name": "Rules / Eligibility Check", "status": "PENDING", "dept": "Interoperability Core", "authority": "ONEGOV Rules Engine", "time": "Queued", "icon": "○"},
        {"id": 6, "name": "Final Processing / Disbursement", "status": "PENDING", "dept": "Welfare Dept", "authority": "National Treasury / Welfare Direct Benefit", "time": "Queued", "icon": "○"}
    ]

    application = {
        "refId": ref_id,
        "serviceId": data.get("service_id", "S001"),
        "serviceName": data.get("service_name", "National Scholarship Portal (NSP)"),
        "dept": data.get("dept", "Ministry of Education"),
        "citizenId": citizen_id,
        "citizenName": citizen_name,
        "currentStageIndex": 2,
        "overallStatus": "Stage 3: Education Verification In Progress",
        "stages": stages,
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "slaDeadline": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3)).isoformat(),
        "slaBreached": False
    }

    in_memory_store["applications"][ref_id] = application
    record_audit_log("APPLICATION_SUBMITTED", "Python Workflow Orchestrator", "SUCCESS", {"refId": ref_id})

    return jsonify({"success": True, "application": application}), 201

@app.route("/api/workflow/<ref_id>/advance", methods=["POST"])
def workflow_advance(ref_id):
    app_record = in_memory_store["applications"].get(ref_id)
    if not app_record:
        return jsonify({"success": False, "message": "Application not found"}), 404

    current_idx = app_record["currentStageIndex"]
    stages = app_record["stages"]

    if current_idx < len(stages):
        stages[current_idx]["status"] = "VERIFIED"
        stages[current_idx]["icon"] = "✓"
        stages[current_idx]["time"] = "Completed"

        if current_idx + 1 < len(stages):
            stages[current_idx + 1]["status"] = "IN_PROGRESS"
            stages[current_idx + 1]["icon"] = "⏳"
            stages[current_idx + 1]["time"] = "Live"
            app_record["currentStageIndex"] = current_idx + 1
            app_record["overallStatus"] = f"Stage {current_idx + 2} of {len(stages)} in progress"
        else:
            app_record["currentStageIndex"] = len(stages)
            app_record["overallStatus"] = "APPROVED & DISBURSED"

        completed_stage = stages[current_idx]
        record_audit_log("STAGE_ADVANCED", "Python Workflow State Machine", "SUCCESS", {
            "refId": ref_id,
            "stage": completed_stage["name"]
        })

    return jsonify({"success": True, "application": app_record})

@app.route("/api/workflow/<ref_id>", methods=["GET"])
def get_workflow_status(ref_id):
    app_record = in_memory_store["applications"].get(ref_id)
    if app_record:
        return jsonify({"success": True, "application": app_record})
    return jsonify({"success": False, "message": f"Application {ref_id} not found"}), 404


# ============================================================================
# UNIFIED MULTI-PAGE & STATIC RESOURCE RESOLVER (Catch-all after APIs)
# ============================================================================
@app.route("/<path:filename>")

def serve_any_file(filename):
    # 1. Check if file exists directly in frontend directory
    frontend_path = FRONTEND_DIR / filename
    if frontend_path.is_file():
        return send_from_directory(str(FRONTEND_DIR), filename)
    
    # 2. Check if file exists in project root directory
    root_path = PROJECT_DIR / filename
    if root_path.is_file():
        return send_from_directory(str(PROJECT_DIR), filename)
    
    # 3. Check for HTML fallback (e.g. /category -> /category.html)
    frontend_html = FRONTEND_DIR / f"{filename}.html"
    if frontend_html.is_file():
        return send_from_directory(str(FRONTEND_DIR), f"{filename}.html")

    return jsonify({"error": f"File '{filename}' not found", "status": 404}), 404


if __name__ == "__main__":

    port = int(os.getenv("PORT", 5000))
    print("=======================================================")
    print(f">> ONEGOV National Interoperability Middleware Platform")
    print(f">> Full Enterprise Core (OIDC SSO, Adapters, Resilience, Admin Portal)")
    print(f">> Running at http://localhost:{port}")
    print("=======================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
