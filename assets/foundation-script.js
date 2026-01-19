
    document.addEventListener("DOMContentLoaded", () => {

        // Google Apps Script Web App URL (replace with your own URL)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQ1I5AEq0xUqWqDSnMAswN0p18ljD5fF9wbHpi2VxXKBlF7-kJl6hWYorgFd7nX5u4Vg/exec';

  // --- DOM refs
  const form = document.getElementById("feedbackForm");

  
  // Submit button
  const submitBtn = document.getElementById("submitBtn");

  // CHIP ratings section
  const reviewSectionChip = document.getElementById("reviews-section");
  const criteriaBodyChip = document.getElementById("criteria-body");

  const anonToggle = document.getElementById("anonymous");
  const namedBlock = document.getElementById("namedBlock");
  const usernameInput = document.getElementById("username");

  const thanksModal = document.getElementById("thanksModal");
  const thanksOkBtn = document.getElementById("thanksOkBtn");

  const deptChips = document.querySelectorAll('#departments .chip');
  const managerCard = document.getElementById("manager-card");
  const managerSection = document.getElementById('managerSection');
  const managerContainer = document.getElementById('managers');
  const hiddenDept = document.getElementById('selectedDept');
  const hiddenManager = document.getElementById('selectedManager');
  const employeeIdInput = document.getElementById("employeeId");





  usernameInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, ''); // Allow letters and spaces
  });



employeeIdInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });
    // Loading overlay
  const loaderOverlay = document.getElementById("loaderOverlay");

  // Initially selected department and manager
  const selectedDept = hiddenDept.value;
  const selectedManager = hiddenManager.value;

  // Checkbox list
  // const managerCheckboxes = Array.from(document.querySelectorAll('#managerList .manager'));

  // Error boxes
  const errGlobal = document.getElementById("errorGlobal");
  const errChip = document.getElementById("errorChip");
  const errCheckbox = document.getElementById("errorCheckbox");

  // ====== DATA ======
const managersData = {
    "Business Analyst": ["Farook N","Ragul V"],
    "Campaign Management": ["Farook N","Karthikeyan Jayaram","Kishore D","Manigandan K"],
    "Camstats": ["Ramesh V"],
    "Cloud Infrastructure": ["Santhakumar M S"],
    "Compliance": ["Mahesh D","Vandana Prabhakaran"],
    "Creative": ["Selva Muthu Kumar C"],
    "Customer Assist": ["Raghuram Sridharan","Ram Kumar P S"],
    "Customer Success": ["Farook N","Sanjay Tarafdar"],
    "Data Science": ["Mohamed Kani","Sankaranarayanan S","Shanthakumar V K C"],
    "Database": ["Manikandan A","Sankaranarayanan S","Shanthakumar V K C"],
    "DevOps": ["Santhakumar M S"],
    "Dot Net": ["Balachandran S","Buvaneswaran P","Karthik E","Karthikeyan P","Muthukaruppan M","Narender S","Ramana Murthy","Retheesh V","Shanthakumar V K C"],
    "Finance": ["Anbalagan Rangasamy","Shreya Gaunekar","Thirulokchand S"],
    "Frontend": ["Farook N","Ziyaudeen Abbas Ali"],
    "Human Resources": ["Keith Foster","Nazar Muhammed"],
    "Implementation": ["Anurag Kumar P","Mahesh Sukumar","Neeraj R Pandey"],
    "Inside Sales": ["Dhananjay Visvanath"],
    "IT Support": ["Santhakumar M S"],
    "Legal": ["Vandana Prabhakaran"],
    "Market Research": ["Arpitha Shivkumar"],
    "Marketing": ["Anuradha Sriraman","Dhananjay Visvanath","Nagesh K S","Sekhar Vidhya Sagar","Sneha Subramanian"],
    "Mobile Application": ["Buvaneswaran P","Shanthakumar V K C"],
    "Operations": ["Ramesh Vijayan"],
    "Partner Portal": ["Balaji Sankara Saravanan V","Ramesh V"],
    "Pre-Sales": ["Govind Sarawagi","Nagesh K S"],
    "Python": ["Buvaneswaran P","Dinesh Babu M","Mahesh Sukumar","Mohamed Kani","Sankaranarayanan S"],
    "QA": ["Arun Kumar J","Dinesh Babu J","Mahesh Anand Anton Alphonse","Samuel Ebinezer Y","Vimal Rajan V"],
    "ReactJS": ["Arun Karthik C","Farook N","Ramana Murthy","Vennila M"],
    "Sales - India": ["Dinesh Menon","Nagesh K S"],
    "Sales - Operations": ["Dhananjay Visvanath","Sneha Subramanian"],
    "Sales - SEA": ["Dhananjay Visvanath","Govind Sarawagi","Mahesh Sukumar"],
    "Sales - USA": ["Akhil Mohan","Sneha Subramanian","Vandana Prabhakaran"],
    "TRD": ["Balaji Sankara Saravanan V","Thanu K"],
    "Vendor Integration - API": ["Dinesh Babu M","Muthukaruppan M"]
};


