/**
 * ONEGOV — Application Submission Handler (application.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const service = getData("selectedService", SERVICES_CATALOG[0]);
  const consent = getData("consentData", { consent: true });

  // Update Review Info
  const applicantNameEl = document.getElementById("app-applicant-name");
  const applicantStateEl = document.getElementById("app-applicant-state");
  const serviceNameEl = document.getElementById("app-service-name");
  const categoryNameEl = document.getElementById("app-category-name");

  if (applicantNameEl && user.basic) {
    applicantNameEl.textContent = user.basic.name || "Jack Mathew";
  }
  if (applicantStateEl && user.basic) {
    applicantStateEl.textContent = `${user.basic.state || 'Tamil Nadu'} • ${user.basic.district || 'Chennai'} (${user.basic.pincode || '600025'})`;
  }
  if (serviceNameEl) {
    serviceNameEl.textContent = service.name;
  }
  if (categoryNameEl) {
    categoryNameEl.textContent = `Category: ${service.category.toUpperCase()}`;
  }

  // Handle Submission
  const submitBtn = document.getElementById("submit-application-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const newAppId = generateApplicationId();
      
      const newApp = {
        id: newAppId,
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        applicantName: user.basic ? user.basic.name : "Jack Mathew",
        submittedDate: new Date().toISOString().split("T")[0],
        status: "In Progress",
        currentStage: "Education Verification",
        stages: {
          submitted: { status: "completed", label: "Application Submitted", time: "Just now" },
          identity: { status: "completed", label: "Identity Verification", time: "Just now" },
          education: { status: "in-progress", label: "Education Verification", time: "Processing" },
          income: { status: "pending", label: "Income Verification", time: "Queued" },
          eligibility: { status: "pending", label: "Eligibility Check", time: "Queued" },
          final: { status: "pending", label: "Final Processing", time: "Queued" }
        },
        connectedSystems: [
          { name: "Education System (NAD)", status: "In Progress", icon: "⏳" },
          { name: "Income System (CBDT/Revenue)", status: "Queued", icon: "⏳" },
          { name: "Identity System", status: "Completed", icon: "✓" }
        ]
      };

      // Add to applications list in localStorage
      const apps = getData("applications", []);
      apps.unshift(newApp);
      saveData("applications", apps);
      saveData("currentTrackingId", newAppId);

      // Add notification
      const notifs = getData("notifications", []);
      notifs.unshift({
        id: `notif-${Date.now()}`,
        title: "Application submitted successfully",
        desc: `Your application for ${service.name} (${newAppId}) is registered and queued for cross-system verification.`,
        time: "Just now",
        type: "info",
        read: false
      });
      saveData("notifications", notifs);

      // Redirect to tracking page
      redirectTo(`tracking.html?id=${newAppId}`);
    });
  }
});
