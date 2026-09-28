/**
 * ONEGOV — Dynamic Category Profile Form Handler (category-profile.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const currentCategory = getCurrentCategory();
  const container = document.getElementById("dynamic-fields-container");
  const titleEl = document.getElementById("category-page-title");
  const subtitleEl = document.getElementById("category-page-subtitle");
  const categoryPill = document.getElementById("category-type-pill");
  const user = getCurrentUser();

  if (categoryPill) {
    categoryPill.textContent = currentCategory.toUpperCase();
  }

  // 1. Render Student Form
  if (currentCategory === "student") {
    titleEl.textContent = "Academic & Student Details";
    subtitleEl.textContent = "Information used to match national scholarships, fee waivers, and academic depository verifications.";
    
    const edu = user.education || {};

    container.innerHTML = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="edu-level">Education Level <span class="required">*</span></label>
          <select class="form-control form-select" id="edu-level" required>
            <option value="Undergraduate" ${edu.level === 'Undergraduate' ? 'selected' : ''}>Undergraduate (B.Tech / B.Sc / B.Com / B.A)</option>
            <option value="Postgraduate" ${edu.level === 'Postgraduate' ? 'selected' : ''}>Postgraduate (M.Tech / M.Sc / MBA)</option>
            <option value="Diploma" ${edu.level === 'Diploma' ? 'selected' : ''}>Polytechnic / Diploma</option>
            <option value="Secondary" ${edu.level === 'Secondary' ? 'selected' : ''}>Higher Secondary (11th / 12th)</option>
            <option value="Doctorate" ${edu.level === 'Doctorate' ? 'selected' : ''}>Doctorate (Ph.D)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="degree-course">Degree / Course <span class="required">*</span></label>
          <input type="text" class="form-control" id="degree-course" value="${edu.degree || 'B.Tech Computer Science'}" placeholder="e.g. B.Tech Computer Science" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="specialization">Specialization <span class="required">*</span></label>
          <input type="text" class="form-control" id="specialization" value="${edu.specialization || 'Artificial Intelligence & Systems'}" placeholder="e.g. AI & Data Systems" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="college-name">College / Institution <span class="required">*</span></label>
          <input type="text" class="form-control" id="college-name" value="${edu.institution || 'Anna University Campus'}" placeholder="e.g. Anna University Campus" required>
        </div>
      </div>

      <div class="form-grid-3">
        <div class="form-group">
          <label class="form-label" for="study-year">Current Study Year <span class="required">*</span></label>
          <select class="form-control form-select" id="study-year" required>
            <option value="1st Year" ${edu.studyYear === '1st Year' ? 'selected' : ''}>1st Year</option>
            <option value="2nd Year" ${edu.studyYear === '2nd Year' ? 'selected' : ''}>2nd Year</option>
            <option value="3rd Year" ${edu.studyYear === '3rd Year' ? 'selected' : ''}>3rd Year</option>
            <option value="4th Year" ${edu.studyYear === '4th Year' || !edu.studyYear ? 'selected' : ''}>4th Year / Final Year</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="grad-year">Expected Graduation Year <span class="required">*</span></label>
          <input type="number" class="form-control" id="grad-year" value="${edu.graduationYear || '2026'}" min="2024" max="2032" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="income-range">Annual Family Income <span class="required">*</span></label>
          <select class="form-control form-select" id="income-range" required>
            <option value="Below ₹2,50,000">Below ₹2,50,000 (Full Subsidy Bracket)</option>
            <option value="₹2,50,000 - ₹5,00,000" selected>₹2,50,000 - ₹5,00,000</option>
            <option value="₹5,00,000 - ₹8,00,000">₹5,00,000 - ₹8,00,000</option>
            <option value="Above ₹8,00,000">Above ₹8,00,000</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="skills-input">Key Technical / Academic Skills (comma separated)</label>
        <input type="text" class="form-control" id="skills-input" value="${Array.isArray(edu.skills) ? edu.skills.join(', ') : 'Python, Cloud Architecture, Data Structures'}" placeholder="Python, Web Development, Data Science">
      </div>

      <div class="form-group">
        <label class="form-label" for="interests-input">Interests & Extracurricular Focus</label>
        <input type="text" class="form-control" id="interests-input" value="${Array.isArray(edu.interests) ? edu.interests.join(', ') : 'Cybersecurity, Public Digital Goods'}" placeholder="Research, Hackathons, Public Welfare">
      </div>
    `;
  } 
  
  // 2. Render Employed Form
  else if (currentCategory === "employed") {
    titleEl.textContent = "Employment & Professional Details";
    subtitleEl.textContent = "Used to link employee welfare schemes, EPFO provident fund subsidies, and executive upskilling.";
    
    const emp = user.employment || {};

    container.innerHTML = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="emp-type">Employment Type <span class="required">*</span></label>
          <select class="form-control form-select" id="emp-type" required>
            <option value="Private Sector Salaried">Private Sector Salaried</option>
            <option value="Public Sector / PSU">Public Sector / PSU</option>
            <option value="Self-Employed / Freelancer">Self-Employed / Freelancer</option>
            <option value="Gig / Platform Worker">Gig / Platform Worker</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="company-name">Company / Organization <span class="required">*</span></label>
          <input type="text" class="form-control" id="company-name" value="${emp.company || 'Infosys Tech Solutions Ltd.'}" placeholder="e.g. Acme Tech Solutions" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="industry-type">Industry Sector <span class="required">*</span></label>
          <select class="form-control form-select" id="industry-type" required>
            <option value="Information Technology">Information Technology & Software</option>
            <option value="Banking & Finance">Banking, Financial Services & Insurance</option>
            <option value="Manufacturing">Manufacturing & Engineering</option>
            <option value="Healthcare">Healthcare & Pharmaceuticals</option>
            <option value="Education">Education & Research</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="job-role">Current Job Role / Designation <span class="required">*</span></label>
          <input type="text" class="form-control" id="job-role" value="${emp.jobRole || 'Senior Software Engineer'}" placeholder="e.g. Systems Engineer" required>
        </div>
      </div>

      <div class="form-grid-3">
        <div class="form-group">
          <label class="form-label" for="years-exp">Years of Experience <span class="required">*</span></label>
          <input type="number" class="form-control" id="years-exp" value="${emp.experience || '4'}" min="0" max="40" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="highest-qual">Highest Qualification <span class="required">*</span></label>
          <input type="text" class="form-control" id="highest-qual" value="${emp.qualification || 'B.Tech / B.E'}" placeholder="e.g. B.Tech / MBA" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="emp-income">Annual Income Range <span class="required">*</span></label>
          <select class="form-control form-select" id="emp-income" required>
            <option value="Below ₹5,00,000">Below ₹5,00,000</option>
            <option value="₹5,00,000 - ₹10,00,000" selected>₹5,00,000 - ₹10,00,000</option>
            <option value="₹10,00,000 - ₹18,00,000">₹10,00,000 - ₹18,00,000</option>
            <option value="Above ₹18,00,000">Above ₹18,00,000</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="emp-skills">Core Professional Skills (comma separated)</label>
        <input type="text" class="form-control" id="emp-skills" value="${emp.skills || 'Cloud Infrastructure, DevOps, Microservices'}" placeholder="Project Management, AWS, SQL">
      </div>
    `;
  }

  // 3. Render Unemployed Form
  else if (currentCategory === "unemployed") {
    titleEl.textContent = "Job Seeker & Training Profile";
    subtitleEl.textContent = "Information used to match State Employment Exchanges, apprentice schemes, and National Career Service (NCS) openings.";
    
    const unemp = user.unemployedDetails || {};

    container.innerHTML = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="unemp-qual">Highest Qualification <span class="required">*</span></label>
          <select class="form-control form-select" id="unemp-qual" required>
            <option value="Graduate (B.Sc / B.Com / B.A)">Graduate (B.Sc / B.Com / B.A)</option>
            <option value="Engineering Graduate (B.E / B.Tech)">Engineering Graduate (B.E / B.Tech)</option>
            <option value="Postgraduate">Postgraduate</option>
            <option value="Diploma / ITI">Diploma / ITI Technician</option>
            <option value="12th Pass">Higher Secondary (12th)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="unemp-degree">Degree / Course Studied <span class="required">*</span></label>
          <input type="text" class="form-control" id="unemp-degree" value="${unemp.degree || 'Bachelor of Science (Physics)'}" placeholder="e.g. B.Sc Physics" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="pref-role">Preferred Job Role <span class="required">*</span></label>
          <input type="text" class="form-control" id="pref-role" value="${unemp.preferredRole || 'Junior Systems Support / Operations'}" placeholder="e.g. Data Entry, Web Developer, Field Executive" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="pref-location">Preferred Work Location <span class="required">*</span></label>
          <input type="text" class="form-control" id="pref-location" value="${unemp.preferredLocation || 'Chennai / Coimbatore / Remote'}" placeholder="e.g. Chennai, Bangalore, Hybrid" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="job-type-pref">Job Type Preference <span class="required">*</span></label>
          <select class="form-control form-select" id="job-type-pref" required>
            <option value="Full-Time Permanent">Full-Time Permanent</option>
            <option value="Govt Apprenticeship">Government Apprenticeship / Trainee</option>
            <option value="Contractual / Freelance">Contractual / Project-Based</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="prev-exp">Previous Experience</label>
          <input type="text" class="form-control" id="prev-exp" value="${unemp.previousExperience || 'Fresher / 6 months internship'}" placeholder="e.g. Fresher / 1 Year">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="training-interests">Free Training & Vocational Interests</label>
        <input type="text" class="form-control" id="training-interests" value="${unemp.trainingInterests || 'Data Analytics, IT Hardware, Solar Technician'}" placeholder="Digital Marketing, Solar Technician, IT Support">
      </div>
    `;
  }

  // 4. Render Common Category
  else {
    titleEl.textContent = "Common Citizen Profile";
    subtitleEl.textContent = "Your basic citizen profile is verified. Additional information will only be requested when applying for specific certificates or municipal services.";

    container.innerHTML = `
      <div class="alert alert-success" style="margin-top: 10px; margin-bottom: 24px;">
        <span style="font-size: 1.5rem;">🎉</span>
        <div>
          <h4 style="color: #065F46; margin-bottom: 4px;">Profile Complete & Verified</h4>
          <p style="color: #047857; margin-bottom: 0;">Your basic demographic profile is ready. You can now access unified domicile certificates, grievance lodgement, and civic utility services directly.</p>
        </div>
      </div>
      <div style="background: var(--bg-page); border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 20px;">
        <h4 style="margin-bottom: 12px;">Active Verified Demographic Anchor:</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.92rem;">
          <li><strong>Citizen Name:</strong> ${user.basic ? user.basic.name : 'Jack Mathew'}</li>
          <li><strong>Registered State:</strong> ${user.basic ? user.basic.state : 'Tamil Nadu'}</li>
          <li><strong>District:</strong> ${user.basic ? user.basic.district : 'Chennai'} (Pincode: ${user.basic ? user.basic.pincode : '600025'})</li>
        </ul>
      </div>
    `;
  }

  // Handle Form Submission
  const form = document.getElementById("dynamic-category-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const userProfile = getData("userProfile", {}) || {};
      userProfile.category = currentCategory;

      if (currentCategory === "student") {
        userProfile.education = {
          level: document.getElementById("edu-level")?.value || "Undergraduate",
          degree: document.getElementById("degree-course")?.value || "",
          specialization: document.getElementById("specialization")?.value || "",
          institution: document.getElementById("college-name")?.value || "",
          studyYear: document.getElementById("study-year")?.value || "",
          graduationYear: document.getElementById("grad-year")?.value || "2026",
          skills: (document.getElementById("skills-input")?.value || "").split(",").map(s => s.trim()).filter(Boolean),
          interests: (document.getElementById("interests-input")?.value || "").split(",").map(s => s.trim()).filter(Boolean),
          incomeRange: document.getElementById("income-range")?.value || ""
        };
      } else if (currentCategory === "employed") {
        userProfile.employment = {
          type: document.getElementById("emp-type")?.value || "",
          company: document.getElementById("company-name")?.value || "",
          industry: document.getElementById("industry-type")?.value || "",
          jobRole: document.getElementById("job-role")?.value || "",
          experience: document.getElementById("years-exp")?.value || "",
          qualification: document.getElementById("highest-qual")?.value || "",
          skills: document.getElementById("emp-skills")?.value || "",
          incomeRange: document.getElementById("emp-income")?.value || ""
        };
      } else if (currentCategory === "unemployed") {
        userProfile.unemployedDetails = {
          qualification: document.getElementById("unemp-qual")?.value || "",
          degree: document.getElementById("unemp-degree")?.value || "",
          preferredRole: document.getElementById("pref-role")?.value || "",
          preferredLocation: document.getElementById("pref-location")?.value || "",
          jobType: document.getElementById("job-type-pref")?.value || "",
          previousExperience: document.getElementById("prev-exp")?.value || "",
          trainingInterests: document.getElementById("training-interests")?.value || ""
        };
      }

      // Persist profile
      saveData("userProfile", userProfile);

      // Redirect to services dashboard
      redirectTo("services.html");
    });
  }
});