// "Product": [],
// "Sales - MEIA": [],
//  "Partner Enablement": [],
  // "Product Compliances": [],


 const criteria = [
   "My manager is approachable when I have questions/clarifications & concern",
      "My manager communicates openly and transparently with me and my team",
      "My manager has given me the support/training I need to succeed",
      "My manager gives useful constructive feedback",
      "My manager pushes my limits and challenges me",
      "My manager effectively provides direction and inspires confidence in the team",
      "My manager supports my professional growth and career development",
      "My manager effectively manages team workload",
      "My manager encourages collaboration and teamwork",
      "My manager demonstrates strong competencies even when working under pressure",
      "My manager recognizes me and appreciates my contributions in the team",
      "My manager checks in regularly about my work or blockers",
      "My manager creates a positive and inclusive work environment",
      "My manager is flexible and promotes a healthy work-life balance",
      "My manager helps prioritize or escalate issues when needed",
      "My manager seeks and accepts feedback"
];



  // ====== STATE ======
  let selectedManagerChip = "";
  const stateChip = { ratings: {}, improvements: "", strengths: "" };

  let selectedManagersCheckbox = [];
  const stateCheckbox = {
    ratings: {},        // ratings[manager][criterion] = 1..5
    improvements: {},   // improvements[manager] = string
    strengths: {}       // strengths[manager] = string
  };

  
  // // ====== Helpers ======
  // function showErrors(box, errors) {
  //   if (!box) return;
  //   if (!errors || errors.length === 0) {
  //     box.classList.remove('show');
  //     box.innerHTML = "";
  //     return;
  //   }
  //   // box.innerHTML = `<strong>Please Select Department</strong>`;
  //   box.classList.add('show');
  // }

  // Call this function whenever you want to validate
function validateChips() {
  const selectedChips = document.querySelectorAll('.chip.selected');
  if (selectedChips.length === 0) {
    showErrors(errGlobal, ["Please select at least one department"]);
    return false;
  } else {
    showErrors(errGlobal, []); // hide error
    return true;
  }
}

// ====== Helpers ======
function showErrors(box, errors) {
  if (!box) return;

  if (!errors || errors.length === 0) {
    box.classList.remove('show');
    box.innerHTML = "";
    return;
  }
  

  // Show the first error (you can loop through if multiple)
  box.classList.add('show');
  box.innerHTML = `<strong>${errors[0]}</strong>`;
}

// ====== Example: Hide error when chip is selected ======
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected'); // mark/unmark chip
    validateChips(); // revalidate on click
  });
});


  // --- Toast helpers (drop-in) ---
  function ensureToastEl() {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }

  function showToast(msg) {
    const toast = ensureToastEl();
    toast.textContent = msg;

    // restart animation/transition reliably
    toast.classList.remove("show");
    toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // ====== ANON toggle ======
  function toggleNameBlock() {
    if (!namedBlock) return;
    namedBlock.style.display = anonToggle?.checked ? "none" : "block";
  }
  anonToggle?.addEventListener("change", toggleNameBlock);
  toggleNameBlock();

  // ====== CHIP FLOW ======
  deptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      deptChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      hiddenDept.value = chip.textContent;

      managerCard.style.display = "block";
      managerSection.style.display = 'block';
      managerContainer.innerHTML = "";

      const list = managersData[chip.textContent] || [];
      list.forEach(m => {
        const mChip = document.createElement('div');
        mChip.className = 'chip';
        mChip.textContent = m;
        managerContainer.appendChild(mChip);

        mChip.addEventListener('click', () => {
          managerContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
          mChip.classList.add('selected');
          hiddenManager.value = m;

          selectedManagerChip = m;
          renderChipTable(m);
        });
      });
    });
  });

  function renderChipTable(manager) {
    // Define escapeAttr function
function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}

