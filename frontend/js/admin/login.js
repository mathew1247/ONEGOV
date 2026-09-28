/**
 * ONEGOV — Admin & Officer Login Controller (login.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Store demo officer session
      saveData("adminSession", {
        authenticated: true,
        officerName: "Dr. K. S. Ramanathan",
        role: "Chief Interoperability Commissioner",
        department: document.getElementById("admin-dept").value,
        loginTime: new Date().toISOString()
      });

      // Redirect to Admin Dashboard
      redirectTo("dashboard.html");
    });
  }
});
