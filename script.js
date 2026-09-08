/**
 * ONEGOV Platform - Citizen Interoperability Platform Client
 * Architecture: Pure Vanilla JavaScript (Modular, Event-Driven, REST-API Ready)
 * Problem Statement: SIH 2026 - Unified Citizen Services Interoperability Gateway
 */

// ============================================================================
// 1. REST API Client Layer (Prepared for FastAPI Backend Integration)
// ============================================================================
const ONEGOV_API = {
  baseUrl: "http://localhost:8000/api",

  // POST /api/users - Register or update unified citizen profile
  async saveProfile(profileData) {
    try {
      // In production with FastAPI running:
      // const res = await fetch(`${this.baseUrl}/users`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(profileData)
      // });
      // return await res.json();

      // Client-side fallback for frontend prototype:
      const userId = profileData.userId || "IND-" + Math.floor(1000 + Math.random() * 9000);
      const enrichedProfile = { ...profileData, userId, updatedAt: new Date().toISOString() };
      localStorage.setItem("oneg_citizen_profile", JSON.stringify(enrichedProfile));
      return { success: true, userId: userId, data: enrichedProfile };
    } catch (e) {
      console.warn("ONEGOV_API: saveProfile local fallback", e);
      return { success: false, error: e.message };
    }
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

  // POST /api/consent/grant - Record citizen consent for cross-department data sharing
  async grantConsent(serviceId, citizenId, requiredSystems) {
    const consentRecord = {
      consent_id: "CNS-" + Math.floor(100000 + Math.random() * 900000),
      service_id: serviceId,
      citizen_id: citizenId,
      systems_authorized: requiredSystems,
      timestamp: new Date().toISOString(),
      legal_framework: "DPDP Act 2023 Compliant"
    };
    try {
      localStorage.setItem("oneg_last_consent", JSON.stringify(consentRecord));
    } catch (e) {
      console.warn("Local storage consent write failed", e);
    }
    return { success: true, consent: consentRecord };
  },

  // POST /api/applications - Submit unified multi-department application
  async saveApplication(serviceId, citizenProfile) {
    const refId = "OG-2026-IND-" + Math.floor(1000 + Math.random() * 9000);
    const appData = {
      success: true,
      refId: refId,
      serviceId: serviceId,
      timestamp: new Date().toISOString(),
      status: "IN_VERIFICATION",
      stages: [
        { id: 1, name: "Identity Verification", status: "VERIFIED", authority: "DigiLocker / UIDAI", time: "Instant" },
        { id: 2, name: "Education / Work Verification", status: "VERIFIED", authority: "Academic Bank of Credits / EPFO", time: "Instant" },
        { id: 3, name: "Income / Employment Verification", status: "IN_PROGRESS", authority: "CBDT / Revenue Gateway", time: "Live" },
        { id: 4, name: "Eligibility Rules Engine", status: "PENDING", authority: "Autonomous Interoperability Engine", time: "Queued" },
        { id: 5, name: "Application Submission", status: "PENDING", authority: "National Unified Registry", time: "Queued" }
      ]
    };
    return appData;
  },

  // GET /api/applications/{application_id}/status - Fetch live application verification status
  async getApplicationStatus(applicationId) {
    return { success: true, status: "IN_PROGRESS", refId: applicationId };
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
      desc: "Digitally store, aggregate, and transfer college course credits, degrees, and diplomas securely.",
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
      service_name: "ESIC Health Coverage & Pehchan Card",
      dept: "Employees' State Insurance Corporation",
      category: "EMPLOYED",
      desc: "Comprehensive medical benefits, cashless hospitalization, and maternity benefits for working citizens.",
      tag: "Government Benefits",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Employees earning wages up to ₹21,000 per month in covered factories and establishments.",
      info_required: "IP (Insured Person) Number, Employer Registration Token.",
      required_systems: ["Employment System", "Identity System"]
    },
    {
      service_id: "S103",
      service_name: "National Pension System (eNPS)",
      dept: "PFRDA / Ministry of Finance",
      category: "EMPLOYED",
      desc: "Tier-1 voluntary retirement savings with additional ₹50,000 tax deduction under Section 80CCD(1B).",
      tag: "Government Benefits",
      badgeStyle: "background: #EDE9FE; color: #5B21B6;",
      eligibility: "Any Indian citizen between 18 and 70 years of age.",
      info_required: "Demographic KYC, Annual Income Range, Bank Verification.",
      required_systems: ["Employment System", "Income System", "Identity System"]
    },
    {
      service_id: "S104",
      service_name: "FutureSkills Prime Upskilling Grant",
      dept: "MeitY & NASSCOM",
      category: "EMPLOYED",
      desc: "Government incentives and subsidized certifications in AI, Cloud, Big Data, and Cyber Security.",
      tag: "Skill Upskilling",
      badgeStyle: "background: #DBEAFE; color: #1E40AF;",
      eligibility: "Working IT/ITES and non-IT professionals seeking certified technical upskilling.",
      info_required: "Employment Status Verification, Skill Domain Interest.",
      required_systems: ["Skill System", "Employment System", "Identity System"]
    },
    {
      service_id: "S105",
      service_name: "MSME Collateral-Free Business Expansion Loan",
      dept: "Ministry of MSME",
      category: "EMPLOYED",
      desc: "Credit guarantee fund trust (CGTMSE) for self-employed professionals & business enterprise setup.",
      tag: "Loans & Entrepreneurship",
      badgeStyle: "background: #FFEDD5; color: #9A3412;",
      eligibility: "Self-employed professionals, micro-enterprise founders, and registered MSME owners.",
      info_required: "Udyam Registration Token, Annual Revenue Declaration.",
      required_systems: ["Employment System", "Income System", "Identity System"]
    },
    {
      service_id: "S106",
      service_name: "AIS & Automated Form 26AS Tax Verification",
      dept: "Income Tax Department",
      category: "EMPLOYED",
      desc: "Instant pre-filled tax compliance statements and annual information for seamless loan sanctions.",
      tag: "Government Benefits",
      badgeStyle: "background: #F1F5F9; color: #0F1D36;",
      eligibility: "Taxpaying salaried and professional citizens.",
      info_required: "Taxpayer Identity Token, Assessment Year.",
      required_systems: ["Income System", "Identity System"]
    }
  ],

  // UNEMPLOYED SERVICES
  unemployed: [
    {
      service_id: "S201",
      service_name: "National Career Service (NCS) Job Portal",
      dept: "Ministry of Labour & Employment",
      category: "UNEMPLOYED",
      desc: "Verified job vacancies across state governments, PSUs, and verified private employers.",
      tag: "Job Opportunities",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Job seekers, freshers, and experienced professionals looking for active employment.",
      info_required: "Educational Qualification Certificate, Key Skills, Preferred Location.",
      required_systems: ["Employment System", "Identity System"]
    },
    {
      service_id: "S202",
      service_name: "DDU-GKY Placement Linked Skill Program",
      dept: "Ministry of Rural Development",
      category: "UNEMPLOYED",
      desc: "Market-led residential skill training with guaranteed minimum 70% job placement.",
      tag: "Employment Schemes",
      badgeStyle: "background: #DBEAFE; color: #1E40AF;",
      eligibility: "Youth aged 15-35 years seeking career skilling and direct corporate job placement.",
      info_required: "Identity Verification, Basic Qualification Record.",
      required_systems: ["Skill System", "Employment System", "Identity System"]
    },
    {
      service_id: "S203",
      service_name: "National Apprenticeship Promotion Scheme (NAPS)",
      dept: "Skill India Mission",
      category: "UNEMPLOYED",
      desc: "Paid on-the-job training in top manufacturing and services companies with direct government stipend.",
      tag: "Skill Training",
      badgeStyle: "background: #FFEDD5; color: #9A3412;",
      eligibility: "Candidates with 10th, 12th, ITI, Diploma, or Graduation aiming for practical apprentice work.",
      info_required: "Educational Record, Preferred Trade / Sector.",
      required_systems: ["Skill System", "Employment System", "Identity System"]
    },
    {
      service_id: "S204",
      service_name: "PMEGP Self-Employment Credit Subsidy",
      dept: "KVIC / Ministry of MSME",
      category: "UNEMPLOYED",
      desc: "Subsidy up to 35% of project cost for setting up new micro-enterprises and service units.",
      tag: "Entrepreneurship & Support",
      badgeStyle: "background: #EDE9FE; color: #5B21B6;",
      eligibility: "Individuals above 18 years; minimum 8th pass for projects above ₹10 Lakhs in manufacturing.",
      info_required: "Project Proposal Summary, Location Proof, Income Bracket.",
      required_systems: ["Income System", "Employment System", "Identity System"]
    },
    {
      service_id: "S205",
      service_name: "e-Shram Universal Social Security Card",
      dept: "Ministry of Labour & Employment",
      category: "UNEMPLOYED",
      desc: "National database registration with ₹2 Lakh accidental insurance and universal social security.",
      tag: "Financial Support",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Unorganized sector workers, gig workers, and job seekers aged 16-59.",
      info_required: "Demographic KYC Token, Primary Occupation Preference.",
      required_systems: ["Employment System", "Identity System"]
    },
    {
      service_id: "S206",
      service_name: "Model Career Center Skill Counseling",
      dept: "National Career Service",
      category: "UNEMPLOYED",
      desc: "Free psychometric assessment, expert career counseling, and job fair registration passes.",
      tag: "Job Opportunities",
      badgeStyle: "background: #F1F5F9; color: #0F1D36;",
      eligibility: "Any registered citizen looking for career guidance or job transitions.",
      info_required: "Basic Profile Details, Academic Summary.",
      required_systems: ["Employment System", "Identity System"]
    }
  ],

  // COMMON SERVICES
  common: [
    {
      service_id: "S301",
      service_name: "DigiLocker Citizen Document Vault",
      dept: "Ministry of Electronics & IT (MeitY)",
      category: "COMMON",
      desc: "Legally valid digital wallet for Aadhaar, Driving License, Vehicle RC, and Marksheets.",
      tag: "Documents",
      badgeStyle: "background: #EDE9FE; color: #5B21B6;",
      eligibility: "Universal citizen access for all verified Indian residents.",
      info_required: "Citizen Demographic Consent Token.",
      required_systems: ["Identity System", "Education System"]
    },
    {
      service_id: "S302",
      service_name: "CPGRAMS Central Grievance Redressal",
      dept: "Dept of Administrative Reforms",
      category: "COMMON",
      desc: "Direct online lodging and time-bound priority resolution of citizen grievances against ministries.",
      tag: "Grievances",
      badgeStyle: "background: #FFEDD5; color: #9A3412;",
      eligibility: "Universal access for all citizens to lodge grievances with central & state departments.",
      info_required: "Grievance Category, Ministry / Dept, Incident Summary.",
      required_systems: ["Identity System", "Employment System"]
    },
    {
      service_id: "S303",
      service_name: "Voters' Service Portal (ECI)",
      dept: "Election Commission of India",
      category: "COMMON",
      desc: "Voter card registration (Form 6), digital e-EPIC download, and polling booth search.",
      tag: "Certificates & Rights",
      badgeStyle: "background: #DBEAFE; color: #1E40AF;",
      eligibility: "Indian citizens aged 18 years and above.",
      info_required: "Age Verification Token, Residential State & District.",
      required_systems: ["Identity System"]
    },
    {
      service_id: "S304",
      service_name: "Passport Seva Online Portal",
      dept: "Ministry of External Affairs",
      category: "COMMON",
      desc: "Online appointment booking, automated police verification tracker, and Tatkaal passport issuance.",
      tag: "Certificates & Travel",
      badgeStyle: "background: #DCFCE7; color: #166534;",
      eligibility: "Indian citizens applying for new or renewal passport.",
      info_required: "Identity & Address Proof Verification, Date of Birth Proof.",
      required_systems: ["Identity System"]
    },
    {
      service_id: "S305",
      service_name: "Parivahan Sarathi & Vahan Services",
      dept: "Ministry of Road Transport & Highways",
      category: "COMMON",
      desc: "Driving license renewal, international driving permits, and vehicle fitness records.",
      tag: "General Government Services",
      badgeStyle: "background: #F1F5F9; color: #0F1D36;",
      eligibility: "Vehicle owners and driving license holders across all states/UTs.",
      info_required: "State / RTO Location Token, Identity Verification.",
      required_systems: ["Identity System"]
    },
    {
      service_id: "S306",
      service_name: "Unified Mobile Application (UMANG)",
      dept: "Digital India Corporation",
      category: "COMMON",
      desc: "Single unified access point for 1,200+ central and state government citizen utility services.",
      tag: "Application Tracking",
      badgeStyle: "background: #EDE9FE; color: #5B21B6;",
      eligibility: "Universal access for all Indian citizens.",
      info_required: "Citizen Single Sign-On Consent Token.",
      required_systems: ["Identity System", "Employment System", "Income System"]
    }
  ]
};