// Define escapeHtml function
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}


    reviewSectionChip.style.display = "block";
    const headerRow = document.querySelector("#reviews-section thead tr");
    if (headerRow) {
      headerRow.innerHTML = `<th>Criteria</th><th class="reviewee">${escapeHtml(manager)}</th>`;
    }

    criteriaBodyChip.innerHTML = "";

    // criteria rows
    criteria.forEach(crit => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${crit}</td>
        <td>
          <div class="rating rating-chip" data-criteria="${escapeAttr(crit)}">
            ${[1,2,3,4].map(n => `<span class="number" data-value="${n}" role="button" tabindex="0" aria-pressed="false">${n}</span>`).join("")}
          </div>
        </td>
      `;
      criteriaBodyChip.appendChild(row);
    });

    
    // strength row
    const strengthRow = document.createElement("tr");
    strengthRow.innerHTML = `
      <td>In your opinion what are the manager's key strengths?</td>
      <td><textarea placeholder="Type Here" data-type="strength-chip"></textarea></td>
    `;
    criteriaBodyChip.appendChild(strengthRow);  
    // improvement row
    const improvementRow = document.createElement("tr");
    improvementRow.innerHTML = `
      <td>Your suggestions on areas of improvement for this manager?</td>
      <td><textarea placeholder="Type Here" data-type="improvement-chip"></textarea></td>
    `;
    criteriaBodyChip.appendChild(improvementRow);


    attachChipEvents();
    rehydrateChip();
    showErrors(errChip, []); // reset chip errors
  }

  function attachChipEvents() {
    document.querySelectorAll(".rating-chip .number").forEach(num => {
      num.addEventListener("click", onChipRating);
      num.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChipRating.call(num); }
      });
    });

    const imp = document.querySelector('textarea[data-type="improvement-chip"]');
    const str = document.querySelector('textarea[data-type="strength-chip"]');
    imp?.addEventListener("input", () => { imp.classList.remove("missing"); stateChip.improvements = imp.value; });
    str?.addEventListener("input", () => { str.classList.remove("missing"); stateChip.strengths = str.value; });
  }

  function onChipRating() {
    const wrap = this.closest(".rating-chip");
    const val = Number(this.dataset.value);
    wrap.querySelectorAll(".number").forEach(n => { n.classList.remove("selected"); n.setAttribute("aria-pressed","false"); });
    this.classList.add("selected");
    this.setAttribute("aria-pressed","true");
    wrap.classList.remove("missing");
    stateChip.ratings[wrap.dataset.criteria] = val;
    showErrors(errChip, []);
  }

  function rehydrateChip() {
    document.querySelectorAll(".rating-chip").forEach(div => {
      const c = div.dataset.criteria;
      const saved = stateChip.ratings[c];
      if (saved) {
        const el = div.querySelector(`.number[data-value="${saved}"]`);
        if (el) { el.classList.add("selected"); el.setAttribute("aria-pressed","true"); }
      }
    });
    const imp = document.querySelector('textarea[data-type="improvement-chip"]');
    const str = document.querySelector('textarea[data-type="strength-chip"]');
    if (imp) imp.value = stateChip.improvements || "";
    if (str) str.value = stateChip.strengths || "";
  }

  // ====== FORM SUBMISSION ======

  // Submit form data to Google Apps Script
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
     // Show loader while submitting

function validateAndCollectErrors() {
  const errorsGlobal = [];
  const errorsChip = [];
  const errorsCheckbox = [];

  // Clear highlights
  document.querySelectorAll(".rating, textarea, #departments").forEach(el => el.classList.remove("missing"));

  // Name when not anonymous
 if (!anonToggle.checked) {
  const nm = (usernameInput?.value || "").trim();
  const empId = (employeeIdInput?.value || "").trim();

  if (!nm) {
    errorsGlobal.push("Please enter your Name (To remain anonymous please toggle the button)");
    if (usernameInput) usernameInput.classList.add('missing');
  }
  if (!empId) {
    errorsGlobal.push("Please enter your Employee ID (To remain anonymous please toggle the button).");
    if (employeeIdInput) employeeIdInput.classList.add('missing');
  }
}
  // CHIP section used?
  if (hiddenManager.value) {
    if (!hiddenDept.value) {
      errorsChip.push("Please select a department for the chosen manager.");
      document.getElementById("departments")?.classList.add("missing");
    }
    // All criteria rated?
    document.querySelectorAll(".rating-chip").forEach(div => {
      if (!div.querySelector(".number.selected")) {
        errorsChip.push(`Please rate: ${div.dataset.criteria}`);
        div.classList.add("missing");
      }
    });
    const imp = document.querySelector('textarea[data-type="improvement-chip"]');
    const str = document.querySelector('textarea[data-type="strength-chip"]');
    if (imp && !imp.value.trim()) { errorsChip.push("Please enter What are the areas of improvement for this manager?"); imp.classList.add("missing"); }
    if (str && !str.value.trim()) { errorsChip.push("Please enter What do you think your manager's strenghts are?."); str.classList.add("missing"); }
  }

  // CHECKBOX section used?
  if (selectedManagersCheckbox.length > 0) {
    selectedManagersCheckbox.forEach(m => {
      criteria.forEach(c => {
        const val = stateCheckbox.ratings?.[m]?.[c];
        if (!val) {
          errorsCheckbox.push(`(${m}) Missing rating: ${c}`);
          const cell = document.querySelector(`.rating-checkbox[data-manager="${cssEscape(m)}"][data-criteria="${cssEscape(c)}"]`);
          cell?.classList.add("missing");
        }
      });
      const impVal = stateCheckbox.improvements?.[m];
      const strVal = stateCheckbox.strengths?.[m];
      if (!impVal || !impVal.trim()) {
        errorsCheckbox.push(`(${m}) Please enter areas of improvement.`);
        const t = document.querySelector(`textarea[data-type="improvement-checkbox"][data-manager="${cssEscape(m)}"]`);
        t?.classList.add("missing");
      }
      if (!strVal || !strVal.trim()) {
        errorsCheckbox.push(`(${m}) Please enter what this manager does well.`);
        const t = document.querySelector(`textarea[data-type="strength-checkbox"][data-manager="${cssEscape(m)}"]`);
        t?.classList.add("missing");
      }
    });
  }

  // If neither section used
  if (!hiddenManager.value && selectedManagersCheckbox.length === 0) {
    errorsGlobal.push("Please choose the fields that are applicable to you");
  }



  // Present errors
  showErrors(errGlobal, errorsGlobal);
  showErrors(errChip, errorsChip);
  showErrors(errCheckbox, errorsCheckbox);

  const isOk = errorsGlobal.length === 0 && errorsChip.length === 0 && errorsCheckbox.length === 0;
  return isOk;
}


    // Validate and collect errors
    if (!validateAndCollectErrors()) {
      console.warn("[Validation] Submission blocked due to errors.");
      return;
    }

    // Build the payload to send to Google Sheets
    const payload = {
      meta: {
       timestamp: new Date().toISOString(),
    anonymous: !!anonToggle.checked,
    username: anonToggle.checked ? "" : (usernameInput?.value || "").trim(),
    employeeId: anonToggle.checked ? "" : (employeeIdInput?.value || "").trim()
      },
      chip_flow: hiddenManager.value ? {
        department: hiddenDept.value,
        manager: hiddenManager.value,
        ratings: { ...stateChip.ratings },
        comments: {
          improvements: stateChip.improvements || "",
          strengths: stateChip.strengths || ""
        }
      } : null,
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    // Send data to Google Apps Script
    try {
          localStorage.setItem("feedback_submitted_mgf", "true");
    // Show loader while submitting
    loaderOverlay.style.display = "flex";

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      body: new URLSearchParams({
  username: payload.meta.username,
  employeeId: payload.meta.employeeId,   // ✅ ADD THIS
  department: payload.chip_flow ? payload.chip_flow.department : '',
  manager: payload.chip_flow ? payload.chip_flow.manager : '',
  ratings: JSON.stringify(payload.chip_flow ? payload.chip_flow.ratings : {}),
  improvements: payload.chip_flow ? payload.chip_flow.comments.improvements : '',
  strengths: payload.chip_flow ? payload.chip_flow.comments.strengths : ''
}).toString()
      });

      const result = await response.json();
      if (result.result === "success") {
        // Show success modal
        thanksModal.style.display = "flex";
        thanksModal.setAttribute("aria-hidden", "false");
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Error during submission:", error);
      console.log('There was an error submitting your form. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      loaderOverlay.style.display = "none"; // Hide loader once finished
       setTimeout(() => {
            window.location.href = "/mfe/manager-feedback-growth-and-Improvements.html"; // Replace with your actual URL
          }, 0);
    }
 form.reset(); // Reset the form
    toggleNameBlock(); // Reset name block visibility
    clearFormState(); // Clear any dynamically set state (if applicable)
     
  });

   
  // Close the thanks modal
  thanksOkBtn.addEventListener("click", () => {
    thanksModal.style.display = "none";
    thanksModal.setAttribute("aria-hidden", "true");
    setTimeout(() => {
            window.location.href = "/mfe/manager-feedback-growth-and-Improvements.html"; // Replace with your actual URL
          }, 0); 
  });

  thanksModal?.addEventListener("click", (e) => {
    if (e.target === thanksModal) {
      thanksModal.style.display = "none";
      thanksModal.setAttribute("aria-hidden", "true");
      setTimeout(() => {
            window.location.href = "/mfe/manager-feedback-growth-and-Improvements.html"; // Replace with your actual URL
          }, 0); 
    }
  });
     if(localStorage.getItem("feedback_submitted_mgf")) {
  document.querySelector("form").style.display = "none";
document.body.innerHTML += '<p>✅ Your feedback is submitted. Please reach out to <a href="mailto:hr@resulticks.com">hr@resulticks.com</a> for any queries.</p>';
}
  
});

