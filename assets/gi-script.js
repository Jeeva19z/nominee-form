
document.addEventListener("DOMContentLoaded", () => {
 



  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHSAUNsOjuN3nANEzXDIQoYBaKnC93cDBbYL7HJnXWsT2w2KIMZxLYCsnY9kxR3eQY/exec";

  // DOM refs
  const form = document.getElementById("feedbackForm");
  const submitBtn = document.getElementById("submitBtn");
  const checkboxes = document.querySelectorAll(".manager");
  const reviewSection = document.getElementById("reviews-section");
  const criteriaBody = document.getElementById("criteria-body");
  const anonToggle = document.getElementById("anonymous");
  const namedBlock = document.getElementById("namedBlock") || document.querySelector(".toggle-form");
  const usernameInput = document.getElementById("username");
  const extraEl = document.getElementById("extraFeedback");
  const okMsg = document.getElementById("okMsg");
  const errMsg = document.getElementById("errMsg");
  const loaderOverlay = document.getElementById("loaderOverlay");
  const thanksModal = document.getElementById("thanksModal");
  const thanksOkBtn = document.getElementById("thanksOkBtn");
  const toast = document.getElementById("toast");
  
  const employeeIdInput = document.getElementById("employeeId");
  
  

  usernameInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, ''); // Allow letters and spaces
  });



employeeIdInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  // --- PERSISTENT FORM STATE ---
  const formState = {
    ratings: {},       // ratings[manager][criteria] = number
    improvements: {},  // improvements[manager] = string
    strengths: {}      // strengths[manager] = string
  };
  let prevSelected = new Set();

  function setRating(manager, criteria, value) {
    if (!formState.ratings[manager]) formState.ratings[manager] = {};
    formState.ratings[manager][criteria] = value;
  }
  function getRating(manager, criteria) {
    return formState.ratings[manager]?.[criteria] ?? null;
  }
  function setText(type, manager, value) {
    formState[type][manager] = value;
  }
  function getText(type, manager) {
    return formState[type][manager] ?? "";
  }
  function clearManagerFromState(manager) {
    delete formState.ratings[manager];
    delete formState.improvements[manager];
    delete formState.strengths[manager];
  }

  // Toast
  function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 3000);
  }

  // Criteria
