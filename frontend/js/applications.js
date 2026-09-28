/**
 * ONEGOV — My Applications Table & Listing Controller (applications.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const apps = getData("applications", []);
  const tbody = document.getElementById("applications-table-body");

  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">📂</div>
          <p style="font-size: 1.05rem; font-weight: 600;">No applications submitted yet.</p>
          <p style="font-size: 0.88rem; margin-top: 4px;">Explore available services and submit your first application.</p>
          <a href="services.html" class="btn btn-primary btn-sm" style="margin-top: 16px;">Browse Services</a>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const isCompleted = app.status === "Completed";
    const statusBadge = isCompleted 
      ? `<span class="badge badge-emerald">✓ Completed</span>` 
      : `<span class="badge badge-amber">⏳ In Progress</span>`;

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--civic-blue);">
          ${app.id}
        </td>
        <td style="font-weight: 700;">
          ${app.serviceName}
        </td>
        <td>
          <span class="badge badge-muted">${(app.category || 'General').toUpperCase()}</span>
        </td>
        <td style="color: var(--text-muted); font-size: 0.88rem;">
          ${app.submittedDate || '2026-09-28'}
        </td>
        <td>
          ${statusBadge}
        </td>
        <td style="text-align: right;">
          <a href="tracking.html?id=${app.id}" class="btn btn-outline btn-sm">
            🔍 Track Status
          </a>
        </td>
      </tr>
    `;
  }).join('');
});
