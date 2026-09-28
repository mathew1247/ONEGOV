/**
 * ONEGOV — Citizen Basic Profile Management (profile.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const currentCategory = getCurrentCategory();
  const categoryBadge = document.getElementById("active-category-badge");
  
  if (categoryBadge) {
    categoryBadge.textContent = `Category: ${currentCategory.toUpperCase()}`;
  }

  // Pre-fill form if existing profile is in localStorage
  const existingUser = getCurrentUser();
  if (existingUser && existingUser.basic) {
    const b = existingUser.basic;
    if (b.name) document.getElementById("full-name").value = b.name;
    if (b.dob) document.getElementById("dob").value = b.dob;
    if (b.mobile) document.getElementById("mobile").value = b.mobile;
    if (b.email) document.getElementById("email").value = b.email;
    if (b.state) document.getElementById("state").value = b.state;
    if (b.district) document.getElementById("district").value = b.district;
    if (b.pincode) document.getElementById("pincode").value = b.pincode;
  }

  // Handle Form Submission
  const form = document.getElementById("basic-profile-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const userProfile = getData("userProfile", {}) || {};
      userProfile.category = currentCategory;
      userProfile.basic = {
        name: document.getElementById("full-name").value.trim(),
        dob: document.getElementById("dob").value,
        mobile: document.getElementById("mobile").value.trim(),
        email: document.getElementById("email").value.trim(),
        state: document.getElementById("state").value,
        district: document.getElementById("district").value.trim(),
        pincode: document.getElementById("pincode").value.trim()
      };

      // Save updated profile
      saveData("userProfile", userProfile);

      // Redirect to dynamic category profile
      redirectTo("category-profile.html");
    });
  }
});
