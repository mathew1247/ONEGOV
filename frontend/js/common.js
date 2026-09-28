/**
 * ONEGOV — Common Utility & Data Storage Layer (common.js)
 * Provides reusable localStorage abstractions, data schemas,
 * navigation helpers, and seed defaults.
 */

// 1. Data Storage Helpers (Future FastAPI API drop-in ready)
function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error saving data for key "${key}":`, e);
    return false;
  }
}

function getData(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading data for key "${key}":`, e);
    return defaultValue;
  }
}

function removeData(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing key "${key}":`, e);
    return false;
  }
}

function redirectTo(url) {
  window.location.href = url;
}

function getCurrentCategory() {
  return getData("category", "student");
}

function getCurrentUser() {
  const profile = getData("userProfile", null);
  if (profile && profile.basic && profile.basic.name) {
    return profile;
  }
  return {
    category: "student",
    basic: {
      name: "Jack Mathew",
      dob: "2003-05-14",
      mobile: "+91 98765 43210",
      email: "jack.mathew@demo.onegov.in",
      state: "Tamil Nadu",
      district: "Chennai",
      pincode: "600025"
    },
    education: {
      degree: "B.Tech Computer Science",
      specialization: "Artificial Intelligence & Systems",
      institution: "Anna University Campus",
      studyYear: "Final Year (4th Year)",
      graduationYear: "2026",
      skills: ["Python", "Cloud Architecture", "Data Structures"],
      interests: ["Cybersecurity", "Public Digital Goods"],
      incomeRange: "₹2,50,000 - ₹5,00,000 / annum"
    }
  };
}

function generateApplicationId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ONE-2026-${randomNum}`;
}