// Category Meta Mapping
const CATEGORY_META = {
  student: {
    label: "Students Pathway",
    icon: "🎓",
    color: "#EAF3FC",
    step2Name: "Education Details",
    badgeRecommended: "Recommended for Students"
  },
  employed: {
    label: "Employed Pathway",
    icon: "💼",
    color: "#FEF1E8",
    step2Name: "Employment Details",
    badgeRecommended: "Recommended for Workforce"
  },
  unemployed: {
    label: "Unemployed Pathway",
    icon: "🔍",
    color: "#ECF7F0",
    step2Name: "Career & Employment",
    badgeRecommended: "Recommended for Job Seekers"
  },
  common: {
    label: "Common Citizen Pathway",
    icon: "👥",
    color: "#F4EFFF",
    step2Name: "Common Services",
    badgeRecommended: "Universal Citizen Services"
  }
};

// ============================================================================
// 3. Application State
// ============================================================================
let AppState = {
  activeCategory: localStorage.getItem("oneg_active_category") || "student",
  currentStep: 1,
  citizenProfile: JSON.parse(localStorage.getItem("oneg_citizen_profile") || "null") || {
    fullName: "Aarav Sharma",
    dob: "2002-05-14",
    mobile: "9876543210",
    email: "aarav.sharma@example.gov.in",
    state: "Delhi",
    district: "Central Delhi",
    pincode: "110001"
  },
  activeServiceForConsent: null,
  activeApplicationSimulation: null
};

