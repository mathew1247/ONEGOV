/**
 * ONEGOV — Department Systems & Adapters Controller (systems.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("systems-table-body");

  const SYSTEMS_LIST = [
    {
      name: "National Academic Depository (NAD)",
      dept: "Ministry of Education",
      protocol: "RESTful HTTP/2",
      format: "JSON (OCDS v2.4)",
      endpoint: "https://api.nad.gov.in/v2/verify",
      status: "Active",
      badgeClass: "badge-emerald"
    },
    {
      name: "CBDT State Revenue DB",
      dept: "Ministry of Finance",
      protocol: "Legacy Database Connector",
      format: "Direct SQL Schema Sync",
      endpoint: "sql://cbdt-prod-node01.gov.internal:5432",
      status: "Active",
      badgeClass: "badge-emerald"
    },
    {
      name: "National Career Service (NCS)",
      dept: "Ministry of Labour & Employment",
      protocol: "Legacy Adapter (WSDL)",
      format: "SOAP 1.2 / XML",
      endpoint: "https://soap.ncs.gov.in/ws/CitizenVerificationService",
      status: "Active",
      badgeClass: "badge-emerald"
    },
    {
      name: "Ayushman Bharat Digital Mission (ABDM)",
      dept: "National Health Authority",
      protocol: "REST (HL7 / FHIR)",
      format: "JSON-LD",
      endpoint: "https://healthidsbx.abdm.gov.in/api/v1",
      status: "Active",
      badgeClass: "badge-emerald"
    },
    {
      name: "Urban Municipal Tax & Property Gateway",
      dept: "Ministry of Housing & Urban Affairs",
      protocol: "RESTful JSON API",
      format: "JSON (GeoSpatial)",
      endpoint: "https://api.urban.gov.in/v1/property/verify",
      status: "Active",
      badgeClass: "badge-emerald"
    }
  ];

  if (tbody) {
    tbody.innerHTML = SYSTEMS_LIST.map(sys => `
      <tr>
        <td style="font-weight: 700; color: var(--text-navy-primary);">
          ${sys.name}
        </td>
        <td style="color: var(--text-muted); font-size: 0.9rem;">
          ${sys.dept}
        </td>
        <td>
          <span class="badge badge-blue">${sys.protocol}</span>
        </td>
        <td>
          <span class="badge badge-muted" style="font-family: monospace;">${sys.format}</span>
        </td>
        <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted);">
          ${sys.endpoint}
        </td>
        <td>
          <span class="badge ${sys.badgeClass}">● ${sys.status}</span>
        </td>
      </tr>
    `).join('');
  }
});
