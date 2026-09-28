/**
 * ONEGOV — Citizen Profile View & Inspector Controller (profile-view.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const currentCategory = getCurrentCategory();

  // Avatar & Basic Info
  const basic = user.basic || {};
  const name = basic.name || "Jack Mathew";

  document.getElementById("view-profile-name").textContent = name;
  document.getElementById("profile-large-avatar").textContent = name.charAt(0).toUpperCase();
  document.getElementById("view-profile-category-tag").textContent = `Category: ${currentCategory.toUpperCase()}`;

  document.getElementById("view-name").textContent = name;
  document.getElementById("view-dob").textContent = basic.dob || "2003-05-14";
  document.getElementById("view-mobile").textContent = basic.mobile || "+91 98765 43210";
  document.getElementById("view-email").textContent = basic.email || "jack.mathew@demo.onegov.in";
  document.getElementById("view-location").textContent = `${basic.state || 'Tamil Nadu'}, ${basic.district || 'Chennai'}`;
  document.getElementById("view-pincode").textContent = basic.pincode || "600025";

  // Category Specific Fields
  const categoryTitle = document.getElementById("view-category-section-title");
  const categoryContainer = document.getElementById("view-category-details-container");
  const skillsContainer = document.getElementById("view-skills-container");

  if (currentCategory === "student") {
    categoryTitle.textContent = "Education & Academic Information";
    const edu = user.education || {};
    categoryContainer.innerHTML = `
      <div class="form-grid-2">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Course & Degree</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${edu.degree || 'B.Tech Computer Science'}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Specialization</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${edu.specialization || 'Artificial Intelligence & Systems'}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Institution</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${edu.institution || 'Anna University Campus'}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Graduation Year</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${edu.graduationYear || '2026'} (${edu.studyYear || '4th Year'})</div>
        </div>
      </div>
    `;

    const skills = Array.isArray(edu.skills) ? edu.skills : ["Python", "Cloud Architecture", "Data Structures"];
    const interests = Array.isArray(edu.interests) ? edu.interests : ["Cybersecurity", "Public Digital Goods"];

    skillsContainer.innerHTML = `
      <div style="margin-bottom: 16px;">
        <strong style="font-size: 0.9rem; color: var(--text-navy-secondary); display: block; margin-bottom: 8px;">Technical & Academic Skills:</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${skills.map(s => `<span class="badge badge-blue" style="font-size: 0.85rem; padding: 6px 14px;">${s}</span>`).join('')}
        </div>
      </div>
      <div>
        <strong style="font-size: 0.9rem; color: var(--text-navy-secondary); display: block; margin-bottom: 8px;">Interests & Domain Focus:</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${interests.map(i => `<span class="badge badge-emerald" style="font-size: 0.85rem; padding: 6px 14px;">${i}</span>`).join('')}
        </div>
      </div>
    `;
  } else if (currentCategory === "employed") {
    categoryTitle.textContent = "Employment & Professional Credentials";
    const emp = user.employment || {};
    categoryContainer.innerHTML = `
      <div class="form-grid-2">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Company</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${emp.company || 'Infosys Tech Solutions Ltd.'}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Job Role</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${emp.jobRole || 'Senior Software Engineer'}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Experience</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${emp.experience || '4'} Years</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Employment Type</div>
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-navy-primary); margin-top: 2px;">${emp.type || 'Private Sector Salaried'}</div>
        </div>
      </div>
    `;
    skillsContainer.innerHTML = `
      <div>
        <strong style="font-size: 0.9rem; color: var(--text-navy-secondary); display: block; margin-bottom: 8px;">Professional Competencies:</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <span class="badge badge-amber" style="font-size: 0.85rem; padding: 6px 14px;">Cloud Infrastructure</span>
          <span class="badge badge-amber" style="font-size: 0.85rem; padding: 6px 14px;">DevOps</span>
          <span class="badge badge-amber" style="font-size: 0.85rem; padding: 6px 14px;">Microservices</span>
        </div>
      </div>
    `;
  } else {
    categoryTitle.textContent = "Common Citizen Profile";
    categoryContainer.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Your verified profile connects seamlessly to municipal, identity, and general welfare registries.
      </p>
    `;
    skillsContainer.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        General citizen services active. No additional skill requirements.
      </p>
    `;
  }
});
