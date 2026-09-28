/**
 * ONEGOV — Service Details & Config Controller (service-details.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  let serviceId = urlParams.get("id") || getData("selectedServiceId", "scholarship-nsp");

  let service = SERVICES_CATALOG.find(s => s.id === serviceId);
  if (!service) {
    service = SERVICES_CATALOG[0]; // fallback to scholarship
    serviceId = service.id;
  }

  // Save selected service
  saveData("selectedServiceId", service.id);
  saveData("selectedService", service);

  // Populate Details
  document.getElementById("detail-icon").textContent = service.icon;
  document.getElementById("detail-title").textContent = service.name;
  document.getElementById("detail-desc").textContent = service.shortDesc;
  document.getElementById("detail-category-badge").textContent = service.category.toUpperCase();
  document.getElementById("detail-eligibility").textContent = service.eligibility;
  document.getElementById("detail-processing-time").textContent = service.processingTime;

  // Required Info List
  const reqInfoContainer = document.getElementById("detail-required-info");
  if (reqInfoContainer && service.requiredInfo) {
    reqInfoContainer.innerHTML = service.requiredInfo.map(item => `
      <li style="display: flex; align-items: center; gap: 8px; font-size: 0.92rem;">
        <span style="color: var(--accent-emerald);">✓</span>
        <span>${item}</span>
      </li>
    `).join('');
  }

  // Required Systems List
  const systemsContainer = document.getElementById("detail-systems-list");
  if (systemsContainer && service.requiredSystems) {
    systemsContainer.innerHTML = service.requiredSystems.map(sys => `
      <div style="background: var(--bg-page); border: 1px solid #E2E8F0; border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 600;">
        <span style="color: var(--civic-blue);">🔗</span>
        <span>${sys}</span>
      </div>
    `).join('');
  }

  // Handle Apply Button
  const applyBtn = document.getElementById("apply-service-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      redirectTo("consent.html");
    });
  }
});
