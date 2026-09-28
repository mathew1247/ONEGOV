/**
 * ONEGOV — Data Mapping & Schema Transformation Controller (data-mapping.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("mapping-rows-container");

  const SCHEMA_MAPPINGS = [
    { sourceSystem: "Higher Education NAD (SOAP)", rawField: "student_name", targetField: "name", type: "String" },
    { sourceSystem: "Higher Education NAD (SOAP)", rawField: "college_affiliated", targetField: "institution", type: "String" },
    { sourceSystem: "Higher Education NAD (SOAP)", rawField: "enrol_yr", targetField: "study_year", type: "String" },
    { sourceSystem: "CBDT State Revenue DB (SQL)", rawField: "dob_ddmmyyyy", targetField: "date_of_birth", type: "Date (ISO-8601)" },
    { sourceSystem: "CBDT State Revenue DB (SQL)", rawField: "income_annual_rs", targetField: "annual_income", type: "Numeric (INR)" },
    { sourceSystem: "Labour Exchange NCS (REST)", rawField: "uan_number", targetField: "employment_id", type: "Identifier" },
    { sourceSystem: "Labour Exchange NCS (REST)", rawField: "job_designation", targetField: "current_role", type: "String" },
    { sourceSystem: "Municipal Property Tax (JSON)", rawField: "prop_assessment_no", targetField: "property_id", type: "String" }
  ];

  if (container) {
    container.innerHTML = SCHEMA_MAPPINGS.map(m => `
      <div class="mapping-row">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); background: #E2E8F0; padding: 2px 8px; border-radius: 4px;">${m.sourceSystem}</span>
          <span class="mapping-field">${m.rawField}</span>
        </div>

        <div class="mapping-arrow">
          <span>───────────→</span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="mapping-field mapping-target">${m.targetField}</span>
          <span class="badge badge-blue">${m.type}</span>
        </div>
      </div>
    `).join('');
  }
});
