/**
 * ONEGOV — Admin Dashboard Telemetry Controller (dashboard.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const telemetryBody = document.getElementById("telemetry-table-body");

  const TELEMETRY_STREAM = [
    {
      time: "10:24:12 AM",
      adapter: "SoapXmlAdapter",
      target: "ABC NAD Depository (Higher Ed)",
      protocol: "SOAP 1.2 / XML",
      latency: "185ms",
      breaker: "CLOSED (Healthy)",
      status: "success"
    },
    {
      time: "10:23:45 AM",
      adapter: "LegacyDatabaseAdapter",
      target: "CBDT State Revenue DB",
      protocol: "Direct SQL Sync",
      latency: "420ms",
      breaker: "CLOSED (Healthy)",
      status: "success"
    },
    {
      time: "10:22:18 AM",
      adapter: "RestJsonAdapter",
      target: "EPFO & Labour Registry",
      protocol: "REST / JSON",
      latency: "120ms",
      breaker: "CLOSED (Healthy)",
      status: "success"
    },
    {
      time: "10:20:05 AM",
      adapter: "SoapXmlAdapter",
      target: "State Land Records Portal",
      protocol: "SOAP 1.1 / XML",
      latency: "3100ms",
      breaker: "HALF-OPEN (Recovering)",
      status: "warning"
    },
    {
      time: "10:18:50 AM",
      adapter: "RestJsonAdapter",
      target: "Urban Municipal Corporation",
      protocol: "REST / GeoJSON",
      latency: "94ms",
      breaker: "CLOSED (Healthy)",
      status: "success"
    }
  ];

  if (telemetryBody) {
    telemetryBody.innerHTML = TELEMETRY_STREAM.map(t => {
      let badge = `<span class="badge badge-emerald">● ${t.breaker}</span>`;
      if (t.status === "warning") {
        badge = `<span class="badge badge-amber">● ${t.breaker}</span>`;
      } else if (t.status === "failed") {
        badge = `<span class="badge badge-rose">● ${t.breaker}</span>`;
      }

      return `
        <tr>
          <td style="font-family: monospace; font-size: 0.85rem; color: var(--text-muted);">${t.time}</td>
          <td style="font-weight: 700; color: var(--civic-blue);">${t.adapter}</td>
          <td>${t.target}</td>
          <td><span class="badge badge-muted">${t.protocol}</span></td>
          <td style="font-family: monospace; font-weight: 600;">${t.latency}</td>
          <td>${badge}</td>
        </tr>
      `;
    }).join('');
  }
});
