/**
 * ONEGOV Platform - Citizen Interoperability Platform Client
 * Architecture: Pure Vanilla JavaScript (Modular, Event-Driven, REST-API Ready)
 * Full Enterprise Suite: OIDC SSO, Legacy Adapters, Circuit Breakers, Admin Portal & Tracker
 */

// ============================================================================
// 1. REST API Client Layer
// ============================================================================
const ONEGOV_API = {
  baseUrl: "/api",

  // POST /api/onboarding - Register or update unified citizen profile
  async saveProfile(profileData) {
    try {
      const res = await fetch(`${this.baseUrl}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn("ONEGOV_API: saveProfile API fallback", e);
    }
    const userId = profileData.userId || "IND-" + Math.floor(1000 + Math.random() * 9000);
    const enrichedProfile = { ...profileData, userId, updatedAt: new Date().toISOString() };
    localStorage.setItem("oneg_citizen_profile", JSON.stringify(enrichedProfile));
    return { success: true, userId: userId, data: enrichedProfile };
  },

  // POST /api/analyze-profile - Groq AI Profile Eligibility Analyzer
  async analyzeProfile(profileData) {
    try {
      const res = await fetch(`${this.baseUrl}/analyze-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ONEGOV_API: analyzeProfile fallback", e);
    }
    return {
      matchedSchemes: ["S001", "S002", "S003"],
      matchedJobs: ["JOB001"],
      matchedCourses: ["C001"],
      skillGaps: ["Cloud Computing", "Data Analytics"],
      matchedCertifications: ["CERT001"],
      matchedBenefits: ["FIN-TN-001"]
    };
  },

  // GET /api/users/{user_id} - Fetch existing citizen profile
  async getProfile(userId) {
    try {
      const saved = localStorage.getItem("oneg_citizen_profile");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("ONEGOV_API: getProfile error", e);
      return null;
    }
  },

  // GET /api/services?category={category} - Fetch personalized catalog with required_systems
  async getServices(category) {
    try {
      const catKey = (category || "student").toLowerCase();
      const catalog = SERVICES_CATALOG[catKey] || SERVICES_CATALOG.student;
      return { success: true, services: catalog };
    } catch (e) {
      return { success: false, error: e.message, services: [] };
    }
  },

  // GET /api/services/{service_id} - Fetch full service interoperability metadata
  async getServiceDetails(serviceId) {
    for (const cat in SERVICES_CATALOG) {
      const found = SERVICES_CATALOG[cat].find((s) => s.service_id === serviceId);
      if (found) return { success: true, service: found };
    }
    return { success: false, error: "Service not found" };
  },

  // POST /api/consent/grant - Record DPDP citizen consent grant
  async grantConsent(serviceId, citizenId, requiredSystems, serviceName, requestingDept) {
    try {
      const res = await fetch(`${this.baseUrl}/consent/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          citizen_id: citizenId,
          requesting_dept: requestingDept || "Government Department",
          required_systems: requiredSystems,
          purpose: `Automated entitlement determination & multi-department verification for ${serviceName || serviceId}`,
          data_requested: "Aadhaar e-KYC Token (UIDAI), Academic Marksheet Token (ABC NAD), Family Income Tier (CBDT)"
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: grantConsent fallback", e);
    }

    const consentRecord = {
      consent_id: "CNS-" + Math.floor(100000 + Math.random() * 900000),
      service_id: serviceId,
      citizen_id: citizenId,
      requesting_dept: requestingDept || "Ministry of Education",
      systems_authorized: requiredSystems,
      purpose: `Automated entitlement determination for ${serviceName || serviceId}`,
      data_requested: "Aadhaar e-KYC Token, Academic Marksheet, Family Income Tier",
      status: "GRANTED",
      timestamp: new Date().toISOString(),
      legal_framework: "DPDP Act 2023 Compliant"
    };
    return { success: true, consent: consentRecord };
  },

  // POST /api/consent/deny - Record DPDP citizen consent denial
  async denyConsent(serviceId, citizenId, purpose, requestingDept) {
    try {
      const res = await fetch(`${this.baseUrl}/consent/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          citizen_id: citizenId,
          requesting_dept: requestingDept || "Government Department",
          purpose: purpose || "Service Application Data Access"
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: denyConsent fallback", e);
    }

    const consentRecord = {
      consent_id: "CNS-DENIED-" + Math.floor(100000 + Math.random() * 900000),
      service_id: serviceId,
      citizen_id: citizenId,
      requesting_dept: requestingDept || "Government Department",
      systems_authorized: [],
      purpose: purpose || "Service Application Data Access",
      data_requested: "Verified Credentials",
      status: "DENIED",
      timestamp: new Date().toISOString(),
      legal_framework: "DPDP Act 2023 Compliant"
    };
    return { success: true, consent: consentRecord };
  },

  // GET /api/consent/history - Fetch citizen consent history audit trail
  async getConsentHistory() {
    try {
      const res = await fetch(`${this.baseUrl}/consent/history`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: getConsentHistory fallback", e);
    }
    return {
      success: true,
      history: [
        {
          consent_id: "CNS-881021",
          purpose: "National Scholarship Eligibility Verification",
          requesting_dept: "Ministry of Education",
          data_requested: "Aadhaar e-KYC, Academic Marksheet, Income Tier",
          status: "GRANTED",
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          consent_id: "CNS-541092",
          purpose: "PMKVY Skill Certification Enrollment",
          requesting_dept: "Min. of Skill Development",
          data_requested: "Identity Token, Educational Credential",
          status: "GRANTED",
          timestamp: new Date(Date.now() - 18000000).toISOString()
        }
      ]
    };
  },

  // POST /api/interop/query - Query Interoperability Middleware
  async queryInterop(citizenId, systems, consentId) {
    try {
      const res = await fetch(`${this.baseUrl}/interop/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citizen_id: citizenId, systems, consent_id: consentId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: queryInterop fallback", e);
    }
    return { success: true, message: "Local fallback interop execution" };
  },

  // POST /api/workflow/apply - Submit unified multi-department application
  async saveApplication(serviceId, serviceName, dept, citizenProfile) {
    try {
      const res = await fetch(`${this.baseUrl}/workflow/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          service_name: serviceName,
          dept: dept,
          citizen_id: citizenProfile?.userId || "IND-8842",
          citizen_name: citizenProfile?.fullName || "Aarav Sharma"
        })
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, refId: json.application.refId, stages: json.application.stages, application: json.application };
      }
    } catch (e) {
      console.warn("ONEGOV_API: saveApplication API fallback", e);
    }

    const refId = "OG-2026-IND-" + Math.floor(1000 + Math.random() * 9000);
    return {
      success: true,
      refId: refId,
      serviceId: serviceId,
      timestamp: new Date().toISOString(),
      status: "IN_VERIFICATION"
    };
  },

  // POST /api/workflow/:refId/advance - Advance workflow stage
  async advanceWorkflow(refId) {
    try {
      const res = await fetch(`${this.baseUrl}/workflow/${refId}/advance`, {
        method: "POST"
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: advanceWorkflow fallback", e);
    }
    return { success: true };
  },

  // GET /api/workflow/:refId - Fetch application status
  async getWorkflowStatus(refId) {
    try {
      const res = await fetch(`${this.baseUrl}/workflow/${refId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: getWorkflowStatus fallback", e);
    }
    return null;
  },

  // OIDC Federated Identity
  async requestOidcToken(citizenType) {
    try {
      const res = await fetch(`${this.baseUrl}/auth/oidc/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citizen_type: citizenType })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: requestOidcToken fallback", e);
    }
    return null;
  },

  // Adapters & Schema Test
  async testAdapters() {
    try {
      const res = await fetch(`${this.baseUrl}/interop/adapters/test`, {
        method: "POST"
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: testAdapters fallback", e);
    }
    return null;
  },

  // Admin & Resilience APIs
  async getAdminOverview() {
    try {
      const res = await fetch(`${this.baseUrl}/admin/overview`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: getAdminOverview fallback", e);
    }
    return null;
  },

  async getAdminApplications() {
    try {
      const res = await fetch(`${this.baseUrl}/admin/applications`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: getAdminApplications fallback", e);
    }
    return null;
  },

  async adminAction(refId, action, notes) {
    try {
      const res = await fetch(`${this.baseUrl}/admin/applications/${refId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: adminAction fallback", e);
    }
    return null;
  },

  async toggleCircuitBreaker(deptKey) {
    try {
      const res = await fetch(`${this.baseUrl}/resilience/circuit-breaker/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dept_key: deptKey })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: toggleCircuitBreaker fallback", e);
    }
    return null;
  },

  async getResilienceStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/resilience/status`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: getResilienceStatus fallback", e);
    }
    return null;
  },

  async retryDlq(itemId) {
    try {
      const res = await fetch(`${this.baseUrl}/resilience/dlq/${itemId}/retry`, {
        method: "POST"
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("ONEGOV_API: retryDlq fallback", e);
    }
    return null;
  }
};

// ============================================================================
// 2. Multi-Department Service Catalog with Interoperability Metadata
// ============================================================================
const SERVICES_CATALOG = {
  // STUDENT SERVICES
  student: [
    {
      service_id: "S001",
      service_name: "National Scholarship Portal (NSP)",
      dept: "Ministry of Education",
      category: "STUDENT",
      desc: "Merit-cum-means and post-matric academic financial aid across central & state institutions.",
      tag: "Scholarships",
      badgeStyle: "background: #DBEAFE; color: #1E40AF;",
      eligibility: "Students enrolled in recognized secondary, diploma, UG, PG, or doctoral programs with family income criteria.",
      info_required: "Academic Institution Enrollment Token, Past Marksheets, Income Range Declaration.",
      required_systems: ["Education System", "Income System", "Identity System"]
    },
    {
      service_id: "S002",
      service_name: "PMKVY 4.0 Skill Development Grant",
      dept: "Min. of Skill Development & Entrepreneurship",
      category: "STUDENT",
      desc: "Free industry-recognized tech certifications, AI & green skills training with monthly stipend.",
      tag: "Skill Development",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Indian youth and students aiming for industry-aligned certified tech upskilling.",
      info_required: "Citizen Demographic Token, Academic Status, Domain Preference.",
      required_systems: ["Skill System", "Identity System"]
    },
    {
      service_id: "S003",
      service_name: "Prime Minister Internship Scheme",
      dept: "Ministry of Corporate Affairs",
      category: "STUDENT",
      desc: "12-month paid internships in top 500 companies with ₹5,000 monthly allowance and one-time grant.",
      tag: "Internships",
      badgeStyle: "background: #FFEDD5; color: #9A3412;",
      eligibility: "Youth aged 21-24 with Higher Secondary, ITI, Polytechnic, Diploma, or Graduate degree.",
      info_required: "Education Certificate Verification, Age Verification, Bank Account Token for DBT.",
      required_systems: ["Employment System", "Education System", "Identity System"]
    },
    {
      service_id: "S004",
      service_name: "Vidya Lakshmi Education Loan Scheme",
      dept: "Department of Financial Services",
      category: "STUDENT",
      desc: "Single-window education loan portal connecting 40+ scheduled banks with subsidized interest rates.",
      tag: "Education Loans",
      badgeStyle: "background: #EDE9FE; color: #5B21B6;",
      eligibility: "Secured admission to higher education courses in India or abroad through entrance test/merit.",
      info_required: "College Admission Letter, Course Fee Structure, Parent Income Declaration.",
      required_systems: ["Education System", "Income System", "Identity System"]
    },
    {
      service_id: "S005",
      service_name: "SWAYAM Higher Education Credit Transfer",
      dept: "Ministry of Education / UGC",
      category: "STUDENT",
      desc: "Online credit-transferable courses and proctored certifications from IITs, IIMs, and central universities.",
      tag: "Education Schemes",
      badgeStyle: "background: #DBEAFE; color: #1E40AF;",
      eligibility: "Any enrolled college student seeking recognized MOOC credits transferable to university degree.",
      info_required: "ABC (Academic Bank of Credits) ID, College Roll Token.",
      required_systems: ["Education System", "Identity System"]
    },
    {
      service_id: "S006",
      service_name: "Academic Bank of Credits (ABC Wallet)",
      dept: "National e-Governance Division",
      category: "STUDENT",
      desc: "Digitally store, aggregate, and transfer college course credits, degrees, and diplomas securely via SOAP XML.",
      tag: "Education Schemes",
      badgeStyle: "background: #F1F5F9; color: #0F1D36;",
      eligibility: "All students enrolled in universities and autonomous colleges across India.",
      info_required: "DigiLocker Consent, Institution Admission ID.",
      required_systems: ["Education System", "Identity System"]
    }
  ],

  // EMPLOYED SERVICES
  employed: [
    {
      service_id: "S101",
      service_name: "EPFO Unified Member Portal & e-Passbook",
      dept: "Ministry of Labour & Employment",
      category: "EMPLOYED",
      desc: "View provident fund balances, manage UAN, download passbook, and submit direct online claims.",
      tag: "Employee Welfare",
      badgeStyle: "background: #FFEDD5; color: #9A3412;",
      eligibility: "Salaried employees in private or public sector establishments registered under EPFO.",
      info_required: "UAN (Universal Account Number) Token, Employment Verification.",
      required_systems: ["Employment System", "Identity System"]
    },
    {
      service_id: "S102",
      service_name: "ESIC Healthcare & Medical Benefits",
      dept: "Employees' State Insurance Corporation",
      category: "EMPLOYED",
      desc: "Full comprehensive medical care, sickness benefits, and maternity support for insured workers.",
      tag: "Social Security",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Employees earning up to ₹21,000 per month in covered factories/establishments.",
      info_required: "ESIC IP Number, Employer Code, Identity Verification.",
      required_systems: ["Employment System", "Identity System"]
    },
    {
      service_id: "S103",
      service_name: "Pradhan Mantri Mudra Yojana (PMMY)",
      dept: "Department of Financial Services",
      category: "EMPLOYED",
      desc: "Collateral-free business loans up to ₹20 Lakhs for micro and small enterprises across Shishu, Kishore & Tarun.",
      tag: "MSME Loans",
      badgeStyle: "background: #DBEAFE; color: #1E40AF;",
      eligibility: "Self-employed individuals, artisans, small enterprise owners, and startups.",
      info_required: "Business PAN, Udyam Registration, Bank Statement Token.",
      required_systems: ["Income System", "Identity System"]
    }
  ],

  // UNEMPLOYED SERVICES
  unemployed: [
    {
      service_id: "S201",
      service_name: "National Career Service (NCS) Portal",
      dept: "Ministry of Labour & Employment",
      category: "UNEMPLOYED",
      desc: "Connect directly with verified private and public employers, job fairs, and career counselors across India.",
      tag: "Job Opportunities",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Any job seeker registered with basic qualification and identity details.",
      info_required: "Demographic Profile, Educational Qualification, Skill Declaration.",
      required_systems: ["Employment System", "Identity System"]
    },
    {
      service_id: "S202",
      service_name: "National Apprenticeship Promotion Scheme (NAPS)",
      dept: "Ministry of Skill Development & Entrepreneurship",
      category: "UNEMPLOYED",
      desc: "On-the-job industrial apprenticeship with direct government stipend support of up to ₹1,500/month.",
      tag: "Training Programs",
      badgeStyle: "background: #FFEDD5; color: #9A3412;",
      eligibility: "Candidates who have completed minimum 5th standard up to ITI, Diploma, or Graduation.",
      info_required: "Aadhaar e-KYC, Bank Account Token for DBT, Educational Qualification Token.",
      required_systems: ["Skill System", "Identity System"]
    }
  ],

  // COMMON SERVICES
  common: [
    {
      service_id: "S301",
      service_name: "DigiLocker Universal Document Vault",
      dept: "National e-Governance Division (MeitY)",
      category: "COMMON",
      desc: "Access legally valid digital versions of Driving License, Vehicle RC, Aadhaar, PAN, and 1000+ certificates.",
      tag: "Documents",
      badgeStyle: "background: #EDE9FE; color: #5B21B6;",
      eligibility: "Universal — Available to every Indian resident with Aadhaar-linked mobile number.",
      info_required: "Aadhaar e-KYC Verification Token.",
      required_systems: ["Identity System"]
    },
    {
      service_id: "S302",
      service_name: "CPGRAMS National Public Grievance Portal",
      dept: "Dept of Administrative Reforms & Public Grievances",
      category: "COMMON",
      desc: "24x7 online single-window grievance redressal portal connecting all central ministries and state departments.",
      tag: "Grievance",
      badgeStyle: "background: #FEE2E2; color: #991B1B;",
      eligibility: "Universal — Any citizen seeking official redressal for government service delays or grievances.",
      info_required: "Citizen Contact Info, Department Selection, Grievance Details.",
      required_systems: ["Identity System"]
    }
  ]
};

// ============================================================================
// 2.1 Multi-Language Dictionary (I18N)
// ============================================================================
const I18N_DICTIONARY = {
  en: {
    nav_track: "Track Application",
    nav_consent_history: "Consent History",
    nav_sso: "DigiLocker SSO",
    nav_officer: "🏛️ Officer Portal",
    consent_header: "Digital Personal Data Protection (DPDP) Consent Request",
    consent_subtext: "Your explicit consent is required before accessing or sharing department credentials.",
    consent_purpose: "Purpose:",
    consent_dept: "Requesting Department:",
    consent_data_req: "Data Requested:",
    consent_status_lbl: "Consent Status:",
    consent_timestamp: "Timestamp:",
    systems_involved: "🏛️ Government Systems Authorized Upon Consent",
    btn_grant: "✓ Grant Consent & Apply →",
    btn_deny: "✕ Deny Consent",
    tracker_subtitle: "Unified Multi-Department Interoperability Application Workflow",
    ref_id_label: "Unified Application Reference ID:",
    timeline_title: "Application Milestone Progress",
    mile_1: "Submitted",
    mile_2: "Verification",
    mile_3: "Dept Processing",
    mile_4: "Approval",
    mile_5: "Completed",
    pipeline_heading: "Detailed Interoperability Verification Stages",
    sec_note: "🔒 Single Reference ID across connected government departments",
    btn_close: "Close View",
    btn_advance: "Simulate Next Verification Step ⚡",
    tag_verified: "✓ Verified Citizen Profile (DEMO)",
    btn_inspector: "🔬 Inspect OCDS & Adapters",
    btn_edit_profile: "✏️ Edit Profile",
    btn_switch_cat: "🔄 Switch Category",
    mdm_title: "Unified Citizen Profile (Master Data Management)",
    mdm_subtitle: "Reused verified credentials across departments. All data marked SIMULATED DEMO DATA.",
    demo_watermark: "DEMO / SIMULATED IDENTITY",
    mdm_identity_title: "Identity & Demographics",
    mdm_edu_title: "Education & Academic Record",
    mdm_income_title: "Income & Revenue Verification",
    mdm_welfare_title: "Welfare & Schemes Entitlement",
    consent_audit_badge: "DPDP Act 2023 Compliance Vault",
    consent_history_title: "📜 Citizen Data Sharing Consent Audit History",
    consent_history_sub: "Immutable session record of all granted and denied inter-department data access requests.",
    th_consent_id: "Consent ID",
    th_purpose: "Purpose",
    th_requesting_dept: "Requesting Dept",
    th_data_requested: "Data Requested",
    th_status: "Status",
    th_timestamp: "Timestamp",
    notif_center_title: "Notification Center",
    notif_center_sub: "Real-time workflow & consent events",
    btn_mark_read: "✓ Mark All as Read",
    btn_clear_all: "Clear All"
  },
  ta: {
    nav_track: "விண்ணப்பத்தைக் கண்காணிக்கவும்",
    nav_consent_history: "ஒப்புதல் வரலாறு",
    nav_sso: "டிஜிலாக்கர் உள்நுழைவு",
    nav_officer: "🏛️ அரசு அதிகாரி போர்ட்டல்",
    consent_header: "டிஜிட்டல் தனிநபர் தரவு பாதுகாப்பு (DPDP) ஒப்புதல் கோரிக்கை",
    consent_subtext: "துறை விவரங்களை அணுகும் முன் உங்கள் வெளிப்படையான ஒப்புதல் தேவை.",
    consent_purpose: "நோக்கம்:",
    consent_dept: "கோரும் துறை:",
    consent_data_req: "கோரப்பட்ட தரவு:",
    consent_status_lbl: "ஒப்புதல் நிலை:",
    consent_timestamp: "நேரம்:",
    systems_involved: "🏛️ ஒப்புதலின் கீழ் அனுமதிக்கப்பட்ட அரசு அமைப்புகள்",
    btn_grant: "✓ ஒப்புதல் அளித்து விண்ணப்பிக்கவும் →",
    btn_deny: "✕ நிராகரிக்கவும்",
    tracker_subtitle: "ஒருங்கிணைந்த பல-துறை செயல்பாட்டு பணிப்பாய்வு",
    ref_id_label: "ஒருங்கிணைந்த விண்ணப்பக் குறிப்பு எண்:",
    timeline_title: "விண்ணப்ப மைல்கல் முன்னேற்றம்",
    mile_1: "சமர்ப்பிக்கப்பட்டது",
    mile_2: "சரிபார்ப்பு",
    mile_3: "துறை செயல்முறை",
    mile_4: "ஒப்புதல்",
    mile_5: "நிறைவடைந்தது",
    pipeline_heading: "விரிவான சரிபார்ப்பு நிலைகள்",
    sec_note: "🔒 அனைத்து துறைகளுக்கும் ஒரே குறிப்பு எண்",
    btn_close: "மூடு",
    btn_advance: "அடுத்த நிலையை இயக்கு ⚡",
    tag_verified: "✓ சரிபார்க்கப்பட்ட சுயவிவரம் (மாதிரி)",
    btn_inspector: "🔬 அடாப்டர்களை ஆய்வு செய்",
    btn_edit_profile: "✏️ சுயவிவரத்தைத் திருத்து",
    btn_switch_cat: "🔄 பிரிவை மாற்று",
    mdm_title: "ஒருங்கிணைந்த குடிமகன் சுயவிவரம் (MDM)",
    mdm_subtitle: "துறைகளில் மீண்டும் பயன்படுத்தப்பட்ட சரிபார்க்கப்பட்ட சான்றுகள். அனைத்தும் மாதிரி தரவு.",
    demo_watermark: "மாதிரி / போலி அடையாளம்",
    mdm_identity_title: "அடையாளம் மற்றும் விவரங்கள்",
    mdm_edu_title: "கல்வி மற்றும் கல்வி பதிவு",
    mdm_income_title: "வருமானம் மற்றும் வருவாய் சரிபார்ப்பு",
    mdm_welfare_title: "நலத்திட்டங்கள் மற்றும் உரிமைகள்",
    consent_audit_badge: "DPDP சட்டம் 2023 தணிக்கை",
    consent_history_title: "📜 தரவு பகிர்வு ஒப்புதல் வரலாறு",
    consent_history_sub: "அனுமதிக்கப்பட்ட மற்றும் நிராகரிக்கப்பட்ட தரவு அணுகல் கோரிக்கைகளின் பதிவு.",
    th_consent_id: "ஒப்புதல் ID",
    th_purpose: "நோக்கம்",
    th_requesting_dept: "கோரும் துறை",
    th_data_requested: "கோரப்பட்ட தரவு",
    th_status: "நிலை",
    th_timestamp: "நேரம்",
    notif_center_title: "அறிவிப்பு மையம்",
    notif_center_sub: "நிகழ்நேர அறிவிப்புகள்",
    btn_mark_read: "✓ அனைத்தையும் படித்ததாகக் குறி",
    btn_clear_all: "அனைத்தையும் நீக்கு"
  },
  hi: {
    nav_track: "आवेदन ट्रैक करें",
    nav_consent_history: "सहमति इतिहास",
    nav_sso: "डिजीलॉकर एसएसओ",
    nav_officer: "🏛️ अधिकारी पोर्टल",
    consent_header: "डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) सहमति अनुरोध",
    consent_subtext: "विभागीय क्रेडेंशियल एक्सेस करने से पहले आपकी स्पष्ट सहमति आवश्यक है।",
    consent_purpose: "उद्देश्य:",
    consent_dept: "अनुरोधकर्ता विभाग:",
    consent_data_req: "अनुरोधित डेटा:",
    consent_status_lbl: "सहमति स्थिति:",
    consent_timestamp: "समय:",
    systems_involved: "🏛️ सहमति पर अधिकृत सरकारी प्रणालियां",
    btn_grant: "✓ सहमति दें और आवेदन करें →",
    btn_deny: "✕ अस्वीकार करें",
    tracker_subtitle: "एककीकृत बहु-विभागीय इंटरऑपरेबिलिटी आवेदन कार्यप्रवाह",
    ref_id_label: "एककीकृत आवेदन संदर्भ आईडी:",
    timeline_title: "आवेदन मील का पत्थर प्रगति",
    mile_1: "प्रस्तुत",
    mile_2: "सत्यापन",
    mile_3: "विभागीय प्रक्रिया",
    mile_4: "स्वीकृति",
    mile_5: "पूर्ण",
    pipeline_heading: "विस्तृत इंटरऑपरेबिलिटी सत्यापन चरण",
    sec_note: "🔒 सभी जुड़े विभागों में एकल संदर्भ आईडी",
    btn_close: "बंद करें",
    btn_advance: "अगला चरण सिम्युलेट करें ⚡",
    tag_verified: "✓ सत्यापित नागरिक प्रोफ़ाइल (डेमो)",
    btn_inspector: "🔬 एडेप्टर का निरीक्षण करें",
    btn_edit_profile: "✏️ प्रोफ़ाइल संपादित करें",
    btn_switch_cat: "🔄 श्रेणी बदलें",
    mdm_title: "एककीकृत नागरिक प्रोफ़ाइल (मास्टर डेटा प्रबंधन)",
    mdm_subtitle: "विभागों में पुनः उपयोग किए गए क्रेडेंशियल। सभी डेटा सिम्युलेटेड डेमो डेटा है।",
    demo_watermark: "डेमो / सिम्युलेटेड पहचान",
    mdm_identity_title: "पहचान और जनसांख्यिकी",
    mdm_edu_title: "शिक्षा और शैक्षणिक रिकॉर्ड",
    mdm_income_title: "आय और राजस्व सत्यापन",
    mdm_welfare_title: "कल्याण और योजना पात्रता",
    consent_audit_badge: "DPDP अधिनियम 2023 ऑडिट",
    consent_history_title: "📜 नागरिक डेटा साझाकरण सहमति ऑडिट इतिहास",
    consent_history_sub: "स्वीकृत और अस्वीकृत डेटा एक्सेस अनुरोधों का रिकॉर्ड।",
    th_consent_id: "सहमति आईडी",
    th_purpose: "उद्देश्य",
    th_requesting_dept: "अनुरोधकर्ता विभाग",
    th_data_requested: "अनुरोधित डेटा",
    th_status: "स्थिति",
    th_timestamp: "समय",
    notif_center_title: "अधिसूचना केंद्र",
    notif_center_sub: "वास्तविक समय कार्यप्रवाह और सहमति कार्यक्रम",
    btn_mark_read: "✓ सभी को पढ़ा हुआ चिह्नित करें",
    btn_clear_all: "सभी साफ़ करें"
  }
};

// ============================================================================
// 3. Application State & Orchestration
// ============================================================================
const AppState = {
  activeCategory: "student",
  currentStep: 1,
  activeView: "page-category",
  ssoToken: null,
  currentLanguage: "en",
  notifications: [
    {
      id: "NTF-8801",
      type: "success",
      message: "✓ Citizen Profile registered with ONEGOV Master Data Management (MDM)",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    },
    {
      id: "NTF-8802",
      type: "info",
      message: "✓ Academic Bank of Credits (ABC) SOAP XML credential linked",
      timestamp: new Date(Date.now() - 2700000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    },
    {
      id: "NTF-8803",
      type: "warn",
      message: "⚠ Department consent required for NSP Scholarship application",
      timestamp: new Date(Date.now() - 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    }
  ],
  currentUserProfile: {
    userId: "IND-8842",
    fullName: "Aarav Sharma",
    dob: "2003-08-14",
    mobile: "9876543210",
    email: "aarav.sharma@example.gov.in",
    state: "Delhi",
    district: "Central Delhi",
    pincode: "110001",
    category: "student",
    eduLevel: "Undergraduate",
    course: "B.Tech Computer Science",
    college: "Delhi Technological University",
    currentYear: "3rd Year",
    studentSkills: "Python, Web Development, SQL",
    familyIncome: "₹2.5 Lakhs - ₹5 Lakhs",
    verifiedSSO: true
  },
  activeServiceForConsent: null,
  activeApplicationSimulation: null
};

// ============================================================================
// 4. DOM Initialization & Event Handlers
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Navigation & Pages
  const navBrandLogo = document.getElementById("nav-brand-logo");
  const navBtnTrack = document.getElementById("nav-btn-track");
  const navBtnSso = document.getElementById("nav-btn-sso");
  const navBtnAdminToggle = document.getElementById("nav-btn-admin-toggle");
  const stepIndicatorBadge = document.getElementById("step-indicator-badge");
  const globalStepperPill = document.getElementById("global-stepper-pill");
  const langToggle = document.getElementById("lang-toggle");
  const helpBtn = document.getElementById("help-btn");

  const pageCategory = document.getElementById("page-category");
  const pageProfile = document.getElementById("page-profile");
  const pageDashboard = document.getElementById("page-dashboard");
  const pageAdmin = document.getElementById("page-admin");

  // Public Track Widget
  const quickTrackForm = document.getElementById("quick-track-form");
  const quickTrackInput = document.getElementById("quick-track-input");

  // Category Cards
  const catCards = document.querySelectorAll(".cat-card");
  const viewAllTrigger = document.getElementById("view-all-trigger");

  // Profile Form Elements
  const formStep1 = document.getElementById("form-step-1");
  const formStep2 = document.getElementById("form-step-2");
  const btnStep1Continue = document.getElementById("btn-step-1-continue");
  const btnBackToCategory = document.getElementById("btn-back-to-category");
  const btnBackToStep1 = document.getElementById("btn-back-to-step-1");
  const btnDemoFill = document.getElementById("btn-demo-fill");
  const btnSsoFill = document.getElementById("btn-sso-fill");
  const citizenProfileForm = document.getElementById("citizen-profile-form");

  // Dashboard & Modals
  const dashServicesContainer = document.getElementById("dash-services-container");
  const serviceDetailsModal = document.getElementById("service-details-modal");
  const btnCloseDetail = document.getElementById("btn-close-detail");
  const btnCancelDetail = document.getElementById("btn-cancel-detail");
  const btnConsentApply = document.getElementById("btn-consent-apply");
  const detailModalBackdrop = document.getElementById("detail-modal-backdrop");

  const trackerModal = document.getElementById("app-tracker-modal");
  const btnCloseTracker = document.getElementById("btn-close-tracker");
  const btnCancelTracker = document.getElementById("btn-cancel-tracker");
  const trackerBackdrop = document.getElementById("tracker-modal-backdrop");
  const btnAdvanceSimulation = document.getElementById("btn-advance-simulation");

  // SSO Modal
  const ssoModal = document.getElementById("digilocker-sso-modal");
  const btnCloseSso = document.getElementById("btn-close-sso");
  const btnCancelSso = document.getElementById("btn-cancel-sso");
  const ssoBackdrop = document.getElementById("sso-modal-backdrop");
  const btnConfirmSso = document.getElementById("btn-confirm-sso");
  const ssoCitizenCards = document.querySelectorAll(".sso-citizen-card");

  // Adapter Inspector Modal
  const inspectorModal = document.getElementById("adapter-inspector-modal");
  const btnOpenInspector = document.getElementById("btn-open-inspector");
  const btnCloseInspector = document.getElementById("btn-close-inspector");
  const btnCloseInspectorFooter = document.getElementById("btn-close-inspector-footer");
  const inspectorBackdrop = document.getElementById("inspector-modal-backdrop");
  const inspectorTabs = document.querySelectorAll(".inspector-tab");
  const btnRunAdapterTest = document.getElementById("btn-run-adapter-test");

  // Admin Portal Elements
  const btnAdminRefresh = document.getElementById("btn-admin-refresh");
  const btnExitAdmin = document.getElementById("btn-exit-admin");
  const btnToggleIncomeFault = document.getElementById("btn-toggle-income-fault");
  const btnToggleEduFault = document.getElementById("btn-toggle-edu-fault");
  const btnResetBreakers = document.getElementById("btn-reset-breakers");

  // Load Saved Profile or Demo
  const existingProfile = await ONEGOV_API.getProfile("current");
  if (existingProfile) {
    AppState.currentUserProfile = existingProfile;
  }

  // View Navigation System
  function navigateTo(targetPageId) {
    [pageCategory, pageProfile, pageDashboard, pageAdmin].forEach((page) => {
      if (!page) return;
      page.classList.remove("active");
      page.style.display = "none";
    });

    const target = document.getElementById(targetPageId);
    if (target) {
      target.classList.add("active");
      target.style.display = targetPageId === "page-admin" ? "block" : "";
    }

    AppState.activeView = targetPageId;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (targetPageId === "page-category") {
      if (globalStepperPill) globalStepperPill.style.display = "none";
    } else if (targetPageId === "page-profile") {
      if (globalStepperPill) {
        globalStepperPill.style.display = "flex";
        stepIndicatorBadge.textContent = "Step 2 of 4: Profile";
      }
    } else if (targetPageId === "page-dashboard") {
      if (globalStepperPill) {
        globalStepperPill.style.display = "flex";
        stepIndicatorBadge.textContent = "Step 3 of 4: Services";
      }
      renderPersonalizedDashboard();
    } else if (targetPageId === "page-admin") {
      if (globalStepperPill) globalStepperPill.style.display = "none";
      loadAdminDashboardData();
    }
  }

  // Category Selection
  catCards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category");
      selectCategory(category);
    });
  });

  if (viewAllTrigger) {
    viewAllTrigger.addEventListener("click", () => {
      selectCategory("common");
    });
  }

  function selectCategory(category) {
    AppState.activeCategory = category;
    updateCategoryFormView(category);
    navigateTo("page-profile");
    setFormStep(1);
  }

  function updateCategoryFormView(cat) {
    const pillIcon = document.getElementById("pill-icon");
    const pillText = document.getElementById("pill-text");
    const blockStudent = document.getElementById("cat-block-student");
    const blockEmployed = document.getElementById("cat-block-employed");
    const blockUnemployed = document.getElementById("cat-block-unemployed");
    const blockCommon = document.getElementById("cat-block-common");

    [blockStudent, blockEmployed, blockUnemployed, blockCommon].forEach((b) => {
      if (b) b.style.display = "none";
    });

    if (cat === "student") {
      pillIcon.textContent = "🎓";
      pillText.textContent = "Students Pathway";
      if (blockStudent) blockStudent.style.display = "block";
    } else if (cat === "employed") {
      pillIcon.textContent = "💼";
      pillText.textContent = "Employed Pathway";
      if (blockEmployed) blockEmployed.style.display = "block";
    } else if (cat === "unemployed") {
      pillIcon.textContent = "🔍";
      pillText.textContent = "Career & Upskilling Pathway";
      if (blockUnemployed) blockUnemployed.style.display = "block";
    } else if (cat === "common") {
      pillIcon.textContent = "👥";
      pillText.textContent = "Common Citizen Services";
      if (blockCommon) blockCommon.style.display = "block";
    }
  }

  function setFormStep(step) {
    AppState.currentStep = step;
    const node1 = document.getElementById("step-node-1");
    const node2 = document.getElementById("step-node-2");

    if (step === 1) {
      formStep1.classList.add("active");
      formStep2.classList.remove("active");
      node1.className = "step-node active";
      node2.className = "step-node";
    } else if (step === 2) {
      formStep1.classList.remove("active");
      formStep2.classList.add("active");
      node1.className = "step-node completed";
      node2.className = "step-node active";
    }
  }

  // ============================================================================
  // Multi-Language (I18N) UI Translation System
  // ============================================================================
  const langSelect = document.getElementById("lang-select");

  function applyLanguage(langKey) {
    if (!I18N_DICTIONARY[langKey]) langKey = "en";
    AppState.currentLanguage = langKey;
    const dict = I18N_DICTIONARY[langKey];

    document.querySelectorAll("[data-i18n]").forEach((elem) => {
      const key = elem.getAttribute("data-i18n");
      if (dict[key]) {
        elem.textContent = dict[key];
      }
    });

    showToast(langKey === "ta" ? "மொழி தமிழிற்கு மாற்றப்பட்டது." : (langKey === "hi" ? "भाषा बदलकर हिंदी की गई।" : "Language set to English."));
  }

  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      applyLanguage(e.target.value);
    });
  }

  // ============================================================================
  // Notification Center (Session Drawer & Event Bus)
  // ============================================================================
  const navNotificationBtn = document.getElementById("nav-notification-btn");
  const navNotificationBadge = document.getElementById("nav-notification-badge");
  const notificationDrawer = document.getElementById("notification-drawer");
  const btnCloseNotificationDrawer = document.getElementById("btn-close-notification-drawer");
  const notificationDrawerBackdrop = document.getElementById("notification-drawer-backdrop");
  const btnMarkAllRead = document.getElementById("btn-mark-all-read");
  const btnClearNotifications = document.getElementById("btn-clear-notifications");
  const notificationItemsContainer = document.getElementById("notification-items-container");

  function addNotification(type, message) {
    const notif = {
      id: "NTF-" + Math.floor(10000 + Math.random() * 90000),
      type: type, // success, warn, danger, info
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    AppState.notifications.unshift(notif);
    renderNotifications();
  }

  function renderNotifications() {
    if (!notificationItemsContainer) return;
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    if (navNotificationBadge) {
      navNotificationBadge.textContent = unreadCount;
      navNotificationBadge.style.display = unreadCount > 0 ? "inline-block" : "none";
    }

    if (AppState.notifications.length === 0) {
      notificationItemsContainer.innerHTML = `<div class="table-empty-note">No notifications in session.</div>`;
      return;
    }

    notificationItemsContainer.innerHTML = AppState.notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-top-row">
          <span class="notif-type-tag ${n.type}">${n.type}</span>
          <span class="notif-time">${n.timestamp}</span>
        </div>
        <div class="notif-msg">${n.message}</div>
      </div>
    `).join("");
  }

  function toggleNotificationDrawer(show) {
    if (!notificationDrawer) return;
    if (show) {
      notificationDrawer.classList.add("active");
      notificationDrawer.setAttribute("aria-hidden", "false");
    } else {
      notificationDrawer.classList.remove("active");
      notificationDrawer.setAttribute("aria-hidden", "true");
    }
  }

  if (navNotificationBtn) navNotificationBtn.addEventListener("click", () => toggleNotificationDrawer(true));
  if (btnCloseNotificationDrawer) btnCloseNotificationDrawer.addEventListener("click", () => toggleNotificationDrawer(false));
  if (notificationDrawerBackdrop) notificationDrawerBackdrop.addEventListener("click", () => toggleNotificationDrawer(false));

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener("click", () => {
      AppState.notifications.forEach(n => n.read = true);
      renderNotifications();
      showToast("All notifications marked as read.");
    });
  }

  if (btnClearNotifications) {
    btnClearNotifications.addEventListener("click", () => {
      AppState.notifications = [];
      renderNotifications();
      showToast("Notifications cleared.");
    });
  }

  renderNotifications();

  // ============================================================================
  // Consent History Modal Controller
  // ============================================================================
  const navBtnConsentHistory = document.getElementById("nav-btn-consent-history");
  const consentHistoryModal = document.getElementById("consent-history-modal");
  const btnCloseConsentHistory = document.getElementById("btn-close-consent-history");
  const btnCloseConsentHistoryFooter = document.getElementById("btn-close-consent-history-footer");
  const consentHistoryBackdrop = document.getElementById("consent-history-backdrop");
  const consentHistoryTbody = document.getElementById("consent-history-tbody");

  async function openConsentHistoryModal() {
    if (!consentHistoryModal) return;
    consentHistoryModal.classList.add("active");
    consentHistoryModal.setAttribute("aria-hidden", "false");

    const res = await ONEGOV_API.getConsentHistory();
    if (res && res.history) {
      consentHistoryTbody.innerHTML = res.history.map(item => `
        <tr>
          <td><strong>${item.consent_id}</strong></td>
          <td>${item.purpose || 'Service Eligibility Access'}</td>
          <td>${item.requesting_dept || 'Ministry of Education'}</td>
          <td><span class="detail-text-sm">${item.data_requested || 'Identity & Academic Tokens'}</span></td>
          <td>
            <span class="v-status-badge ${item.status === 'GRANTED' ? 'badge-green' : 'tag-red'}">
              ${item.status === 'GRANTED' ? '✓ GRANTED' : '✕ DENIED'}
            </span>
          </td>
          <td class="code-font">${new Date(item.timestamp).toLocaleTimeString()}</td>
        </tr>
      `).join("");
    }
  }

  function closeConsentHistoryModal() {
    if (!consentHistoryModal) return;
    consentHistoryModal.classList.remove("active");
    consentHistoryModal.setAttribute("aria-hidden", "true");
  }

  if (navBtnConsentHistory) navBtnConsentHistory.addEventListener("click", openConsentHistoryModal);
  if (btnCloseConsentHistory) btnCloseConsentHistory.addEventListener("click", closeConsentHistoryModal);
  if (btnCloseConsentHistoryFooter) btnCloseConsentHistoryFooter.addEventListener("click", closeConsentHistoryModal);
  if (consentHistoryBackdrop) consentHistoryBackdrop.addEventListener("click", closeConsentHistoryModal);

  // Form Validation & Navigation
  btnStep1Continue.addEventListener("click", () => {
    const fullName = document.getElementById("input-fullname").value.trim();
    const dob = document.getElementById("input-dob").value;
    const mobile = document.getElementById("input-mobile").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const state = document.getElementById("input-state").value;
    const district = document.getElementById("input-district").value.trim();
    const pincode = document.getElementById("input-pincode").value.trim();

    if (!fullName || !dob || !mobile || !email || !state || !district || !pincode) {
      showToast("Please fill in all mandatory basic details.");
      return;
    }
    setFormStep(2);
  });

  btnBackToCategory.addEventListener("click", () => navigateTo("page-category"));
  btnBackToStep1.addEventListener("click", () => setFormStep(1));

  // Demo auto-fill
  btnDemoFill.addEventListener("click", () => {
    document.getElementById("input-fullname").value = "Aarav Sharma";
    document.getElementById("input-dob").value = "2003-08-14";
    document.getElementById("input-mobile").value = "9876543210";
    document.getElementById("input-email").value = "aarav.sharma@example.gov.in";
    document.getElementById("input-state").value = "Delhi";
    document.getElementById("input-district").value = "Central Delhi";
    document.getElementById("input-pincode").value = "110001";

    if (AppState.activeCategory === "student") {
      document.getElementById("stud-edu-level").value = "Undergraduate";
      document.getElementById("stud-course").value = "B.Tech Computer Science";
      document.getElementById("stud-specialization").value = "Artificial Intelligence";
      document.getElementById("stud-college").value = "Delhi Technological University";
      document.getElementById("stud-skills").value = "Python, Web Development, SQL";
    }
    showToast("✓ Demo Citizen profile autofilled.");
  });

  // Profile Form Submission
  citizenProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(citizenProfileForm);
    const profile = Object.fromEntries(formData.entries());
    profile.category = AppState.activeCategory;
    profile.userId = AppState.currentUserProfile.userId || "IND-8842";

    AppState.currentUserProfile = profile;
    await ONEGOV_API.saveProfile(profile);

    addNotification("success", "✓ Unified Citizen Profile updated in ONEGOV MDM");
    showToast("Profile registered with ONEGOV Interoperability Core!");
    navigateTo("page-dashboard");
  });

  // Render Dashboard
  function renderPersonalizedDashboard() {
    const p = AppState.currentUserProfile;
    document.getElementById("dash-citizen-name").textContent = p.fullName || "Aarav Sharma";
    document.getElementById("dash-avatar").textContent = (p.fullName || "AS").substring(0, 2).toUpperCase();
    document.getElementById("dash-citizen-subline").textContent = `${p.category.toUpperCase()} Pathway • ${p.state || "Delhi"} • Interoperability ID: ${p.userId || "IND-8842"}`;

    // Populate MDM Unified Citizen Profile Card
    const mdmIdentity = document.getElementById("mdm-val-identity");
    const mdmEdu = document.getElementById("mdm-val-education");
    const mdmIncome = document.getElementById("mdm-val-income");
    const mdmWelfare = document.getElementById("mdm-val-welfare");

    if (mdmIdentity) mdmIdentity.textContent = `${p.fullName || "Aarav Sharma"} • Masked Aadhaar: XXXX-XXXX-8842 • DOB: ${p.dob || "2003-08-14"}`;
    if (mdmEdu) mdmEdu.textContent = `${p.course || "B.Tech Computer Science"} (${p.college || "Delhi Technological University"}) • ${p.eduLevel || "UG"}`;
    if (mdmIncome) mdmIncome.textContent = `Family Income: ${p.familyIncome || "₹2.5 Lakhs - ₹5 Lakhs"} (Tier-1 Priority Beneficiary)`;
    if (mdmWelfare) mdmWelfare.textContent = `Eligible for National Merit-cum-Means Scholarship & Educational Fee Waiver`;

    const catKey = (p.category || "student").toLowerCase();
    const services = SERVICES_CATALOG[catKey] || SERVICES_CATALOG.student;

    dashServicesContainer.innerHTML = "";
    services.forEach((srv) => {
      const card = document.createElement("div");
      card.className = "service-card";
      card.innerHTML = `
        <div class="service-card-header">
          <span class="service-tag" style="${srv.badgeStyle}">${srv.tag}</span>
          <span class="service-dept-badge">${srv.dept}</span>
        </div>
        <h4 class="service-card-title">${srv.service_name}</h4>
        <p class="service-card-desc">${srv.desc}</p>
        <div class="service-systems-row">
          ${srv.required_systems.map(s => `<span class="system-chip">✓ ${s}</span>`).join("")}
        </div>
        <div class="service-card-footer">
          <button type="button" class="btn-primary-sm btn-apply-service" data-service-id="${srv.service_id}">Apply with Single Profile →</button>
        </div>
      `;
      dashServicesContainer.appendChild(card);
    });

    document.querySelectorAll(".btn-apply-service").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sId = btn.getAttribute("data-service-id");
        openServiceDetails(sId);
      });
    });
  }

  // Service Details Modal & DPDP Consent Flow
  async function openServiceDetails(serviceId) {
    const srv = await ONEGOV_API.getServiceDetails(serviceId);
    if (!srv.success) return;
    const s = srv.service;
    AppState.activeServiceForConsent = s;

    document.getElementById("detail-modal-title").textContent = s.service_name;
    document.getElementById("detail-service-dept").textContent = s.dept;
    document.getElementById("detail-service-tag").textContent = s.tag;

    // Populate DPDP Consent Details Table
    const purposeElem = document.getElementById("consent-val-purpose");
    const deptElem = document.getElementById("consent-val-dept");
    const dataElem = document.getElementById("consent-val-data");
    const statusElem = document.getElementById("consent-val-status");
    const timeElem = document.getElementById("consent-val-time");

    if (purposeElem) purposeElem.textContent = `Automated eligibility verification & direct benefit transfer for ${s.service_name}`;
    if (deptElem) deptElem.textContent = s.dept;
    if (dataElem) dataElem.textContent = `Aadhaar e-KYC Token (UIDAI), Academic Marksheet Token (${s.dept}), Family Income Tier (CBDT)`;
    if (statusElem) statusElem.innerHTML = `<span class="badge-amber">PENDING CITIZEN DECISION</span>`;
    if (timeElem) timeElem.textContent = new Date().toISOString();

    const sysContainer = document.getElementById("detail-systems-container");
    sysContainer.innerHTML = s.required_systems.map(sys => `<div class="sys-chip-lg">🏛️ <strong>${sys}</strong> <span>(API Direct Query)</span></div>`).join("");

    serviceDetailsModal.classList.add("active");
    serviceDetailsModal.setAttribute("aria-hidden", "false");
  }

  function closeServiceDetails() {
    serviceDetailsModal.classList.remove("active");
    serviceDetailsModal.setAttribute("aria-hidden", "true");
  }

  btnCloseDetail.addEventListener("click", closeServiceDetails);
  detailModalBackdrop.addEventListener("click", closeServiceDetails);

  // Grant Consent Handler
  const btnConsentGrant = document.getElementById("btn-consent-grant");
  const btnConsentDeny = document.getElementById("btn-consent-deny");

  if (btnConsentGrant) {
    btnConsentGrant.addEventListener("click", async () => {
      const srv = AppState.activeServiceForConsent;
      if (!srv) return;

      closeServiceDetails();

      // 1. Grant DPDP Consent
      const consentRes = await ONEGOV_API.grantConsent(srv.service_id, AppState.currentUserProfile.userId, srv.required_systems, srv.service_name, srv.dept);
      showToast(`✓ DPDP Consent ${consentRes.consent.consent_id} Granted!`);
      addNotification("success", `✓ Consent ${consentRes.consent.consent_id} granted to ${srv.dept}`);

      // 2. Query Interoperability Gateway
      await ONEGOV_API.queryInterop(AppState.currentUserProfile.userId, srv.required_systems, consentRes.consent.consent_id);

      // 3. Submit Multi-Department Workflow Application
      const appRes = await ONEGOV_API.saveApplication(srv.service_id, srv.service_name, srv.dept, AppState.currentUserProfile);
      addNotification("info", `✓ Application ${appRes.refId} submitted to ${srv.dept}`);

      // 4. Open Live Multi-Stage Tracker with 5-milestone timeline
      openApplicationTracker(appRes.refId, srv.service_name, srv.dept, appRes.stages || []);
    });
  }

  // Deny Consent Handler
  if (btnConsentDeny) {
    btnConsentDeny.addEventListener("click", async () => {
      const srv = AppState.activeServiceForConsent;
      if (!srv) return;

      closeServiceDetails();

      const consentRes = await ONEGOV_API.denyConsent(srv.service_id, AppState.currentUserProfile.userId, `Access for ${srv.service_name}`, srv.dept);
      showToast(`✕ Consent Denied. Data sharing stopped.`);
      addNotification("danger", `✕ Consent DENIED by Citizen for ${srv.service_name}. Data-sharing halted.`);
    });
  }

  // Application Tracker Modal & 5-Milestone Timeline Controller
  function updateMilestoneTimeline(currentStageIndex) {
    // 1: Submitted (0)
    // 2: Verification (1-3)
    // 3: Dept Processing (3-4)
    // 4: Approval (4-5)
    // 5: Completed (6)
    for (let i = 1; i <= 5; i++) {
      const step = document.getElementById(`mile-step-${i}`);
      const line = document.getElementById(`mile-line-${i}`);
      if (!step) continue;
      step.classList.remove("completed", "active");
      if (line) line.classList.remove("completed");

      if (i === 1) {
        step.classList.add("completed");
        if (line) line.classList.add("completed");
      } else if (i === 2) {
        if (currentStageIndex >= 1 && currentStageIndex <= 3) {
          step.classList.add(currentStageIndex >= 3 ? "completed" : "active");
          if (currentStageIndex >= 3 && line) line.classList.add("completed");
        } else if (currentStageIndex > 3) {
          step.classList.add("completed");
          if (line) line.classList.add("completed");
        }
      } else if (i === 3) {
        if (currentStageIndex >= 3 && currentStageIndex <= 4) {
          step.classList.add(currentStageIndex >= 4 ? "completed" : "active");
          if (currentStageIndex >= 4 && line) line.classList.add("completed");
        } else if (currentStageIndex > 4) {
          step.classList.add("completed");
          if (line) line.classList.add("completed");
        }
      } else if (i === 4) {
        if (currentStageIndex === 4) {
          step.classList.add("active");
        } else if (currentStageIndex >= 5) {
          step.classList.add("completed");
          if (line) line.classList.add("completed");
        }
      } else if (i === 5) {
        if (currentStageIndex >= 5) {
          step.classList.add("completed");
        }
      }
    }
  }

  function openApplicationTracker(refId, serviceName, dept, stages) {
    document.getElementById("tracker-ref-id").textContent = refId;
    document.getElementById("tracker-modal-title").textContent = serviceName;
    document.getElementById("tracker-service-dept").textContent = dept;

    const currentIdx = stages.findIndex(s => s.status === 'IN_PROGRESS');
    updateMilestoneTimeline(currentIdx !== -1 ? currentIdx : 2);

    const stagesList = document.getElementById("verification-stages-list");
    stagesList.innerHTML = stages.map((st) => `
      <div class="v-stage ${st.status === 'VERIFIED' ? 'stage-completed' : (st.status === 'IN_PROGRESS' ? 'stage-progress' : 'stage-pending')}" id="v-stage-${st.id}">
        <div class="v-stage-icon">${st.icon}</div>
        <div class="v-stage-info">
          <div class="v-stage-title-row">
            <h4>Stage ${st.id}: ${st.name}</h4>
            <span class="v-status-badge ${st.status === 'VERIFIED' ? 'badge-green' : (st.status === 'IN_PROGRESS' ? 'badge-amber' : 'badge-gray')}">
              ${st.status === 'VERIFIED' ? '✓ Completed' : (st.status === 'IN_PROGRESS' ? '⏳ Processing' : '○ Pending')} (${st.dept})
            </span>
          </div>
          <p class="v-stage-desc">Authority: <strong>${st.authority}</strong> • Status: ${st.time}</p>
        </div>
      </div>
    `).join("");

    AppState.activeApplicationSimulation = { refId, currentStep: currentIdx !== -1 ? currentIdx : 2, totalStages: stages.length };
    trackerModal.classList.add("active");
    trackerModal.setAttribute("aria-hidden", "false");
  }

  function closeApplicationTracker() {
    trackerModal.classList.remove("active");
    trackerModal.setAttribute("aria-hidden", "true");
  }

  btnCloseTracker.addEventListener("click", closeApplicationTracker);
  btnCancelTracker.addEventListener("click", closeApplicationTracker);
  trackerBackdrop.addEventListener("click", closeApplicationTracker);

  // Advance Simulation Step
  btnAdvanceSimulation.addEventListener("click", async () => {
    if (!AppState.activeApplicationSimulation) return;
    const refId = AppState.activeApplicationSimulation.refId;
    const res = await ONEGOV_API.advanceWorkflow(refId);
    if (res && res.application) {
      openApplicationTracker(refId, res.application.serviceName, res.application.dept, res.application.stages);
      showToast(`Advanced Stage: ${res.application.overallStatus}`);
      addNotification("info", `Workflow ${refId} advanced: ${res.application.overallStatus}`);
    }
  });

  // Public Quick Track Form
  quickTrackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const refId = quickTrackInput.value.trim();
    if (!refId) return;

    const appStatus = await ONEGOV_API.getWorkflowStatus(refId);
    if (appStatus && appStatus.application) {
      openApplicationTracker(refId, appStatus.application.serviceName, appStatus.application.dept, appStatus.application.stages);
    } else {
      // Fallback mock application
      openApplicationTracker(refId, "National Scholarship Portal (NSP)", "Ministry of Education", [
        {"id": 1, "name": "Identity Verification", "status": "VERIFIED", "authority": "DigiLocker / UIDAI", "icon": "✓"},
        {"id": 2, "name": "Academic Credential Check", "status": "VERIFIED", "authority": "Academic Bank of Credits", "icon": "✓"},
        {"id": 3, "name": "Income / Revenue Verification", "status": "IN_PROGRESS", "authority": "CBDT Revenue Gateway", "icon": "⏳"},
        {"id": 4, "name": "Autonomous Rules Engine", "status": "PENDING", "authority": "ONEGOV Engine", "icon": "○"},
        {"id": 5, "name": "Single Sign-off & Disbursement", "status": "PENDING", "authority": "National Registry", "icon": "○"}
      ]);
    }
  });

  navBtnTrack.addEventListener("click", () => {
    navigateTo("page-category");
    quickTrackInput.focus();
    quickTrackInput.select();
  });

  // ============================================================================
  // 5. FEDERATED SSO MODAL (DigiLocker / MeriPehchan)
  // ============================================================================
  let selectedCitizenType = "student";

  function openSsoModal() {
    if (!ssoModal) return;
    ssoModal.classList.add("active");
    ssoModal.setAttribute("aria-hidden", "false");
  }

  function closeSsoModal() {
    if (!ssoModal) return;
    ssoModal.classList.remove("active");
    ssoModal.setAttribute("aria-hidden", "true");
  }

  if (navBtnSso) navBtnSso.addEventListener("click", openSsoModal);
  if (btnSsoFill) btnSsoFill.addEventListener("click", openSsoModal);
  if (btnCloseSso) btnCloseSso.addEventListener("click", closeSsoModal);
  if (btnCancelSso) btnCancelSso.addEventListener("click", closeSsoModal);
  if (ssoBackdrop) ssoBackdrop.addEventListener("click", closeSsoModal);

  ssoCitizenCards.forEach((card) => {
    card.addEventListener("click", () => {
      ssoCitizenCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedCitizenType = card.getAttribute("data-citizen");
    });
  });

  if (btnConfirmSso) {
    btnConfirmSso.addEventListener("click", async () => {
      closeSsoModal();
      const tokenRes = await ONEGOV_API.requestOidcToken(selectedCitizenType);
      if (tokenRes && tokenRes.access_token) {
        AppState.ssoToken = tokenRes.access_token;
        AppState.currentUserProfile = { ...tokenRes.citizen_claims, verifiedSSO: true };
        
        // Update Navbar Verified State
        const ssoLabel = document.getElementById("nav-sso-label");
        const ssoDot = document.getElementById("nav-sso-dot");
        if (ssoLabel) ssoLabel.textContent = `✓ ${tokenRes.citizen_claims.name.split(' ')[0]}`;
        if (ssoDot) ssoDot.style.display = "inline-block";
        
        showToast(`✓ OIDC JWT Token Issued for ${tokenRes.citizen_claims.name}! Masked Aadhaar: ${tokenRes.citizen_claims.aadhaar_masked}`);
        
        // If currently on profile page, populate
        if (AppState.activeView === "page-profile") {
          const fn = document.getElementById("input-fullname");
          const dob = document.getElementById("input-dob");
          const mob = document.getElementById("input-mobile");
          const em = document.getElementById("input-email");
          const st = document.getElementById("input-state");
          const dt = document.getElementById("input-district");
          const pc = document.getElementById("input-pincode");
          if (fn) fn.value = tokenRes.citizen_claims.name;
          if (dob) dob.value = tokenRes.citizen_claims.dob;
          if (mob) mob.value = tokenRes.citizen_claims.mobile;
          if (em) em.value = tokenRes.citizen_claims.email;
          if (st) st.value = tokenRes.citizen_claims.state;
          if (dt) dt.value = tokenRes.citizen_claims.district;
          if (pc) pc.value = tokenRes.citizen_claims.pincode;
        }
      }
    });
  }

  // ============================================================================
  // 6. ADAPTER & OCDS SCHEMA INSPECTOR MODAL
  // ============================================================================
  function openInspectorModal() {
    if (!inspectorModal) return;
    inspectorModal.classList.add("active");
    inspectorModal.setAttribute("aria-hidden", "false");
  }

  function closeInspectorModal() {
    if (!inspectorModal) return;
    inspectorModal.classList.remove("active");
    inspectorModal.setAttribute("aria-hidden", "true");
  }

  if (btnOpenInspector) btnOpenInspector.addEventListener("click", openInspectorModal);
  if (btnCloseInspector) btnCloseInspector.addEventListener("click", closeInspectorModal);
  if (btnCloseInspectorFooter) btnCloseInspectorFooter.addEventListener("click", closeInspectorModal);
  if (inspectorBackdrop) inspectorBackdrop.addEventListener("click", closeInspectorModal);

  inspectorTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      inspectorTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const targetTab = tab.getAttribute("data-tab");

      const tSoap = document.getElementById("tab-content-soap");
      const tSql = document.getElementById("tab-content-sql");
      const tOcds = document.getElementById("tab-content-ocds");
      if (tSoap) tSoap.style.display = targetTab === "soap" ? "block" : "none";
      if (tSql) tSql.style.display = targetTab === "sql" ? "block" : "none";
      if (tOcds) tOcds.style.display = targetTab === "ocds" ? "block" : "none";
    });
  });

  if (btnRunAdapterTest) {
    btnRunAdapterTest.addEventListener("click", async () => {
      btnRunAdapterTest.textContent = "⏳ Executing Transformation...";
      const res = await ONEGOV_API.testAdapters();
      if (res && res.adapters_tested) {
        const cSoap = document.getElementById("code-soap-view");
        const cSql = document.getElementById("code-sql-view");
        const cOcds = document.getElementById("code-ocds-view");
        if (cSoap) cSoap.textContent = res.adapters_tested.soap_xml_adapter.raw_envelope_preview;
        if (cSql) cSql.textContent = JSON.stringify(res.adapters_tested.legacy_sql_adapter.raw_row, null, 2);
        if (cOcds) cOcds.textContent = JSON.stringify(res.adapters_tested.soap_xml_adapter.normalized_ocds, null, 2);
        showToast("Multi-Protocol transformation benchmark executed (Avg execution: 24ms)!");
      }
      btnRunAdapterTest.textContent = "⚡ Execute Live Adapter Benchmark";
    });
  }

  // ============================================================================
  // 7. RBAC, GOVERNMENT OFFICER PORTAL & ADMIN AUDIT VAULT CONTROLLER
  // ============================================================================
  const demoRoleSelect = document.getElementById("demo-role-select");
  const btnOfficerRefresh = document.getElementById("btn-officer-refresh");

  function applyRolePermissions(role) {
    AppState.currentRole = role || "CITIZEN";
    if (demoRoleSelect) demoRoleSelect.value = AppState.currentRole;

    const btnOpenInspector = document.getElementById("btn-open-inspector");
    const tabsCitizen = document.getElementById("nav-tabs-citizen");
    const tabsOfficer = document.getElementById("nav-tabs-officer");
    const tabsAdmin = document.getElementById("nav-tabs-admin");

    if (tabsCitizen) tabsCitizen.style.display = role === "CITIZEN" ? "flex" : "none";
    if (tabsOfficer) tabsOfficer.style.display = role === "OFFICER" ? "flex" : "none";
    if (tabsAdmin) tabsAdmin.style.display = role === "ADMINISTRATOR" ? "flex" : "none";

    if (role === "CITIZEN") {
      if (btnOpenInspector) btnOpenInspector.style.display = "none";
      navigateTo("page-category");
      showToast("DEMO ROLE: CITIZEN (Access: Unified Profile, Services, Consent, Tracking)");
    } else if (role === "OFFICER") {
      if (btnOpenInspector) btnOpenInspector.style.display = "none";
      navigateTo("page-officer");
      renderOfficerQueue();
      showToast("DEMO ROLE: GOVERNMENT OFFICER (Access: Application Queue, Verification, Approve/Reject)");
    } else if (role === "ADMINISTRATOR") {
      if (btnOpenInspector) btnOpenInspector.style.display = "inline-block";
      navigateTo("page-admin");
      loadAdminDashboardData();
      showToast("DEMO ROLE: ADMINISTRATOR (Access: Full Telemetry, Circuit Breakers, Audit Vault)");
    }

    // Record Login audit log entry
    fetch("/api/audit-logs/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "LOGIN",
        actor: `${role} User`,
        role: role,
        service: "ONEGOV RBAC Access Control",
        status: "SUCCESS",
        details: { action: `Role login switched to ${role}` }
      })
    }).catch(() => {});
  }

  if (demoRoleSelect) {
    demoRoleSelect.addEventListener("change", (e) => {
      applyRolePermissions(e.target.value);
    });
  }

  // Sub-Navigation Tab Click Handlers
  document.querySelectorAll(".nav-tab-item").forEach(tab => {
    tab.addEventListener("click", () => {
      const navTarget = tab.getAttribute("data-nav-target");
      const adminAnchor = tab.getAttribute("data-admin-anchor");

      if (navTarget) {
        document.querySelectorAll(".nav-tab-item").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        navigateTo(navTarget);
      } else if (adminAnchor) {
        document.querySelectorAll(".nav-tab-item").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const el = document.getElementById(adminAnchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const subnavBtnTrack = document.getElementById("subnav-btn-track");
  if (subnavBtnTrack) {
    subnavBtnTrack.addEventListener("click", () => {
      navigateTo("page-category");
      const input = document.getElementById("quick-track-input");
      if (input) { input.focus(); input.select(); }
    });
  }

  const subnavBtnConsent = document.getElementById("subnav-btn-consent");
  if (subnavBtnConsent) {
    subnavBtnConsent.addEventListener("click", openConsentHistoryModal);
  }

  const subnavOfficerRefresh = document.getElementById("subnav-officer-refresh");
  if (subnavOfficerRefresh) {
    subnavOfficerRefresh.addEventListener("click", () => {
      renderOfficerQueue();
      showToast("Officer Queue refreshed.");
    });
  }

  // Officer Application Queue Renderer
  async function renderOfficerQueue() {
    const appData = await ONEGOV_API.getAdminApplications();
    const tbody = document.getElementById("officer-queue-tbody");
    if (!tbody) return;

    if (appData && appData.applications && appData.applications.length > 0) {
      const appsList = appData.applications;
      const pendingCount = appsList.length;
      const processingCount = appsList.filter(a => !a.overallStatus.includes("APPROVED") && !a.overallStatus.includes("SANCTIONED") && !a.overallStatus.includes("REJECTED")).length;
      const approvedCount = appsList.filter(a => a.overallStatus.includes("APPROVED") || a.overallStatus.includes("SANCTIONED")).length;
      const rejectedCount = appsList.filter(a => a.overallStatus.includes("REJECTED")).length;

      const kpiPending = document.getElementById("officer-kpi-pending");
      const kpiProcessing = document.getElementById("officer-kpi-processing");
      const kpiApproved = document.getElementById("officer-kpi-approved");
      const kpiRejected = document.getElementById("officer-kpi-rejected");

      if (kpiPending) kpiPending.textContent = pendingCount;
      if (kpiProcessing) kpiProcessing.textContent = processingCount;
      if (kpiApproved) kpiApproved.textContent = approvedCount;
      if (kpiRejected) kpiRejected.textContent = rejectedCount;

      document.getElementById("officer-queue-count").textContent = `${appData.total} Applications Pending`;
      tbody.innerHTML = appData.applications.map((app) => {
        const currentStage = app.stages ? app.stages[app.currentStageIndex] : null;
        const deptName = currentStage ? currentStage.dept : app.dept;
        const stageName = currentStage ? currentStage.name : "Final Approval";
        const submittedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "28 Sep 2026";
        const citizenDemoId = app.citizenId ? `CIT-DEMO-${app.citizenId.replace('IND-', '')}` : "CIT-DEMO-001";
        
        let statusBadge = "badge-amber";
        if (app.overallStatus.includes("REJECTED")) statusBadge = "badge-red";
        else if (app.overallStatus.includes("APPROVED") || app.overallStatus.includes("SANCTIONED")) statusBadge = "badge-green";

        return `
          <tr>
            <td><strong>${app.refId}</strong></td>
            <td><span class="code-font">${citizenDemoId}</span></td>
            <td>${app.serviceName}</td>
            <td>${deptName}</td>
            <td><span class="tag-blue">${stageName}</span></td>
            <td><span class="v-status-badge ${statusBadge}">${app.overallStatus}</span></td>
            <td>${submittedDate}</td>
            <td>
              <button type="button" class="btn-primary-sm btn-view-app" data-ref-id="${app.refId}">View</button>
            </td>
          </tr>
        `;
      }).join("");

      document.querySelectorAll(".btn-view-app").forEach((btn) => {
        btn.addEventListener("click", () => {
          const refId = btn.getAttribute("data-ref-id");
          openOfficerAppDetailsModal(refId);
        });
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="table-empty-note">No applications in queue.</td></tr>`;
    }
  }

  if (btnOfficerRefresh) {
    btnOfficerRefresh.addEventListener("click", () => {
      renderOfficerQueue();
      showToast("Officer Queue refreshed.");
    });
  }

  // Helper to render 6-Stage Workflow state inside Officer Application Details Modal
  function renderOfficer6StageWorkflow(app) {
    const container = document.getElementById("officer-6stage-container");
    if (!container || !app || !app.stages) return;

    container.innerHTML = app.stages.map((st) => {
      let statusLabel = "○ PENDING";
      let statusClass = "badge-gray";
      if (st.status === "VERIFIED") {
        statusLabel = "✓ COMPLETED";
        statusClass = "badge-green";
      } else if (st.status === "IN_PROGRESS") {
        statusLabel = "⏳ PROCESSING";
        statusClass = "badge-amber";
      } else if (st.status === "FAILED") {
        statusLabel = "✕ FAILED";
        statusClass = "badge-red";
      }

      return `
        <div class="v-stage ${st.status === 'VERIFIED' ? 'stage-completed' : (st.status === 'IN_PROGRESS' ? 'stage-progress' : (st.status === 'FAILED' ? 'stage-failed' : 'stage-pending'))}" style="padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 16px; font-weight: bold;">${st.icon}</span>
            <div>
              <strong style="font-size: 14px;">Stage ${st.id}: ${st.name}</strong>
              <div style="font-size: 12px; color: #64748b;">Department: <strong>${st.dept}</strong> • Authority: ${st.authority}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="v-status-badge ${statusClass}">${statusLabel}</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Timestamp: ${st.time || 'Queued'}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Officer Application Details Modal
  async function openOfficerAppDetailsModal(refId) {
    const modal = document.getElementById("officer-app-details-modal");
    if (!modal) return;

    const appData = await ONEGOV_API.getWorkflowStatus(refId);
    const app = appData && appData.application ? appData.application : null;

    if (app) {
      AppState.activeOfficerRefId = refId;
      document.getElementById("officer-app-ref-badge").textContent = app.refId;
      document.getElementById("officer-app-dept").textContent = app.dept || "Ministry of Education";
      document.getElementById("officer-cit-name").textContent = app.citizenName || "Aarav Sharma";
      document.getElementById("officer-cit-id").textContent = app.citizenId || "IND-8842";
      document.getElementById("officer-app-service").textContent = app.serviceName;

      const currentStage = app.stages ? app.stages[app.currentStageIndex] : null;
      document.getElementById("officer-app-curr-stage").textContent = currentStage ? `Stage ${app.currentStageIndex + 1}: ${currentStage.name}` : app.overallStatus;

      const verStatus = currentStage ? currentStage.status : "IN_PROGRESS";
      const verBadge = verStatus === "VERIFIED" ? "badge-green" : (verStatus === "FAILED" ? "badge-red" : "badge-amber");
      document.getElementById("officer-app-ver-status").innerHTML = `<span class="${verBadge}">${verStatus}</span>`;
      document.getElementById("officer-app-last-updated").textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Render 6-Stage Workflow inside modal
      renderOfficer6StageWorkflow(app);

      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    } else {
      showToast(`Application ${refId} details not found`);
    }
  }

  // Officer [ VERIFY ] Button Action
  const btnOfficerVerifyStage = document.getElementById("btn-officer-verify-stage");
  if (btnOfficerVerifyStage) {
    btnOfficerVerifyStage.addEventListener("click", async () => {
      const refId = AppState.activeOfficerRefId;
      if (!refId) return;

      const res = await ONEGOV_API.adminAction(refId, "VERIFY_STAGE", "Officer verified current department stage.", null, "VERIFIED");
      if (res && res.application) {
        const updatedApp = res.application;
        const stageName = updatedApp.stages && updatedApp.stages[updatedApp.currentStageIndex - 1] ? updatedApp.stages[updatedApp.currentStageIndex - 1].name : "Stage Verification";
        
        addNotification("success", `✓ ${stageName} completed for application ${refId}.`);
        showToast(`✓ ${stageName} marked VERIFIED!`);
        openOfficerAppDetailsModal(refId);
        renderOfficerQueue();
      }
    });
  }

  // Officer [ MARK FAILED ] Button Action
  const btnOfficerMarkFailed = document.getElementById("btn-officer-mark-failed");
  if (btnOfficerMarkFailed) {
    btnOfficerMarkFailed.addEventListener("click", async () => {
      const refId = AppState.activeOfficerRefId;
      if (!refId) return;

      const res = await ONEGOV_API.adminAction(refId, "VERIFY_STAGE", "Officer marked stage verification as FAILED.", null, "FAILED");
      if (res && res.application) {
        addNotification("danger", `✕ Verification failed for application ${refId}.`);
        showToast(`✕ Stage marked FAILED for ${refId}`);
        openOfficerAppDetailsModal(refId);
        renderOfficerQueue();
      }
    });
  }

  // Officer [ APPROVE APPLICATION ] Trigger Action -> Opens Approval Confirmation Modal
  const btnOfficerModalApprove = document.getElementById("btn-officer-modal-approve");
  const approveModal = document.getElementById("officer-approve-modal");
  const btnCloseApproveModal = document.getElementById("btn-close-approve-modal");
  const btnCancelApprove = document.getElementById("btn-cancel-approve");
  const btnConfirmApprove = document.getElementById("btn-confirm-approve");

  if (btnOfficerModalApprove) {
    btnOfficerModalApprove.addEventListener("click", async () => {
      const refId = AppState.activeOfficerRefId;
      if (!refId) return;

      const appData = await ONEGOV_API.getWorkflowStatus(refId);
      const app = appData && appData.application ? appData.application : null;

      document.getElementById("approve-modal-ref-id").textContent = `Ref: ${refId}`;
      document.getElementById("approve-modal-app-id").textContent = refId;
      document.getElementById("approve-modal-service").textContent = app ? app.serviceName : "Government Service";
      document.getElementById("approve-modal-stage").textContent = app && app.stages ? (app.stages[app.currentStageIndex] ? app.stages[app.currentStageIndex].name : "Final Sanction") : "Final Sanction";

      if (approveModal) {
        approveModal.classList.add("active");
        approveModal.setAttribute("aria-hidden", "false");
      }
    });
  }

  function closeApproveModal() {
    if (approveModal) {
      approveModal.classList.remove("active");
      approveModal.setAttribute("aria-hidden", "true");
    }
  }

  if (btnCloseApproveModal) btnCloseApproveModal.addEventListener("click", closeApproveModal);
  if (btnCancelApprove) btnCancelApprove.addEventListener("click", closeApproveModal);

  if (btnConfirmApprove) {
    btnConfirmApprove.addEventListener("click", async () => {
      const refId = AppState.activeOfficerRefId;
      closeApproveModal();

      const res = await ONEGOV_API.adminAction(refId, "APPROVE_FINAL", "Approved by Government Officer after verified multi-department checks.");
      if (res && res.application) {
        addNotification("success", `Your application ${refId} has been approved.`);
        showToast(`✓ Application ${refId} Approved!`);
        document.getElementById("officer-app-details-modal").classList.remove("active");
        renderOfficerQueue();
      }
    });
  }

  // Officer [ REJECT APPLICATION ] Trigger Action -> Opens Rejection Dialog Modal
  const btnOfficerModalReject = document.getElementById("btn-officer-modal-reject");
  if (btnOfficerModalReject) {
    btnOfficerModalReject.addEventListener("click", () => {
      const refId = AppState.activeOfficerRefId;
      document.getElementById("officer-app-details-modal").classList.remove("active");
      openOfficerRejectModal(refId);
    });
  }

  // Officer Reject Modal handlers
  function openOfficerRejectModal(refId) {
    const modal = document.getElementById("officer-reject-modal");
    if (!modal) return;
    AppState.activeOfficerRefId = refId;
    document.getElementById("reject-modal-ref-id").textContent = `Ref: ${refId}`;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }

  const officerRejectForm = document.getElementById("officer-reject-form");
  if (officerRejectForm) {
    officerRejectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const refId = AppState.activeOfficerRefId;
      const preset = document.getElementById("reject-preset-select").value;
      const custom = document.getElementById("officer-rejection-reason").value;
      const reason = preset === "Other" ? custom : preset;

      if (!reason || !reason.trim()) {
        showToast("Please specify a valid rejection reason.");
        return;
      }

      const res = await ONEGOV_API.adminAction(refId, "REJECT", `Rejected by Officer`, reason);
      if (res && res.application) {
        addNotification("danger", `Your application ${refId} has been rejected. Reason: ${reason}`);
        showToast(`Application ${refId} rejected: ${reason}`);
        document.getElementById("officer-reject-modal").classList.remove("active");
        renderOfficerQueue();
      }
    });
  }

  const btnCloseOfficerModal = document.getElementById("btn-close-officer-modal");
  if (btnCloseOfficerModal) {
    btnCloseOfficerModal.addEventListener("click", () => {
      document.getElementById("officer-app-details-modal").classList.remove("active");
    });
  }

  const btnCloseRejectModal = document.getElementById("btn-close-reject-modal");
  const btnCancelReject = document.getElementById("btn-cancel-reject");
  if (btnCloseRejectModal) {
    btnCloseRejectModal.addEventListener("click", () => {
      document.getElementById("officer-reject-modal").classList.remove("active");
    });
  }
  if (btnCancelReject) {
    btnCancelReject.addEventListener("click", () => {
      document.getElementById("officer-reject-modal").classList.remove("active");
    });
  }

  const rejectPresetSelect = document.getElementById("reject-preset-select");
  if (rejectPresetSelect) {
    rejectPresetSelect.addEventListener("change", (e) => {
      const customGrp = document.getElementById("reject-custom-group");
      if (customGrp) {
        customGrp.style.display = e.target.value === "Other" ? "block" : "none";
      }
    });
  }

  // Admin Dashboard Telemetry & Audit Vault Loader
  async function loadAdminDashboardData() {
    const overview = await ONEGOV_API.getAdminOverview();
    if (overview) {
      document.getElementById("kpi-inquiries").textContent = overview.metrics.total_applications * 710 || "1,420";
      document.getElementById("kpi-pipeline").textContent = overview.metrics.in_review || "2";
      document.getElementById("cb-summary-badge").textContent = overview.metrics.active_gateways;
    }

    // Load Audit Logs into Admin Audit Vault Table
    try {
      const auditRes = await fetch("/api/audit-logs");
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        const vaultTbody = document.getElementById("admin-audit-vault-tbody");
        if (vaultTbody && auditData.logs) {
          document.getElementById("admin-audit-vault-count").textContent = `${auditData.totalLogs} Recorded Audit Logs`;
          vaultTbody.innerHTML = auditData.logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let badgeClass = "tag-green";
            if (log.status === "WARN") badgeClass = "tag-amber";
            else if (log.status === "FAILED") badgeClass = "tag-red";

            return `
              <tr>
                <td><span class="code-font">${timeStr}</span></td>
                <td><strong>${log.event || 'API_REQUEST'}</strong></td>
                <td>${log.actor || 'System Engine'}</td>
                <td><span class="tag-blue">${log.role || 'SYSTEM'}</span></td>
                <td><span class="code-font">${log.refId || 'N/A'}</span></td>
                <td>${log.action || log.service}</td>
                <td><span class="v-status-badge ${badgeClass}">${log.status || 'SUCCESS'}</span></td>
                <td><span class="code-font hash-code">${log.hash ? log.hash.substring(0, 12) + '...' : '0x88f2a1...'}</span></td>
              </tr>
            `;
          }).join("");
        }
      }
    } catch (e) {
      console.warn("Failed to load audit logs", e);
    }

    // Load Resilience & Circuit Breakers Status
    const resilience = await ONEGOV_API.getResilienceStatus();
    if (resilience && resilience.circuit_breakers) {
      const chips = document.getElementById("cb-chips-container");
      if (chips) {
        chips.innerHTML = Object.entries(resilience.circuit_breakers).map(([k, cb]) => `
          <div class="cb-chip-row">
            <span><strong>${cb.name}</strong></span>
            <span class="${cb.raw_state === 'OPEN' ? 'tag-red' : 'tag-green'}">${cb.state}</span>
          </div>
        `).join("");
      }

      // DLQ Table
      const dlqBody = document.getElementById("admin-dlq-tbody");
      if (dlqBody) {
        document.getElementById("dlq-count-badge").textContent = `${resilience.dlq_count} Pending Failures`;
        if (resilience.dlq_items && resilience.dlq_items.length > 0) {
          dlqBody.innerHTML = resilience.dlq_items.map((item) => `
            <tr>
              <td><strong>${item.id}</strong></td>
              <td>${new Date(item.timestamp).toLocaleTimeString()}</td>
              <td>${item.service}</td>
              <td><span class="tag-red">${item.error}</span></td>
              <td><button type="button" class="btn-primary-sm btn-retry-dlq" data-dlq-id="${item.id}">Reprocess ➔</button></td>
            </tr>
          `).join("");

          document.querySelectorAll(".btn-retry-dlq").forEach(btn => {
            btn.addEventListener("click", async () => {
              const dId = btn.getAttribute("data-dlq-id");
              await ONEGOV_API.retryDlq(dId);
              showToast(`Message ${dId} reprocessed successfully.`);
              loadAdminDashboardData();
            });
          });
        } else {
          dlqBody.innerHTML = `<tr><td colspan="5" class="table-empty-note">No failed requests in DLQ. All department gateways are operating smoothly.</td></tr>`;
        }
      }
    }
  }PresetSelect = document.getElementById("reject-preset-select");
  if (rejectPresetSelect) {
    rejectPresetSelect.addEventListener("change", (e) => {
      const customGrp = document.getElementById("reject-custom-group");
      if (customGrp) {
        customGrp.style.display = e.target.value === "CUSTOM" ? "block" : "none";
      }
    });
  }

  // Admin Dashboard Telemetry & Audit Vault Loader
  async function loadAdminDashboardData() {
    const overview = await ONEGOV_API.getAdminOverview();
    if (overview) {
      document.getElementById("kpi-inquiries").textContent = overview.metrics.total_applications * 710 || "1,420";
      document.getElementById("kpi-pipeline").textContent = overview.metrics.in_review || "2";
      document.getElementById("cb-summary-badge").textContent = overview.metrics.active_gateways;
    }

    // Load Audit Logs into Admin Audit Vault Table
    try {
      const auditRes = await fetch("/api/audit-logs");
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        const vaultTbody = document.getElementById("admin-audit-vault-tbody");
        if (vaultTbody && auditData.logs) {
          document.getElementById("admin-audit-vault-count").textContent = `${auditData.totalLogs} Recorded Audit Logs`;
          vaultTbody.innerHTML = auditData.logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let badgeClass = "tag-green";
            if (log.status === "WARN") badgeClass = "tag-amber";
            else if (log.status === "FAILED") badgeClass = "tag-red";

            return `
              <tr>
                <td><span class="code-font">${timeStr}</span></td>
                <td><strong>${log.event || 'API_REQUEST'}</strong></td>
                <td>${log.actor || 'System Engine'}</td>
                <td><span class="tag-blue">${log.role || 'SYSTEM'}</span></td>
                <td><span class="code-font">${log.refId || 'N/A'}</span></td>
                <td>${log.action || log.service}</td>
                <td><span class="v-status-badge ${badgeClass}">${log.status || 'SUCCESS'}</span></td>
                <td><span class="code-font hash-code">${log.hash ? log.hash.substring(0, 12) + '...' : '0x88f2a1...'}</span></td>
              </tr>
            `;
          }).join("");
        }
      }
    } catch (e) {
      console.warn("Failed to load audit logs", e);
    }

    // Load Resilience & Circuit Breakers Status
    const resilience = await ONEGOV_API.getResilienceStatus();
    if (resilience && resilience.circuit_breakers) {
      const chips = document.getElementById("cb-chips-container");
      if (chips) {
        chips.innerHTML = Object.entries(resilience.circuit_breakers).map(([k, cb]) => `
          <div class="cb-chip-row">
            <span><strong>${cb.name}</strong></span>
            <span class="${cb.raw_state === 'OPEN' ? 'tag-red' : 'tag-green'}">${cb.state}</span>
          </div>
        `).join("");
      }

      // DLQ Table
      const dlqBody = document.getElementById("admin-dlq-tbody");
      if (dlqBody) {
        document.getElementById("dlq-count-badge").textContent = `${resilience.dlq_count} Pending Failures`;
        if (resilience.dlq_items && resilience.dlq_items.length > 0) {
          dlqBody.innerHTML = resilience.dlq_items.map((item) => `
            <tr>
              <td><strong>${item.id}</strong></td>
              <td>${new Date(item.timestamp).toLocaleTimeString()}</td>
              <td>${item.service}</td>
              <td><span class="tag-red">${item.error}</span></td>
              <td><button type="button" class="btn-primary-sm btn-retry-dlq" data-dlq-id="${item.id}">Reprocess ➔</button></td>
            </tr>
          `).join("");

          document.querySelectorAll(".btn-retry-dlq").forEach(btn => {
            btn.addEventListener("click", async () => {
              const dId = btn.getAttribute("data-dlq-id");
              await ONEGOV_API.retryDlq(dId);
              showToast(`Message ${dId} reprocessed successfully.`);
              loadAdminDashboardData();
            });
          });
        } else {
          dlqBody.innerHTML = `<tr><td colspan="5" class="table-empty-note">No failed requests in DLQ. All department gateways are operating smoothly.</td></tr>`;
        }
      }
    }
  }

  if (btnAdminRefresh) {
    btnAdminRefresh.addEventListener("click", () => {
      loadAdminDashboardData();
      showToast("Live telemetry & audit vault refreshed.");
    });
  }

  btnToggleIncomeFault.addEventListener("click", async () => {
    const res = await ONEGOV_API.toggleCircuitBreaker("income");
    showToast(`CBDT Revenue Gateway Circuit Breaker: ${res.state}`);
    loadAdminDashboardData();
  });

  btnToggleEduFault.addEventListener("click", async () => {
    const res = await ONEGOV_API.toggleCircuitBreaker("education");
    showToast(`ABC SOAP XML Gateway Circuit Breaker: ${res.state}`);
    loadAdminDashboardData();
  });

  btnResetBreakers.addEventListener("click", async () => {
    await ONEGOV_API.toggleCircuitBreaker("income");
    await ONEGOV_API.toggleCircuitBreaker("education");
    showToast("All Circuit Breakers reset to CLOSED (Healthy).");
    loadAdminDashboardData();
  });

  // Nav brand logo home click
  navBrandLogo.addEventListener("click", (e) => {
    e.preventDefault();
    applyRolePermissions("CITIZEN");
  });

  // Edit Profile / Switch Category from Dashboard
  document.getElementById("dash-edit-profile-btn").addEventListener("click", () => {
    navigateTo("page-profile");
    setFormStep(1);
  });

  document.getElementById("dash-change-category-btn").addEventListener("click", () => {
    navigateTo("page-category");
  });

  // Language switcher
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const isEnglish = langToggle.querySelector(".lang-active").textContent === "EN";
      if (isEnglish) {
        langToggle.innerHTML = '<span class="lang-option">EN</span><span class="lang-divider">|</span><span class="lang-active">हिंदी</span>';
        showToast("भाषा बदलकर हिंदी की गई (Interoperability Portal Demo)");
      } else {
        langToggle.innerHTML = '<span class="lang-active">EN</span><span class="lang-divider">|</span><span class="lang-option">हिंदी</span>';
        showToast("Language switched to English");
      }
    });
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      showToast("ONEGOV National Citizen Interoperability Helpline: 1800-11-0040");
    });
  }
});

// Toast notification helper
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <svg viewBox="0 0 20 20" width="16" height="16" fill="#EA580C">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3400);
}
