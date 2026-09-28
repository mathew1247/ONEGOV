/**
 * ONEGOV — Audit Logs Controller (audit-logs.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("audit-table-body");

  const AUDIT_LOGS = [
    { time: "10:21:04 AM", user: "USER-9842", app: "ONE-001", system: "Education (NAD)", action: "API Read Request", status: "Success", badge: "badge-emerald" },
    { time: "10:22:15 AM", user: "USER-9842", app: "ONE-001", system: "Income (CBDT)", action: "Direct DB Query", status: "Failed (Timeout)", badge: "badge-rose" },
    { time: "10:23:02 AM", user: "USER-9842", app: "ONE-001", system: "Income (CBDT)", action: "Circuit Retry Dispatch", status: "Success", badge: "badge-emerald" },
    { time: "10:24:45 AM", user: "USER-1049", app: "ONE-002", system: "Identity Gateway", action: "Demographic Match", status: "Success", badge: "badge-emerald" },
    { time: "10:25:30 AM", user: "USER-1049", app: "ONE-002", system: "Consent Vault", action: "DPDP Grant Token Issued", status: "Success", badge: "badge-emerald" },
    { time: "10:26:10 AM", user: "USER-3301", app: "ONE-003", system: "Labour NCS", action: "SOAP XML Query", status: "Success", badge: "badge-emerald" }
  ];

  if (tbody) {
    tbody.innerHTML = AUDIT_LOGS.map(log => `
      <tr>
        <td style="font-family: monospace; font-size: 0.85rem; color: var(--text-muted);">${log.time}</td>
        <td style="font-family: monospace; font-weight: 700; color: var(--text-navy-primary);">${log.user}</td>
        <td style="font-family: monospace; font-weight: 700; color: var(--civic-blue);">${log.app}</td>
        <td style="font-weight: 600;">${log.system}</td>
        <td style="font-size: 0.88rem;">${log.action}</td>
        <td><span class="badge ${log.badge}">● ${log.status}</span></td>
      </tr>
    `).join('');
  }
});
