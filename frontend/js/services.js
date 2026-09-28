/**
 * ONEGOV — Services Catalog & Filter Controller (services.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const currentCategory = getCurrentCategory();
  
  // Update Welcome Title
  const welcomeTitle = document.getElementById("welcome-user-title");
  const categoryTag = document.getElementById("user-category-tag");
  
  if (welcomeTitle && user.basic && user.basic.name) {
    const firstName = user.basic.name.split(" ")[0];
    welcomeTitle.textContent = `Welcome, ${firstName}`;
  }

  if (categoryTag) {
    categoryTag.textContent = `${currentCategory.toUpperCase()} PROFILE`;
  }

  const container = document.getElementById("services-grid-container");
  const countEl = document.getElementById("services-count");
  const filterPills = document.querySelectorAll(".filter-pill");

  function renderServices(filter = "all") {
    let filteredList = SERVICES_CATALOG;

    if (filter === "all") {
      // Prioritize current user category at the top, then common services
      filteredList = SERVICES_CATALOG.filter(s => s.category === currentCategory || s.category === "common");
    } else {
      filteredList = SERVICES_CATALOG.filter(s => s.category === filter);
    }

    if (countEl) countEl.textContent = filteredList.length;

    if (filteredList.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #FFFFFF; border-radius: var(--radius-card); border: 1px solid #E2E8F0;">
          <p style="font-size: 1.1rem; color: var(--text-muted);">No services found for this category filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredList.map(s => `
      <div class="service-card">
        <div class="service-card-top">
          <div class="service-icon">${s.icon}</div>
          <span class="badge ${getCategoryBadgeClass(s.category)}">${s.category.toUpperCase()}</span>
        </div>
        <h3 class="service-title">${s.name}</h3>
        <p class="service-desc">${s.shortDesc}</p>
        
        <div class="required-systems-box">
          <div class="required-systems-title">
            <span>🔗</span>
            <span>Required Government Systems</span>
          </div>
          <div class="systems-chips-list">
            ${s.requiredSystems.map(sys => `<span class="system-chip">${sys}</span>`).join('')}
          </div>
        </div>

        <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ⏱️ ${s.processingTime}
          </span>
          <button class="btn btn-primary btn-sm view-details-btn" data-id="${s.id}">
            View Details →
          </button>
        </div>
      </div>
    `).join('');

    // Attach click events
    document.querySelectorAll(".view-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const serviceId = btn.getAttribute("data-id");
        saveData("selectedServiceId", serviceId);
        redirectTo(`service-details.html?id=${serviceId}`);
      });
    });
  }

  function getCategoryBadgeClass(cat) {
    switch (cat) {
      case "student": return "badge-blue";
      case "employed": return "badge-amber";
      case "unemployed": return "badge-emerald";
      default: return "badge-muted";
    }
  }

  // Filter Click Handlers
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-filter");
      renderServices(filter);
    });
  });

  // Initial Render
  renderServices("all");
});
