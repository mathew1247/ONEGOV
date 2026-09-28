/**
 * ONEGOV — Application Tracking & Pipeline Controller (tracking.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const apps = getData("applications", []);
  let appId = urlParams.get("id") || getData("currentTrackingId", apps[0]?.id || "ONE-2026-00124");

  let app = apps.find(a => a.id === appId) || apps[0];
  if (!app) {
    app = {
      id: "ONE-2026-00124",
      serviceName: "Scholarship Assistance (NSP)",
      status: "In Progress",
      currentStage: "Education Verification",
      stages: {
        submitted: { status: "completed", label: "Application Submitted", time: "10:15 AM" },
        identity: { status: "completed", label: "Identity Verification", time: "10:16 AM" },
        education: { status: "completed", label: "Education Verification", time: "10:17 AM" },
        income: { status: "in-progress", label: "Income Verification", time: "In Progress" },
        eligibility: { status: "pending", label: "Eligibility Check", time: "Pending" },
        final: { status: "pending", label: "Final Processing", time: "Pending" }
      },
      connectedSystems: [
        { name: "Education System (NAD)", status: "Completed", icon: "✓" },
        { name: "Income System (CBDT/Revenue)", status: "In Progress", icon: "⏳" },
        { name: "Employment System", status: "Not Required", icon: "—" }
      ]
    };
  }

  // Populate Header
  document.getElementById("track-app-id").textContent = app.id;
  document.getElementById("track-service-title").textContent = app.serviceName;
  
  const statusContainer = document.getElementById("track-overall-status");
  if (statusContainer) {
    if (app.status === "Completed") {
      statusContainer.innerHTML = `<span class="badge badge-emerald" style="font-size: 0.9rem; padding: 6px 14px;">✓ COMPLETED</span>`;
    } else {
      statusContainer.innerHTML = `<span class="badge badge-amber" style="font-size: 0.9rem; padding: 6px 14px;">⏳ IN PROGRESS</span>`;
    }
  }

  // Render Timeline
  function renderTimeline() {
    const container = document.getElementById("tracking-timeline-container");
    if (!container) return;

    const stagesList = [
      { key: "submitted", title: "Application Submitted", desc: "Digital intake received by ONEGOV middleware Gateway." },
      { key: "identity", title: "Identity Verification", desc: "Citizen demographic claim matched against identity vault." },
      { key: "education", title: "Education Verification", desc: "Academic enrollment query dispatched to NAD adapter." },
      { key: "income", title: "Income Verification", desc: "State revenue & tax assessment bracket validated." },
      { key: "eligibility", title: "Eligibility Check", desc: "Cross-department rule engine executed for scheme approval." },
      { key: "final", title: "Final Processing & Sanction", desc: "Digital sanction order issued with cryptographic QR code." }
    ];

    container.innerHTML = stagesList.map(st => {
      const stageData = app.stages ? app.stages[st.key] : { status: "pending", time: "Pending" };
      const status = stageData ? stageData.status : "pending";
      const timeStr = stageData ? stageData.time : "";

      let statusBadge = `<span class="badge badge-muted">Pending</span>`;
      let dotContent = `○`;

      if (status === "completed") {
        statusBadge = `<span class="badge badge-emerald">✓ Completed</span>`;
        dotContent = `✓`;
      } else if (status === "in-progress") {
        statusBadge = `<span class="badge badge-amber">⏳ In Progress</span>`;
        dotContent = `⏳`;
      }

      return `
        <div class="timeline-step ${status}">
          <div class="timeline-dot">${dotContent}</div>
          <div class="timeline-content">
            <div class="timeline-title">
              <span>${st.title}</span>
              ${statusBadge}
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">${st.desc}</p>
            <div style="font-size: 0.75rem; color: var(--text-light); font-weight: 600;">Time: ${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Connected Systems
  function renderConnectedSystems() {
    const container = document.getElementById("connected-systems-list");
    if (!container) return;

    const systems = app.connectedSystems || [
      { name: "Education System (NAD)", status: "Completed", icon: "✓" },
      { name: "Income System (CBDT/Revenue)", status: "In Progress", icon: "⏳" },
      { name: "Employment System", status: "Not Required", icon: "—" }
    ];

    container.innerHTML = systems.map(sys => {
      let badgeClass = "badge-muted";
      if (sys.status === "Completed") badgeClass = "badge-emerald";
      if (sys.status === "In Progress") badgeClass = "badge-amber";

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-page); border: 1px solid #E2E8F0; border-radius: var(--radius-sm); padding: 12px 16px;">
          <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-navy-primary);">
            ${sys.name}
          </div>
          <span class="badge ${badgeClass}">${sys.icon} ${sys.status}</span>
        </div>
      `;
    }).join('');
  }

  // Simulation Button: Advance the workflow
  const simBtn = document.getElementById("simulate-step-forward-btn");
  if (simBtn) {
    simBtn.addEventListener("click", () => {
      if (app.stages.income.status === "in-progress") {
        app.stages.income.status = "completed";
        app.stages.income.time = "Just now";
        app.stages.eligibility.status = "in-progress";
        app.stages.eligibility.time = "Processing...";
        if (app.connectedSystems[1]) app.connectedSystems[1].status = "Completed";
      } else if (app.stages.eligibility.status === "in-progress") {
        app.stages.eligibility.status = "completed";
        app.stages.eligibility.time = "Just now";
        app.stages.final.status = "completed";
        app.stages.final.time = "Just now";
        app.status = "Completed";
      } else {
        alert("All cross-system verification stages are completed for this application.");
      }

      // Save updated apps
      const allApps = getData("applications", []);
      const idx = allApps.findIndex(a => a.id === app.id);
      if (idx !== -1) {
        allApps[idx] = app;
        saveData("applications", allApps);
      }

      renderTimeline();
      renderConnectedSystems();
    });
  }

  const refreshBtn = document.getElementById("refresh-track-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      location.reload();
    });
  }

  // Initial renders
  renderTimeline();
  renderConnectedSystems();
});
