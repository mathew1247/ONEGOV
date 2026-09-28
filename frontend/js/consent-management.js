/**
 * ONEGOV — DPDP Act Consent Management Controller (consent-management.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("consent-managers-list");

  const DEFAULT_CONSENTS = [
    {
      id: "sys-education",
      systemName: "Education Verification System (NAD)",
      purpose: "Verify degree credentials and academic enrollment status for educational grants.",
      dataRequested: "Course, Institution, Enrolment Year, Marksheet verification token.",
      status: "Granted",
      icon: "🎓"
    },
    {
      id: "sys-income",
      systemName: "Income Verification System (CBDT/Revenue)",
      purpose: "Verify annual household income bracket for subsidy and fee waiver eligibility.",
      dataRequested: "Income slab bracket, tax assessment status.",
      status: "Granted",
      icon: "💰"
    },
    {
      id: "sys-employment",
      systemName: "Employment Exchange Registry (NCS)",
      purpose: "Check active registration in National Career Service & State Labour registry.",
      dataRequested: "Registration token, employment category, skill credentials.",
      status: "Granted",
      icon: "🏢"
    },
    {
      id: "sys-identity",
      systemName: "Identity Verification Gateway",
      purpose: "Establish authenticated citizen profile matching name, state, and district.",
      dataRequested: "Demographic profile claims.",
      status: "Granted",
      icon: "🪪"
    }
  ];

  function renderConsents() {
    let consents = getData("userConsents", DEFAULT_CONSENTS);
    if (!consents || !Array.isArray(consents)) {
      consents = DEFAULT_CONSENTS;
      saveData("userConsents", consents);
    }

    container.innerHTML = consents.map(item => {
      const isGranted = item.status === "Granted";
      const statusBadge = isGranted 
        ? `<span class="badge badge-emerald">✓ GRANTED</span>` 
        : `<span class="badge badge-rose">✕ REVOKED</span>`;

      return `
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 48px; height: 48px; border-radius: var(--radius-sm); background: var(--civic-blue-light); color: var(--civic-blue); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                ${item.icon}
              </div>
              <div>
                <h3 style="font-size: 1.15rem; color: var(--text-navy-primary);">${item.systemName}</h3>
                <div style="margin-top: 4px;">${statusBadge}</div>
              </div>
            </div>

            <div>
              <button class="btn ${isGranted ? 'btn-danger' : 'btn-primary'} btn-sm toggle-consent-btn" data-id="${item.id}">
                ${isGranted ? 'Revoke Consent' : 'Grant Consent'}
              </button>
            </div>
          </div>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #F1F5F9; font-size: 0.9rem;">
            <div style="margin-bottom: 6px;">
              <strong style="color: var(--text-navy-secondary);">Purpose:</strong>
              <span style="color: var(--text-muted);">${item.purpose}</span>
            </div>
            <div>
              <strong style="color: var(--text-navy-secondary);">Data Scope:</strong>
              <span style="color: var(--text-muted);">${item.dataRequested}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Toggle Listeners
    document.querySelectorAll(".toggle-consent-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const list = getData("userConsents", DEFAULT_CONSENTS);
        const target = list.find(c => c.id === id);
        if (target) {
          target.status = target.status === "Granted" ? "Revoked" : "Granted";
          saveData("userConsents", list);
          renderConsents();
        }
      });
    });
  }

  renderConsents();
});