// ============================================================================
// 4. Initialization & Event Listeners
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Page Elements
  const pageCategory = document.getElementById("page-category");
  const pageProfile = document.getElementById("page-profile");
  const pageDashboard = document.getElementById("page-dashboard");
  const brandLogo = document.getElementById("nav-brand-logo");
  const globalStepperPill = document.getElementById("global-stepper-pill");
  const stepIndicatorBadge = document.getElementById("step-indicator-badge");

  // Category Cards
  const categoryCards = document.querySelectorAll(".cat-card");
  const viewAllTrigger = document.getElementById("view-all-trigger");

  // Profile Form Elements
  const formStep1 = document.getElementById("form-step-1");
  const formStep2 = document.getElementById("form-step-2");
  const stepNode1 = document.getElementById("step-node-1");
  const stepNode2 = document.getElementById("step-node-2");
  const stepNode3 = document.getElementById("step-node-3");
  const stepConnector1 = document.getElementById("step-connector-1");
  const stepConnector2 = document.getElementById("step-connector-2");
  const step2Label = document.getElementById("step-2-label");
  const profileCatPill = document.getElementById("profile-cat-pill");
  const pillIcon = document.getElementById("pill-icon");
  const pillText = document.getElementById("pill-text");

  const btnStep1Continue = document.getElementById("btn-step-1-continue");
  const btnBackToCategory = document.getElementById("btn-back-to-category");
  const btnBackToStep1 = document.getElementById("btn-back-to-step-1");
  const btnDemoFill = document.getElementById("btn-demo-fill");
  const citizenProfileForm = document.getElementById("citizen-profile-form");

  // Category Form Blocks
  const catBlockStudent = document.getElementById("cat-block-student");
  const catBlockEmployed = document.getElementById("cat-block-employed");
  const catBlockUnemployed = document.getElementById("cat-block-unemployed");
  const catBlockCommon = document.getElementById("cat-block-common");

  // Dashboard Elements
  const dashCitizenName = document.getElementById("dash-citizen-name");
  const dashCitizenSubline = document.getElementById("dash-citizen-subline");
  const dashAvatar = document.getElementById("dash-avatar");
  const dashServicesBadge = document.getElementById("dash-services-badge");
  const dashServicesContainer = document.getElementById("dash-services-container");
  const dashEditProfileBtn = document.getElementById("dash-edit-profile-btn");
  const dashChangeCategoryBtn = document.getElementById("dash-change-category-btn");

  // Service Details Modal Elements
  const serviceDetailsModal = document.getElementById("service-details-modal");
  const btnCloseDetail = document.getElementById("btn-close-detail");
  const btnCancelDetail = document.getElementById("btn-cancel-detail");
  const detailModalBackdrop = document.getElementById("detail-modal-backdrop");
  const btnConsentApply = document.getElementById("btn-consent-apply");

  // Application Tracker Modal Elements
  const trackerModal = document.getElementById("app-tracker-modal");
  const btnCloseTracker = document.getElementById("btn-close-tracker");
  const btnCancelTracker = document.getElementById("btn-cancel-tracker");
  const trackerBackdrop = document.getElementById("tracker-modal-backdrop");
  const btnAdvanceSimulation = document.getElementById("btn-advance-simulation");

  // Transition Loader
  const loaderOverlay = document.getElementById("transition-loader");
  const loaderMessage = document.getElementById("loader-message");

  // Language and Help
  const langToggle = document.getElementById("lang-toggle");
  const helpBtn = document.getElementById("help-btn");

  // --------------------------------------------------------------------------
  // Navigation Router Helper
  // --------------------------------------------------------------------------
  function navigateTo(targetPageId) {
    [pageCategory, pageProfile, pageDashboard].forEach((page) => {
      if (page) page.classList.remove("active");
    });

    const target = document.getElementById(targetPageId);
    if (target) {
      target.classList.add("active");
      window.scrollTo(0, 0);
    }

    // Update Global Stepper Pill (Step 1 to 4 Journey)
    if (globalStepperPill && stepIndicatorBadge) {
      globalStepperPill.style.display = "block";
      if (targetPageId === "page-category") {
        stepIndicatorBadge.textContent = "Step 1 of 4: Category";
      } else if (targetPageId === "page-profile") {
        stepIndicatorBadge.textContent = AppState.currentStep === 1 
          ? "Step 2 of 4: Profile (Basic)" 
          : "Step 2 of 4: Profile (Category Details)";
      } else if (targetPageId === "page-dashboard") {
        stepIndicatorBadge.textContent = "Step 3 of 4: Services";
      }
    }
  }

  function showLoadingTransition(message, callback) {
    loaderMessage.textContent = message;
    loaderOverlay.classList.add("active");
    loaderOverlay.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      loaderOverlay.classList.remove("active");
      loaderOverlay.setAttribute("aria-hidden", "true");
      if (callback) callback();
    }, 320);
  }

  // --------------------------------------------------------------------------
  // PAGE 1: Category Selection Handler
  // --------------------------------------------------------------------------
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const cat = card.getAttribute("data-category");
      selectCategory(cat);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const cat = card.getAttribute("data-category");
        selectCategory(cat);
      }
    });
  });

  if (viewAllTrigger) {
    viewAllTrigger.addEventListener("click", () => {
      selectCategory("common");
    });
  }

  if (brandLogo) {
    brandLogo.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("page-category");
    });
  }

  function selectCategory(catKey) {
    AppState.activeCategory = catKey;
    localStorage.setItem("oneg_active_category", catKey);

    const meta = CATEGORY_META[catKey] || CATEGORY_META.student;

    showLoadingTransition(`Connecting to ${meta.label}...`, () => {
      setupProfileFormForCategory(catKey);
      setFormStep(1);
      navigateTo("page-profile");
      showToast(`Selected: ${meta.label}`);
    });
  }

  // --------------------------------------------------------------------------
  // PAGE 2: Progressive Profile Form Setup & Navigation
  // --------------------------------------------------------------------------
  function setupProfileFormForCategory(catKey) {
    const meta = CATEGORY_META[catKey] || CATEGORY_META.student;

    // Update Stepper Label
    step2Label.textContent = meta.step2Name;
    pillIcon.textContent = meta.icon;
    pillText.textContent = meta.label;
    profileCatPill.style.background = meta.color;

    // Toggle Category Specific Blocks
    if (catBlockStudent) catBlockStudent.style.display = catKey === "student" ? "block" : "none";
    if (catBlockEmployed) catBlockEmployed.style.display = catKey === "employed" ? "block" : "none";
    if (catBlockUnemployed) catBlockUnemployed.style.display = catKey === "unemployed" ? "block" : "none";
    if (catBlockCommon) catBlockCommon.style.display = catKey === "common" ? "block" : "none";

    // Auto-fill existing profile if available
    if (AppState.citizenProfile) {
      populateProfileForm(AppState.citizenProfile);
    }
  }

  function setFormStep(stepNumber) {
    AppState.currentStep = stepNumber;

    if (stepNumber === 1) {
      formStep1.classList.add("active");
      formStep2.classList.remove("active");

      stepNode1.className = "step-node active";
      stepNode2.className = "step-node";
      stepNode3.className = "step-node";
      stepConnector1.className = "step-connector";
      stepConnector2.className = "step-connector";

      if (stepIndicatorBadge) stepIndicatorBadge.textContent = "Step 2 of 4: Profile (Basic Details)";
    } else if (stepNumber === 2) {
      formStep1.classList.remove("active");
      formStep2.classList.add("active");

      stepNode1.className = "step-node completed";
      stepNode2.className = "step-node active";
      stepNode3.className = "step-node";
      stepConnector1.className = "step-connector active";
      stepConnector2.className = "step-connector";

      if (stepIndicatorBadge) stepIndicatorBadge.textContent = "Step 2 of 4: Profile (Category Details)";
    }
  }

  // Step 1 Validation (Basic Details)
  function validateStep1() {
    let isValid = true;
    const name = document.getElementById("input-fullname");
    const dob = document.getElementById("input-dob");
    const mobile = document.getElementById("input-mobile");
    const email = document.getElementById("input-email");
    const state = document.getElementById("input-state");
    const district = document.getElementById("input-district");
    const pincode = document.getElementById("input-pincode");

    // Clear previous errors
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));

    if (!name.value.trim()) {
      document.getElementById("err-fullname").textContent = "Please enter your full name.";
      isValid = false;
    }
    if (!dob.value) {
      document.getElementById("err-dob").textContent = "Please select your date of birth.";
      isValid = false;
    }
    if (!mobile.value.match(/^[6-9]\d{9}$/)) {
      document.getElementById("err-mobile").textContent = "Enter a valid 10-digit mobile number.";
      isValid = false;
    }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      document.getElementById("err-email").textContent = "Enter a valid email address.";
      isValid = false;
    }
    if (!state.value) {
      document.getElementById("err-state").textContent = "Please select your state/UT.";
      isValid = false;
    }
    if (!district.value.trim()) {
      document.getElementById("err-district").textContent = "Please enter your district.";
      isValid = false;
    }
    if (!pincode.value.match(/^\d{6}$/)) {
      document.getElementById("err-pincode").textContent = "Enter a valid 6-digit postal pincode.";
      isValid = false;
    }

    return isValid;
  }

  // Step 2 Validation (Category-Specific Details)
  function validateStep2() {
    const cat = AppState.activeCategory;
    let isValid = true;

    // Clear previous step 2 errors
    document.querySelectorAll("#form-step-2 .field-error").forEach((el) => (el.textContent = ""));

    if (cat === "student") {
      const eduLevel = document.getElementById("stud-edu-level");
      const course = document.getElementById("stud-course");
      const college = document.getElementById("stud-college");

      if (!eduLevel.value) {
        document.getElementById("err-stud-level").textContent = "Please select your education level.";
        isValid = false;
      }
      if (!course.value.trim()) {
        document.getElementById("err-stud-course").textContent = "Please enter your degree/course name.";
        isValid = false;
      }
      if (!college.value.trim()) {
        document.getElementById("err-stud-college").textContent = "Please enter your college/institution.";
        isValid = false;
      }
    } else if (cat === "employed") {
      const status = document.getElementById("emp-status");
      const empType = document.getElementById("emp-type");
      const role = document.getElementById("emp-role");
      const qual = document.getElementById("emp-qual");

      if (!status.value) {
        document.getElementById("err-emp-status").textContent = "Please select your employment status.";
        isValid = false;
      }
      if (!empType.value) {
        document.getElementById("err-emp-type").textContent = "Please select your employment type.";
        isValid = false;
      }
      if (!role.value.trim()) {
        document.getElementById("err-emp-role").textContent = "Please enter your job role.";
        isValid = false;
      }
      if (!qual.value.trim()) {
        document.getElementById("err-emp-qual").textContent = "Please enter your highest qualification.";
        isValid = false;
      }
    } else if (cat === "unemployed") {
      const qual = document.getElementById("unemp-qual");
      if (!qual.value) {
        document.getElementById("err-unemp-qual").textContent = "Please select your highest qualification.";
        isValid = false;
      }
    }

    return isValid;
  }

  // Step 1 Continue Click
  btnStep1Continue.addEventListener("click", () => {
    if (validateStep1()) {
      setFormStep(2);
    } else {
      showToast("Please complete the required basic details.");
    }
  });

  // Step Back Buttons
  btnBackToCategory.addEventListener("click", () => {
    navigateTo("page-category");
  });

  btnBackToStep1.addEventListener("click", () => {
    setFormStep(1);
  });

  // Auto-Fill Demo Profile
  btnDemoFill.addEventListener("click", () => {
    autoFillDemoData();
    showToast("Loaded verified demo citizen profile!");
  });

  function autoFillDemoData() {
    const cat = AppState.activeCategory;

    // Common basic fields
    document.getElementById("input-fullname").value = "Aarav Sharma";
    document.getElementById("input-dob").value = "2002-05-14";
    document.getElementById("input-mobile").value = "9876543210";
    document.getElementById("input-email").value = "aarav.sharma@example.gov.in";
    document.getElementById("input-state").value = "Delhi";
    document.getElementById("input-district").value = "Central Delhi";
    document.getElementById("input-pincode").value = "110001";

    // Category fields
    if (cat === "student") {
      document.getElementById("stud-edu-level").value = "Undergraduate";
      document.getElementById("stud-course").value = "B.Tech Computer Science";
      document.getElementById("stud-specialization").value = "Artificial Intelligence & Data Systems";
      document.getElementById("stud-college").value = "Delhi Technological University (DTU)";
      document.getElementById("stud-year").value = "3rd Year";
      document.getElementById("stud-grad-year").value = "2027";
      document.getElementById("stud-skills").value = "Python, Web Technologies, Machine Learning";
      document.getElementById("stud-interests").value = "Autonomous Systems, Cloud Technologies";
      document.getElementById("stud-income").value = "Below ₹2.5 Lakhs";
    } else if (cat === "employed") {
      document.getElementById("emp-status").value = "Employed Full-Time";
      document.getElementById("emp-type").value = "Private";
      document.getElementById("emp-role").value = "Senior Software Development Engineer";
      document.getElementById("emp-industry").value = "Information Technology";
      document.getElementById("emp-exp").value = "3-5 Years";
      document.getElementById("emp-qual").value = "B.Tech Computer Science";
      document.getElementById("emp-skills").value = "Cloud Infrastructure, Distributed Systems";
      document.getElementById("emp-interests").value = "System Architecture, Enterprise Scale";
      document.getElementById("emp-income").value = "₹7 Lakhs - ₹15 Lakhs";
    } else if (cat === "unemployed") {
      document.getElementById("unemp-qual").value = "Graduate";
      document.getElementById("unemp-course").value = "B.Sc Electronics & Communications";
      document.getElementById("unemp-skills").value = "Technical Troubleshooting, Python, Hardware Maintenance";
      document.getElementById("unemp-exp").value = "Fresher";
      document.getElementById("unemp-prev-role").value = "Intern at Tech Solutions";
      document.getElementById("unemp-pref-role").value = "Junior Systems Support Specialist";
      document.getElementById("unemp-location").value = "Delhi NCR / Remote";
      document.getElementById("unemp-job-type").value = "Full-Time";
      document.getElementById("unemp-training").value = "PMKVY IT & Digital Skills";
      document.getElementById("unemp-income").value = "Entry Level (< ₹3 Lakhs)";
    }
  }

  function populateProfileForm(data) {
    if (!data) return;
    if (data.fullName) document.getElementById("input-fullname").value = data.fullName;
    if (data.dob) document.getElementById("input-dob").value = data.dob;
    if (data.mobile) document.getElementById("input-mobile").value = data.mobile;
    if (data.email) document.getElementById("input-email").value = data.email;
    if (data.state) document.getElementById("input-state").value = data.state;
    if (data.district) document.getElementById("input-district").value = data.district;
    if (data.pincode) document.getElementById("input-pincode").value = data.pincode;
  }

  // Profile Form Submit Handler
  citizenProfileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateStep1() && validateStep2()) {
      submitFinalProfile();
    } else {
      showToast("Please fill in the required fields highlighted in red.");
    }
  });

  async function submitFinalProfile() {
    const cat = AppState.activeCategory;

    // Gather Full Citizen Profile
    const profile = {
      fullName: document.getElementById("input-fullname").value.trim() || "Aarav Sharma",
      dob: document.getElementById("input-dob").value || "2002-05-14",
      mobile: document.getElementById("input-mobile").value.trim() || "9876543210",
      email: document.getElementById("input-email").value.trim() || "aarav.sharma@example.gov.in",
      state: document.getElementById("input-state").value || "Delhi",
      district: document.getElementById("input-district").value.trim() || "Central Delhi",
      pincode: document.getElementById("input-pincode").value.trim() || "110001",
      category: cat
    };

    // Gather Category-Specific details
    if (cat === "student") {
      profile.categoryDetails = {
        educationLevel: document.getElementById("stud-edu-level").value,
        degreeCourse: document.getElementById("stud-course").value.trim(),
        specialization: document.getElementById("stud-specialization").value.trim(),
        collegeInstitution: document.getElementById("stud-college").value.trim(),
        studyYear: document.getElementById("stud-year").value,
        gradYear: document.getElementById("stud-grad-year").value,
        skills: document.getElementById("stud-skills").value.trim(),
        interests: document.getElementById("stud-interests").value.trim(),
        familyIncome: document.getElementById("stud-income").value
      };
    } else if (cat === "employed") {
      profile.categoryDetails = {
        employmentStatus: document.getElementById("emp-status").value,
        employmentType: document.getElementById("emp-type").value,
        jobRole: document.getElementById("emp-role").value.trim(),
        industry: document.getElementById("emp-industry").value,
        yearsExperience: document.getElementById("emp-exp").value,
        highestQualification: document.getElementById("emp-qual").value.trim(),
        skills: document.getElementById("emp-skills").value.trim(),
        interests: document.getElementById("emp-interests").value.trim(),
        incomeRange: document.getElementById("emp-income").value
      };
    } else if (cat === "unemployed") {
      profile.categoryDetails = {
        highestQualification: document.getElementById("unemp-qual").value,
        degreeCourse: document.getElementById("unemp-course").value.trim(),
        skills: document.getElementById("unemp-skills").value.trim(),
        yearsExperience: document.getElementById("unemp-exp").value,
        previousRole: document.getElementById("unemp-prev-role").value.trim(),
        preferredRole: document.getElementById("unemp-pref-role").value.trim(),
        preferredLocation: document.getElementById("unemp-location").value.trim(),
        preferredJobType: document.getElementById("unemp-job-type").value,
        trainingInterest: document.getElementById("unemp-training").value,
        expectedIncome: document.getElementById("unemp-income").value
      };
    }

    AppState.citizenProfile = profile;
    await ONEGOV_API.saveProfile(profile);

    showLoadingTransition("Matching eligible government schemes via Interoperability Gateway...", () => {
      showServices();
      navigateTo("page-dashboard");
      showToast("Profile connected! Personalized services ready.");
    });
  }

  // --------------------------------------------------------------------------
  // PAGE 3: Services For You View
  // --------------------------------------------------------------------------
  async function showServices() {
    const profile = AppState.citizenProfile || { fullName: "Aarav Sharma", state: "Delhi", district: "Central Delhi" };
    const cat = AppState.activeCategory || "student";
    const meta = CATEGORY_META[cat] || CATEGORY_META.student;

    // Update Citizen Meta Banner
    dashCitizenName.textContent = profile.fullName;
    const initials = profile.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    dashAvatar.textContent = initials || "AS";
    dashCitizenSubline.textContent = `${meta.label} • ${profile.district}, ${profile.state} • Interoperability ID: IND-${Math.floor(1000 + Math.random() * 9000)}`;
    dashServicesBadge.textContent = meta.badgeRecommended;

    // Fetch Services via API Client
    const res = await ONEGOV_API.getServices(cat);
    const services = res.services || [];

    // Render Dynamic Services Cards
    dashServicesContainer.innerHTML = services
      .map((srv) => {
        return `
          <div class="dash-service-card" data-service-id="${srv.service_id}">
            <div>
              <div class="card-top-meta">
                <span class="dept-badge">${srv.dept}</span>
                <span class="scheme-tag" style="${srv.badgeStyle}">${srv.tag}</span>
              </div>
              <h4 class="service-card-title">${srv.service_name}</h4>
              <p class="service-card-desc">${srv.desc}</p>
            </div>
            <div class="service-card-footer">
              <span class="api-verified-pill">⚡ Instant API Check</span>
              <button type="button" class="btn-view-service" onclick="showServiceDetails('${srv.service_id}')">
                <span>View Service</span>
                <span>→</span>
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Quick Action Buttons
  dashEditProfileBtn.addEventListener("click", () => {
    setFormStep(1);
    navigateTo("page-profile");
  });

  dashChangeCategoryBtn.addEventListener("click", () => {
    navigateTo("page-category");
  });

  // --------------------------------------------------------------------------
  // STAGE 4.1: SERVICE DETAILS & CONSENT MODAL
  // --------------------------------------------------------------------------
  window.showServiceDetails = async function (serviceId) {
    const res = await ONEGOV_API.getServiceDetails(serviceId);
    if (!res.success) return;

    const srv = res.service;
    AppState.activeServiceForConsent = srv;

    // Populate Modal Elements
    document.getElementById("detail-modal-title").textContent = srv.service_name;
    document.getElementById("detail-service-dept").textContent = srv.dept;
    document.getElementById("detail-service-tag").textContent = srv.tag;
    document.getElementById("detail-service-tag").style = srv.badgeStyle;
    document.getElementById("detail-service-desc").textContent = srv.desc;
    document.getElementById("detail-service-eligibility").textContent = srv.eligibility || "Standard eligibility verified automatically via connected state databases.";
    document.getElementById("detail-service-info-req").textContent = srv.info_required || "Demographic verification token and qualification certificates.";

    const catMeta = CATEGORY_META[srv.category.toLowerCase()] || CATEGORY_META.student;
    document.getElementById("detail-service-cat").textContent = `${catMeta.label} • Interoperability Service (${srv.service_id})`;

    // Render Government Systems Involved
    const systemsContainer = document.getElementById("detail-systems-container");
    const allKnownSystems = ["Identity System", "Education System", "Income System", "Employment System", "Skill System"];
    
    systemsContainer.innerHTML = allKnownSystems
      .map((sys) => {
        const isRequired = srv.required_systems && srv.required_systems.includes(sys);
        if (isRequired) {
          return `<span class="system-chip">✓ ${sys}</span>`;
        } else {
          return `<span class="system-chip system-chip-inactive">○ ${sys}</span>`;
        }
      })
      .join("");

    // Update global stepper pill
    if (stepIndicatorBadge) stepIndicatorBadge.textContent = "Step 4 of 4: Service Details & Consent";

    // Show Details Modal
    serviceDetailsModal.classList.add("active");
    serviceDetailsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  function closeServiceDetails() {
    serviceDetailsModal.classList.remove("active");
    serviceDetailsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (stepIndicatorBadge) stepIndicatorBadge.textContent = "Step 3 of 4: Services";
  }

  // Close buttons for details modal
  btnCloseDetail.addEventListener("click", closeServiceDetails);
  btnCancelDetail.addEventListener("click", closeServiceDetails);
  detailModalBackdrop.addEventListener("click", closeServiceDetails);

  // Give Consent & Apply Handler
  btnConsentApply.addEventListener("click", async () => {
    if (!AppState.activeServiceForConsent) return;
    const srv = AppState.activeServiceForConsent;

    // Record citizen consent
    await ONEGOV_API.grantConsent(srv.service_id, AppState.citizenProfile?.userId || "CITIZEN-DEMO", srv.required_systems);

    // Close Details Modal
    closeServiceDetails();

    // Open Live Multi-Department Application Tracker
    openApplicationTracker(srv.service_id, srv.service_name, srv.dept);
    showToast(`Consent granted for ${srv.service_name}! Initiating API Gateway check.`);
  });

  // --------------------------------------------------------------------------
  // STAGE 4.2: UNIFIED APPLICATION TRACKER FLOW MODAL
  // --------------------------------------------------------------------------
  window.openApplicationTracker = async function (serviceId, serviceName, serviceDept) {
    document.getElementById("tracker-modal-title").textContent = serviceName;
    document.getElementById("tracker-service-dept").textContent = serviceDept;

    // Generate Unified Ref ID via API Client
    const appResponse = await ONEGOV_API.saveApplication(serviceId, AppState.citizenProfile);
    document.getElementById("tracker-ref-id").textContent = appResponse.refId;
    document.getElementById("tracker-overall-status").textContent = "In Verification";
    document.getElementById("tracker-overall-status").className = "app-status-tag";
    document.getElementById("tracker-overall-status").style = "";

    // Reset Stages to Default State
    resetTrackerStages();

    AppState.activeApplicationSimulation = {
      serviceId,
      serviceName,
      currentStep: 3, // Step 1 and 2 are verified instantly via DigiLocker / ABC / Identity
      maxSteps: 5
    };

    if (stepIndicatorBadge) stepIndicatorBadge.textContent = "Step 4 of 4: Application Tracking";

    trackerModal.classList.add("active");
    trackerModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  function closeApplicationTracker() {
    trackerModal.classList.remove("active");
    trackerModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (stepIndicatorBadge) stepIndicatorBadge.textContent = "Step 3 of 4: Services";
  }

  function resetTrackerStages() {
    // Stage 1
    const s1 = document.getElementById("v-stage-1");
    s1.className = "v-stage stage-completed";

    // Stage 2
    const s2 = document.getElementById("v-stage-2");
    s2.className = "v-stage stage-completed";

    // Stage 3
    const s3 = document.getElementById("v-stage-3");
    s3.className = "v-stage stage-progress";
    document.getElementById("v-badge-3").className = "v-status-badge badge-amber";
    document.getElementById("v-badge-3").textContent = "⏳ In Progress (CBDT Gateway)";

    // Stage 4
    const s4 = document.getElementById("v-stage-4");
    s4.className = "v-stage stage-pending";
    document.getElementById("v-badge-4").className = "v-status-badge badge-gray";
    document.getElementById("v-badge-4").textContent = "○ Pending Verification";

    // Stage 5
    const s5 = document.getElementById("v-stage-5");
    s5.className = "v-stage stage-pending";
    document.getElementById("v-badge-5").className = "v-status-badge badge-gray";
    document.getElementById("v-badge-5").textContent = "○ Final Submission";

    btnAdvanceSimulation.disabled = false;
    btnAdvanceSimulation.textContent = "Simulate Next Verification Step ⚡";
  }

  // Interactive Stage Simulation Advance
  btnAdvanceSimulation.addEventListener("click", () => {
    if (!AppState.activeApplicationSimulation) return;

    const sim = AppState.activeApplicationSimulation;

    if (sim.currentStep === 3) {
      // Complete Stage 3 -> Move to Stage 4
      const s3 = document.getElementById("v-stage-3");
      s3.className = "v-stage stage-completed";
      s3.querySelector(".v-stage-icon").textContent = "✓";
      const b3 = document.getElementById("v-badge-3");
      b3.className = "v-status-badge badge-green";
      b3.textContent = "✓ Income Record Verified";

      const s4 = document.getElementById("v-stage-4");
      s4.className = "v-stage stage-progress";
      s4.querySelector(".v-stage-icon").textContent = "⏳";
      const b4 = document.getElementById("v-badge-4");
      b4.className = "v-status-badge badge-amber";
      b4.textContent = "⏳ Checking Scheme Rules Engine...";

      sim.currentStep = 4;
      showToast("Income verification completed via CBDT Gateway!");
    } else if (sim.currentStep === 4) {
      // Complete Stage 4 -> Move to Stage 5
      const s4 = document.getElementById("v-stage-4");
      s4.className = "v-stage stage-completed";
      s4.querySelector(".v-stage-icon").textContent = "✓";
      const b4 = document.getElementById("v-badge-4");
      b4.className = "v-status-badge badge-green";
      b4.textContent = "✓ 100% Eligible (All Criteria Met)";

      const s5 = document.getElementById("v-stage-5");
      s5.className = "v-stage stage-completed";
      s5.querySelector(".v-stage-icon").textContent = "✓";
      const b5 = document.getElementById("v-badge-5");
      b5.className = "v-status-badge badge-green";
      b5.textContent = "✓ Application Successfully Submitted";

      document.getElementById("tracker-overall-status").textContent = "Approved & Submitted";
      document.getElementById("tracker-overall-status").style.background = "#DCFCE7";
      document.getElementById("tracker-overall-status").style.color = "#166534";

      btnAdvanceSimulation.disabled = true;
      btnAdvanceSimulation.textContent = "✓ Application Completed";

      sim.currentStep = 5;
      showToast("Unified Application Submitted across all participating Ministries!");
    }
  });

  // Modal Close Events
  btnCloseTracker.addEventListener("click", closeApplicationTracker);
  btnCancelTracker.addEventListener("click", closeApplicationTracker);
  trackerBackdrop.addEventListener("click", closeApplicationTracker);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (trackerModal.classList.contains("active")) {
        closeApplicationTracker();
      }
      if (serviceDetailsModal.classList.contains("active")) {
        closeServiceDetails();
      }
    }
  });

  // Language & Help Interactions
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

  // Initial step indicator setup
  if (stepIndicatorBadge) {
    stepIndicatorBadge.textContent = "Step 1 of 4: Category";
  }
});

// ============================================================================
// 5. Toast Notification Manager
// ============================================================================
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
  }, 3200);
}