const criteria = [
    "This manager is approachable and easy to talk to",
  "This manager gives useful & constructive feedback",
  "This manager provides required support and guidance when I seek",
  "This manager appreciates my work contributions",
  "This manager treats me with respect and exhibits professionalism",
  "This manager constantly sets the bar high and challenges me",
  "This manager provides effective direction and is an inspiration to me and my team",
  "This manager demonstrates strong competencies ",
  "This manager maintains composure even when working under pressure",
  "I look up to this manager for mentorship"
];

  // Loader + modal
  function showLoader() {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    loaderOverlay.style.display = "flex";
    loaderOverlay.setAttribute("aria-hidden", "false");
  }
  function hideLoader() {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    loaderOverlay.style.display = "none";
    loaderOverlay.setAttribute("aria-hidden", "true");
  }
  function showThanksModal() {
    thanksModal.style.display = "flex";
    thanksModal.setAttribute("aria-hidden", "false");
    setTimeout(() => thanksOkBtn?.focus(), 0);
  }
  function hideThanksModal() {
    thanksModal.style.display = "none";
    thanksModal.setAttribute("aria-hidden", "true");

      if(localStorage.getItem("feedback_submitted")) {
  document.querySelector("form").style.display = "none";
document.body.innerHTML += '<p>✅ Your feedback is submitted. Please reach out to <a style="text-decoration:none" href="mailto:hr@resulticks.com">hr@resulticks.com</a> for any queries.</p>';
}

  }
  thanksOkBtn?.addEventListener("click", hideThanksModal);
  thanksModal?.addEventListener("click", (e) => {
    if (e.target === thanksModal) hideThanksModal();
  });

  // Name block toggle
  function toggleNameBlock() {
    if (!namedBlock) return;
    namedBlock.style.display = anonToggle?.checked ? "none" : "block";
  }
  anonToggle?.addEventListener("change", toggleNameBlock);
  toggleNameBlock();

  // Manager selection (1..5) + render with persistence
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      const selected = Array.from(checkboxes).filter(c => c.checked);

      if (selected.length > 5) {
        showToast("You can select a maximum of 5 managers.");
        cb.checked = false;
        return;
      }

      const currentSet = new Set(selected.map(s => s.value.trim()));
      // clear state of only those removed
      for (const m of prevSelected) {
        if (!currentSet.has(m)) clearManagerFromState(m);
      }
      prevSelected = currentSet;

      if (selected.length > 0) {
        reviewSection.style.display = "block";
        renderTable([...currentSet]);
      } else {
        reviewSection.style.display = "none";
        criteriaBody.innerHTML = "";
      }
    });
  });

  function renderTable(managers) {
    const headerRow = document.querySelector("thead tr");
    if (headerRow) {
      headerRow.innerHTML = "<th>Criteria</th>" + managers.map(m => `<th>${m}</th>`).join("");
    }

    criteriaBody.innerHTML = "";
    criteria.forEach((crit) => {
      const row = document.createElement("tr");
      row.innerHTML =
        `<td>${crit}</td>` +
        managers.map(m => `
          <td>
            <div class="rating" data-manager="${m}" data-criteria="${crit}">
              ${[1,2,3,4].map(num => `<span class="number" data-value="${num}">${num}</span>`).join("")}
            </div>
          </td>`).join("");
      criteriaBody.appendChild(row);
    });

    
    const strengthRow = document.createElement("tr");
    strengthRow.innerHTML =
      `<td>In your opinion what are the manager's key strengths?</td>` +
      managers.map(m => `<td><textarea placeholder="Type Here" data-manager="${m}" data-type="strength"></textarea></td>`).join("");
    criteriaBody.appendChild(strengthRow);

    const improvementRow = document.createElement("tr");
    improvementRow.innerHTML =
      `<td>Your suggestions on areas of improvement for this manager?</td>` +
      managers.map(m => `<td><textarea placeholder="Type Here" data-manager="${m}" data-type="improvement"></textarea></td>`).join("");
    criteriaBody.appendChild(improvementRow);


    attachNumberEvents();

    // --- Rehydrate from state ---
    // stars
    document.querySelectorAll(".rating").forEach(div => {
      const manager = div.dataset.manager;
      const crit = div.dataset.criteria;
      const saved = getRating(manager, crit);
      if (saved) {
        const toSelect = div.querySelector(`.number[data-value="${saved}"]`);
        if (toSelect) {
          div.querySelectorAll(".number").forEach(n => n.classList.remove("selected"));
          toSelect.classList.add("selected");
        }
      }
    });
    // textareas
    document.querySelectorAll('textarea[data-type="improvement"]').forEach(t => {
      t.value = getText("improvements", t.dataset.manager);
    });
    document.querySelectorAll('textarea[data-type="strength"]').forEach(t => {
      t.value = getText("strengths", t.dataset.manager);
    });
  }

  function attachNumberEvents() {
    document.querySelectorAll(".rating .number").forEach(num => {
      num.addEventListener("click", function () {
        const ratingDiv = this.closest(".rating");
        const manager = ratingDiv.dataset.manager;
        const crit = ratingDiv.dataset.criteria;
        const value = Number(this.dataset.value);

        ratingDiv.querySelectorAll(".number").forEach(n => n.classList.remove("selected"));
        this.classList.add("selected");

        ratingDiv.classList.remove("missing");
        ratingDiv.removeAttribute("aria-invalid");

        setRating(manager, crit, value);
      });
    });

    // Persist textareas
    document.querySelectorAll('textarea[data-type="improvement"]').forEach(t => {
      t.addEventListener("input", () => {
        t.classList.remove("missing");
        setText("improvements", t.dataset.manager, t.value);
      });
    });
    document.querySelectorAll('textarea[data-type="strength"]').forEach(t => {
      t.addEventListener("input", () => {
        t.classList.remove("missing");
        setText("strengths", t.dataset.manager, t.value);
      });
    });
  }

  // Validation: ratings + textareas required
  function validateInputs() {
    let isValid = true;

    document.querySelectorAll(".rating").forEach(div => {
      const selected = div.querySelector(".number.selected");
      if (!selected) {
        div.classList.add("missing");
        div.setAttribute("aria-invalid", "true");
        isValid = false;
      } else {
        div.classList.remove("missing");
        div.removeAttribute("aria-invalid");
      }
    });

    document.querySelectorAll('textarea[data-type="improvement"], textarea[data-type="strength"]').forEach(t => {
      if (!t.value.trim()) {
        t.classList.add("missing");
        isValid = false;
      } else {
        t.classList.remove("missing");
      }
    });

    return isValid;
  }

  function getSelectedManagers() {
    return Array.from(checkboxes).filter(c => c.checked).map(c => c.value.trim());
  }
  function collectRatings() {
    const ratings = [];
    document.querySelectorAll(".rating").forEach(ratingDiv => {
      const selected = ratingDiv.querySelector(".number.selected");
      if (selected) {
        ratings.push({
          manager: ratingDiv.dataset.manager,
          criteria: ratingDiv.dataset.criteria,
          rating: Number(selected.dataset.value)
        });
      }
    });
    return ratings;
  }
  function collectTextareas(type) {
    const obj = {};
    document.querySelectorAll(`textarea[data-type="${type}"]`).forEach(t => {
      obj[t.dataset.manager] = (t.value || "").trim();
    });
    return obj;
  }

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (okMsg) okMsg.style.display = "none";
    if (errMsg) errMsg.style.display = "none";

    const managers = getSelectedManagers();
    if (managers.length === 0 || managers.length > 5) {
      if (errMsg) { errMsg.textContent = "Select the managers you want to review"; errMsg.style.display = "block"; }
      else console.log("Select the managers you want to review");
      return;
    }

    const isAnonymous = !!anonToggle?.checked;
    let username = isAnonymous ? "" : (usernameInput?.value || "").trim();
    const employee = isAnonymous ? "" : (employeeIdInput?.value || "").trim();

    // const username = isAnonymous ? "" : `${(usernameInput?.value || "").trim()} - ${employeeIdInput?.value || ""}`;
    if (!isAnonymous && !username) {
      if (errMsg) { errMsg.textContent = "Please enter your name or you can remain anonymous"; errMsg.style.display = "block"; }
      else console.log("Please enter your name or you can remain anonymous");
      return;
    }
    if (!isAnonymous && !employee) {
      if (errMsg) { errMsg.textContent = "Please enter your employee ID or you can remain anonymous"; errMsg.style.display = "block"; }
      else console.log("Please enter your name or you can remain anonymous");
      return;
    }
    username= `${username}  ${employee} `

    if (!validateInputs()) {
      if (errMsg) {
        errMsg.textContent = "Please fill all ratings and comments for each manager.";
        errMsg.style.display = "block";
      } else {
        console.log("Please fill all ratings and comments for each manager.");
      }
      return;
    }

    const extraFeedback = (extraEl?.value || "").trim();
    const ratings = collectRatings();
    const improvements = collectTextareas("improvement");
    const strengths   = collectTextareas("strength");

    const body = new URLSearchParams({
     anonymous: anonToggle.checked ? "YES" : "NO",
      username,
      managers: managers.join(", "),
      ratingsJSON: JSON.stringify(ratings),
      improvementsJSON: JSON.stringify(improvements),
      strengthsJSON: JSON.stringify(strengths),
      extraFeedback,
      ua: navigator.userAgent
    });

    showLoader();
    try {
      await fetch(SCRIPT_URL, { method: "POST", body, mode: "no-cors" });

      showThanksModal();
      if (okMsg) okMsg.style.display = "block";

      // Reset UI
      form.reset();
      toggleNameBlock();
      reviewSection.style.display = "none";
      criteriaBody.innerHTML = "";

      // Reset state
      for (const k of Object.keys(formState.ratings)) delete formState.ratings[k];
      for (const k of Object.keys(formState.improvements)) delete formState.improvements[k];
      for (const k of Object.keys(formState.strengths)) delete formState.strengths[k];
      prevSelected = new Set();
      
       localStorage.setItem("feedback_submitted", "true");
    } catch (err) {
      if (errMsg) {
        errMsg.textContent = "Network error.";
        errMsg.style.display = "block";
      } else {
        console.log("Network error");
      }
    } finally {
      hideLoader();
    }
  });

     if(localStorage.getItem("feedback_submitted")) {
  document.querySelector("form").style.display = "none";
document.body.innerHTML += '<p>✅ Your feedback is submitted. Please reach out to <a href="mailto:hr@resulticks.com">hr@resulticks.com</a> for any queries.</p>';
}
  // Initialize prevSelected from any pre-checked managers (if any)
  prevSelected = new Set(getSelectedManagers());
  if (prevSelected.size > 0) {
    reviewSection.style.display = "block";
    renderTable([...prevSelected]);
  }
});