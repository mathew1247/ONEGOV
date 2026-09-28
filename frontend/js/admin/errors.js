/**
 * ONEGOV — Errors, Circuit Breakers & Retries Controller (errors.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("errors-table-body");

  let ERROR_RECORDS = [
    {
      id: "err-101",
      system: "State Revenue & Income DB",
      error: "Connection Timeout (504 Gateway)",
      time: "10:23 AM",
      retryCount: "2 / 3",
      status: "Retrying",
      badgeClass: "badge-amber"
    },
    {
      id: "err-102",
      system: "Land Records Portal (SOAP)",
      error: "Malformed XML Envelope (WSDL Mismatch)",
      time: "10:15 AM",
      retryCount: "1 / 3",
      status: "Circuit Half-Open",
      badgeClass: "badge-amber"
    },
    {
      id: "err-103",
      system: "Municipal Property API",
      error: "Rate Limit Exceeded (HTTP 429)",
      time: "09:50 AM",
      retryCount: "3 / 3",
      status: "Recovered",
      badgeClass: "badge-emerald"
    }
  ];

  function renderErrors() {
    if (!tbody) return;

    tbody.innerHTML = ERROR_RECORDS.map(rec => {
      const isRecovered = rec.status === "Recovered";

      return `
        <tr>
          <td style="font-weight: 700; color: var(--text-navy-primary);">
            ${rec.system}
          </td>
          <td style="font-family: monospace; font-size: 0.85rem; color: var(--accent-rose); font-weight: 600;">
            ${rec.error}
          </td>
          <td style="color: var(--text-muted); font-size: 0.88rem;">
            ${rec.time}
          </td>
          <td style="font-family: monospace; font-weight: 700;">
            ${rec.retryCount}
          </td>
          <td>
            <span class="badge ${rec.badgeClass}">● ${rec.status}</span>
          </td>
          <td style="text-align: right;">
            ${!isRecovered ? `
              <button class="btn btn-primary btn-sm retry-btn" data-id="${rec.id}" style="padding: 4px 12px; font-size: 0.8rem;">
                ⚡ Retry Now
              </button>
            ` : `
              <span style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 700;">✓ Resolved</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    // Attach retry button handlers
    document.querySelectorAll(".retry-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const target = ERROR_RECORDS.find(r => r.id === id);
        if (target) {
          btn.textContent = "⏳ Retrying...";
          btn.disabled = true;

          setTimeout(() => {
            target.status = "Recovered";
            target.retryCount = "3 / 3";
            target.badgeClass = "badge-emerald";
            target.error = "Handshake Re-established";
            renderErrors();
          }, 800);
        }
      });
    });
  }

  renderErrors();
});
