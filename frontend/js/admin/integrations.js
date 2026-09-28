/**
 * ONEGOV — Integration Monitoring Controller (integrations.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("integrations-table-body");

  const INTEGRATION_METRICS = [
    {
      name: "Education System API (NAD)",
      requests: 1240,
      success: 1210,
      failed: 30,
      responseTime: "140ms",
      status: "Online",
      healthClass: "badge-emerald"
    },
    {
      name: "Income & Revenue API (CBDT)",
      requests: 980,
      success: 965,
      failed: 15,
      responseTime: "280ms",
      status: "Online",
      healthClass: "badge-emerald"
    },
    {
      name: "Employment Exchange Registry (NCS)",
      requests: 650,
      success: 640,
      failed: 10,
      responseTime: "190ms",
      status: "Online",
      healthClass: "badge-emerald"
    },
    {
      name: "Municipal & Civic Utilities Hub",
      requests: 420,
      success: 412,
      failed: 8,
      responseTime: "110ms",
      status: "Online",
      healthClass: "badge-emerald"
    },
    {
      name: "State Land Records Portal",
      requests: 310,
      success: 285,
      failed: 25,
      responseTime: "820ms",
      status: "Degraded",
      healthClass: "badge-amber"
    }
  ];

  if (tbody) {
    tbody.innerHTML = INTEGRATION_METRICS.map(item => `
      <tr>
        <td style="font-weight: 700; color: var(--text-navy-primary);">
          ${item.name}
        </td>
        <td style="font-family: monospace; font-weight: 700;">
          ${item.requests.toLocaleString()}
        </td>
        <td style="font-family: monospace; color: var(--accent-emerald); font-weight: 700;">
          ${item.success.toLocaleString()}
        </td>
        <td style="font-family: monospace; color: var(--accent-rose); font-weight: 700;">
          ${item.failed.toLocaleString()}
        </td>
        <td style="font-family: monospace; font-weight: 600;">
          ${item.responseTime}
        </td>
        <td>
          <span class="badge ${item.healthClass}">● ${item.status}</span>
        </td>
      </tr>
    `).join('');
  }
});
