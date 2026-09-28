/**
 * ONEGOV — Consent Authorization Handler (consent.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const service = getData("selectedService", SERVICES_CATALOG[0]);
  const serviceNameEl = document.getElementById("consent-service-name");
  const systemsContainer = document.getElementById("consent-systems-container");
  const consentCheckbox = document.getElementById("consent-checkbox");
  const submitBtn = document.getElementById("submit-consent-btn");

  if (serviceNameEl) {
    serviceNameEl.textContent = service.name;
  }

  // System Descriptions Map
  const SYSTEM_DETAILS = {
    "education": {
      title: "Education Verification System (NAD)",
      dataScope: "Academic enrollment, course registration, and institution credentials.",
      icon: "🎓"
    },
    "income": {
      title: "Income Verification System (CBDT / State Revenue)",
      dataScope: "Annual family income bracket and tax assessment confirmation.",
      icon: "💰"
    },
    "identity": {
      title: "Identity Verification System",
      dataScope: "Demographic profile match (Name, State, Pincode).",
      icon: "🪪"
    },
    "employment": {
      title: "Employment Exchange Registry (NCS / Labour)",
      dataScope: "Active job registration number, experience logs, and UAN status.",
      icon: "🏢"
    },
    "banking": {
      title: "Banking Verification & Direct Benefit Gateway",
      dataScope: "Account validity check for subsidy disbursement.",
      icon: "🏦"
    },
    "skills": {
      title: "National Skill Registry (PMKVY)",
      dataScope: "Skill certification history and competency badges.",
      icon: "⚡"
    },
    "revenue": {
      title: "Revenue & Land Domicile System",
      dataScope: "Residential verification and municipal property index.",
      icon: "📜"
    }
  };

  const systems = service.systemCodes || ["education", "income", "identity"];

  if (systemsContainer) {
    systemsContainer.innerHTML = systems.map(sysCode => {
      const info = SYSTEM_DETAILS[sysCode] || {
        title: `${sysCode.toUpperCase()} Verification System`,
        dataScope: "Required demographic and eligibility parameters.",
        icon: "🔗"
      };

      return `
        <div class="consent-system-item">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="font-size: 1.5rem;">${info.icon}</div>
            <div class="consent-system-info">
              <h4>${info.title}</h4>
              <p>${info.dataScope}</p>
            </div>
          </div>
          <span class="badge badge-emerald">Access Required</span>
        </div>
      `;
    }).join('');
  }

  // Enable / Disable Continue button based on checkbox
  consentCheckbox.addEventListener("change", () => {
    submitBtn.disabled = !consentCheckbox.checked;
  });

  // Save Consent on Submit
  submitBtn.addEventListener("click", () => {
    const consentPayload = {
      serviceId: service.id,
      serviceName: service.name,
      consent: true,
      timestamp: new Date().toISOString(),
      systems: systems
    };

    saveData("consentData", consentPayload);
    redirectTo("application.html");
  });
});