// 2. Default Configuration & Seed Data
const SERVICES_CATALOG = [
  // Student Services
  {
    id: "scholarship-nsp",
    name: "Scholarship Assistance (NSP)",
    category: "student",
    icon: "🎓",
    shortDesc: "National merit & pre-matric financial scholarship disbursed directly through interoperable verification.",
    requiredSystems: ["Education System", "Income Verification System", "Identity Verification System"],
    systemCodes: ["education", "income", "identity"],
    eligibility: "Enrolled in recognized university with family annual income below ₹6,00,000.",
    requiredInfo: ["Basic Profile", "Academic Enrolment & Marks", "Income Bracket Declaration"],
    processingTime: "Instant Verification (< 3 seconds)"
  },
  {
    id: "education-loan",
    name: "Education Loan Subsidy",
    category: "student",
    icon: "🏦",
    shortDesc: "Interest subsidy verification for higher education loans via National Student Registry.",
    requiredSystems: ["Education System", "Banking Verification", "Identity Verification System"],
    systemCodes: ["education", "banking", "identity"],
    eligibility: "Active admission offer from accredited institute.",
    requiredInfo: ["Admission Enrolment Number", "Course Fee Estimate"],
    processingTime: "1-2 Business Days"
  },
  {
    id: "skill-development",
    name: "National Skill Development (PMKVY)",
    category: "student",
    icon: "⚡",
    shortDesc: "Free certified vocational & digital tech skills training courses with stipend.",
    requiredSystems: ["Education System", "Skill Registry", "Identity Verification System"],
    systemCodes: ["education", "skills", "identity"],
    eligibility: "Youth aged 18-28 seeking certified technical credentials.",
    requiredInfo: ["Basic Demographic Profile", "Area of Skill Interest"],
    processingTime: "Instant Enrollment"
  },
  {
    id: "internship-scheme",
    name: "Government Internship Opportunities",
    category: "student",
    icon: "💼",
    shortDesc: "Direct placement with central/state public agencies and research institutions.",
    requiredSystems: ["Education System", "Employment Exchange", "Identity Verification System"],
    systemCodes: ["education", "employment", "identity"],
    eligibility: "Pre-final and final year undergraduate students.",
    requiredInfo: ["Degree Transcripts", "Skills Portfolio"],
    processingTime: "3-5 Business Days"
  },
  {
    id: "training-programs",
    name: "AI & Emerging Tech Training",
    category: "student",
    icon: "💻",
    shortDesc: "Subsidized cloud computing, cyber defense, and AI certification pathways.",
    requiredSystems: ["Education System", "Skill Registry"],
    systemCodes: ["education", "skills"],
    eligibility: "Engineering and science students with basic coding aptitude.",
    requiredInfo: ["College Verification", "Technical Specialization"],
    processingTime: "Instant Access"
  },

  // Employed Services
  {
    id: "employee-welfare",
    name: "Employee Welfare & EPF Linked Subsidy",
    category: "employed",
    icon: "🏢",
    shortDesc: "Workplace health benefits, insurance coverage, and provident fund verification.",
    requiredSystems: ["Employment System", "EPFO Registry", "Identity Verification System"],
    systemCodes: ["employment", "epfo", "identity"],
    eligibility: "Active organized or gig sector worker with valid employment record.",
    requiredInfo: ["UAN/EPF Account Status", "Employer Information"],
    processingTime: "Instant Interoperability"
  },
  {
    id: "skill-upskilling",
    name: "Executive Skill Upskilling Grant",
    category: "employed",
    icon: "📈",
    shortDesc: "Reimbursement grants for recognized corporate certifications and management courses.",
    requiredSystems: ["Employment System", "Income Verification System", "Skill Registry"],
    systemCodes: ["employment", "income", "skills"],
    eligibility: "Minimum 1 year active working experience.",
    requiredInfo: ["Current Job Role", "Target Course Accreditation"],
    processingTime: "2-3 Business Days"
  },
  {
    id: "entrepreneurship-support",
    name: "Startup & MSME Venture Support",
    category: "employed",
    icon: "🚀",
    shortDesc: "Single-window clearance and seed grant eligibility for emerging business founders.",
    requiredSystems: ["Commerce Registry", "Banking Verification", "Identity Verification System"],
    systemCodes: ["commerce", "banking", "identity"],
    eligibility: "Registered MSME or provisional startup declaration.",
    requiredInfo: ["Business Entity Details", "Director KYC"],
    processingTime: "1-3 Business Days"
  },
  {
    id: "govt-benefits",
    name: "Housing & Healthcare Worker Benefit",
    category: "employed",
    icon: "🏥",
    shortDesc: "Healthcare coverage and rental housing assistance under National Urban Mission.",
    requiredSystems: ["Employment System", "Health Registry", "Income Verification System"],
    systemCodes: ["employment", "health", "income"],
    eligibility: "Salaried employee under specified income threshold.",
    requiredInfo: ["Monthly Pay Slip Verification", "Family Details"],
    processingTime: "2-4 Business Days"
  },

  // Unemployed Services
  {
    id: "job-opportunities",
    name: "National Job Portal Exchange (NCS)",
    category: "unemployed",
    icon: "🔍",
    shortDesc: "Automated matchmaking with public sector undertakings and verified private employers.",
    requiredSystems: ["Employment System", "Education System", "Identity Verification System"],
    systemCodes: ["employment", "education", "identity"],
    eligibility: "Active job seeker seeking entry or mid-level opportunities.",
    requiredInfo: ["Highest Qualification", "Preferred Job Roles & Location"],
    processingTime: "Instant Matching"
  },
  {
    id: "employment-schemes",
    name: "Direct Employment Subsidy & Stipend",
    category: "unemployed",
    icon: "🤝",
    shortDesc: "Temporary transition allowance during apprentice placement and interviews.",
    requiredSystems: ["Employment System", "Income Verification System", "Banking Verification"],
    systemCodes: ["employment", "income", "banking"],
    eligibility: "Unemployed graduates registered with State Employment Exchange.",
    requiredInfo: ["Employment Exchange Reg Number", "Bank Account for DBT"],
    processingTime: "3-5 Business Days"
  },
  {
    id: "skill-training-unemployed",
    name: "Vocational Reskilling & Job Guarantee",
    category: "unemployed",
    icon: "🛠️",
    shortDesc: "Free hands-on vocational trades training with assured placement interviews.",
    requiredSystems: ["Skill Registry", "Employment System"],
    systemCodes: ["skills", "employment"],
    eligibility: "Any citizen seeking vocational reskilling (10th/12th/Diploma/Graduate).",
    requiredInfo: ["Basic Demographic Information", "Trade Preference"],
    processingTime: "Instant Enrollment"
  },
  {
    id: "financial-assistance",
    name: "Rural & Urban Livelihood Mission (NRLM)",
    category: "unemployed",
    icon: "🌱",
    shortDesc: "Self-help group micro-credit and self-employment tool grants.",
    requiredSystems: ["Revenue System", "Banking Verification", "Identity Verification System"],
    systemCodes: ["revenue", "banking", "identity"],
    eligibility: "Rural and semi-urban job seekers and artisans.",
    requiredInfo: ["Domicile State & District", "Proposed Micro-enterprise"],
    processingTime: "2-4 Business Days"
  },

  // Common Services
  {
    id: "cert-domicile",
    name: "Digital Domicile / Residence Certificate",
    category: "common",
    icon: "📜",
    shortDesc: "Automated instant issuance of resident certificates via Land & Revenue database lookup.",
    requiredSystems: ["Revenue System", "Identity Verification System"],
    systemCodes: ["revenue", "identity"],
    eligibility: "Any registered resident citizen.",
    requiredInfo: ["Permanent Address Verification", "Years of Residence"],
    processingTime: "Instant (< 5 seconds)"
  },
  {
    id: "govt-documents",
    name: "Unified Document Vault Synchronization",
    category: "common",
    icon: "📂",
    shortDesc: "Fetch, verify and cross-link academic, revenue, and transport records in one place.",
    requiredSystems: ["Education System", "Revenue System", "Transport System"],
    systemCodes: ["education", "revenue", "transport"],
    eligibility: "All citizens with registered profile.",
    requiredInfo: ["Document Identifiers", "Consent Scope"],
    processingTime: "Instant Sync"
  },
  {
    id: "grievance-portal",
    name: "Centralized Public Grievance (CPGRAMS)",
    category: "common",
    icon: "⚖️",
    shortDesc: "Single-window grievance lodging with cross-department automated escalation.",
    requiredSystems: ["Grievance System", "Identity Verification System"],
    systemCodes: ["grievance", "identity"],
    eligibility: "All citizens.",
    requiredInfo: ["Department Concerned", "Grievance Description"],
    processingTime: "Immediate Tracking Token Issued"
  },
  {
    id: "general-citizen-services",
    name: "Civic Utilities & Municipal Integration",
    category: "common",
    icon: "🏘️",
    shortDesc: "Electricity, water, property tax, and trade license unified service window.",
    requiredSystems: ["Municipal System", "Revenue System"],
    systemCodes: ["municipal", "revenue"],
    eligibility: "Property owners and municipal residents.",
    requiredInfo: ["Property / Consumer ID", "Municipality Zone"],
    processingTime: "Real-time Verification"
  }
];

