/**
 * ONEGOV — Workflow Stage Monitoring Controller (workflow.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const colEdu = document.getElementById("col-education-items");
  const colInc = document.getElementById("col-income-items");
  const colElg = document.getElementById("col-eligibility-items");
  const colCmp = document.getElementById("col-completed-items");

  const WORKFLOW_APPS = [
    { id: "ONE-001", applicant: "Aarav Sharma", service: "Scholarship Assistance", stage: "education", time: "10 mins in queue" },
    { id: "ONE-002", applicant: "Jack Mathew", service: "Scholarship Assistance", stage: "income", time: "2 mins in queue" },
    { id: "ONE-003", applicant: "Priya Patel", service: "Executive Upskilling Grant", stage: "eligibility", time: "5 mins in queue" },
    { id: "ONE-004", applicant: "Vikram Singh", service: "Digital Domicile Certificate", stage: "completed", time: "Disbursed" },
    { id: "ONE-005", applicant: "Ananya Roy", service: "Education Loan Subsidy", stage: "education", time: "12 mins in queue" },
    { id: "ONE-006", applicant: "Rohan Varma", service: "NCS Job Match Scheme", stage: "completed", time: "Disbursed" }
  ];

  function renderCard(app) {
    return `
      <div class="stage-card-item">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-family: monospace; font-weight: 800; color: var(--civic-blue); font-size: 0.85rem;">${app.id}</span>
          <span style="font-size: 0.72rem; color: var(--text-light);">${app.time}</span>
        </div>
        <div style="font-size: 0.92rem; font-weight: 700; color: var(--text-navy-primary);">${app.applicant}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${app.service}</div>
      </div>
    `;
  }

  if (colEdu) colEdu.innerHTML = WORKFLOW_APPS.filter(a => a.stage === "education").map(renderCard).join('');
  if (colInc) colInc.innerHTML = WORKFLOW_APPS.filter(a => a.stage === "income").map(renderCard).join('');
  if (colElg) colElg.innerHTML = WORKFLOW_APPS.filter(a => a.stage === "eligibility").map(renderCard).join('');
  if (colCmp) colCmp.innerHTML = WORKFLOW_APPS.filter(a => a.stage === "completed").map(renderCard).join('');
});