// Initialize Storage Seeds if not already present
function initSeedData() {
  if (!getData("userProfile")) {
    saveData("userProfile", getCurrentUser());
  }
  if (!getData("category")) {
    saveData("category", "student");
  }
  if (!getData("notifications")) {
    saveData("notifications", [
      {
        id: "notif-1",
        title: "Education verification completed",
        desc: "Academic credentials verified via National Academic Depository (NAD) adapter.",
        time: "10 mins ago",
        type: "success",
        read: false
      },
      {
        id: "notif-2",
        title: "Application submitted successfully",
        desc: "Scholarship Assistance application reference ONE-2026-00124 registered.",
        time: "2 hours ago",
        type: "info",
        read: false
      },
      {
        id: "notif-3",
        title: "Income verification in progress",
        desc: "Query dispatched to State Revenue System via secure API bridge.",
        time: "1 day ago",
        type: "info",
        read: true
      },
      {
        id: "notif-4",
        title: "System Maintenance Notice",
        desc: "Revenue Department adapter maintenance completed successfully. Circuit breaker healthy.",
        time: "2 days ago",
        type: "warning",
        read: true
      }
    ]);
  }
  if (!getData("applications")) {
    saveData("applications", [
      {
        id: "ONE-2026-00124",
        serviceId: "scholarship-nsp",
        serviceName: "Scholarship Assistance (NSP)",
        category: "student",
        applicantName: "Jack Mathew",
        submittedDate: "2026-09-28",
        status: "In Progress",
        currentStage: "Income Verification",
        stages: {
          submitted: { status: "completed", label: "Application Submitted", time: "10:15 AM" },
          identity: { status: "completed", label: "Identity Verification", time: "10:16 AM" },
          education: { status: "completed", label: "Education Verification", time: "10:17 AM" },
          income: { status: "in-progress", label: "Income Verification", time: "In Progress" },
          eligibility: { status: "pending", label: "Eligibility Check", time: "Pending" },
          final: { status: "pending", label: "Final Processing & Sanction", time: "Pending" }
        },
        connectedSystems: [
          { name: "Education System (NAD)", status: "Completed", icon: "✓" },
          { name: "Income System (CBDT/Revenue)", status: "In Progress", icon: "⏳" },
          { name: "Employment System", status: "Not Required", icon: "—" }
        ]
      }
    ]);
  }
}

// Global UI Initialization (Navbar, Profile Avatar, Mobile Menu)
document.addEventListener("DOMContentLoaded", () => {
  initSeedData();
  
  // Render user profile pill if present
  const user = getCurrentUser();
  const userNameEl = document.getElementById("nav-user-name");
  const userAvatarEl = document.getElementById("nav-user-avatar");
  if (userNameEl && user.basic) {
    userNameEl.textContent = user.basic.name || "Jack Mathew";
  }
  if (userAvatarEl && user.basic && user.basic.name) {
    userAvatarEl.textContent = user.basic.name.charAt(0).toUpperCase();
  }

  // Mobile Hamburger Menu Handler
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }
});
