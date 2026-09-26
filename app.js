(() => {
  "use strict";

  const STORAGE_KEY = "autojob-applications-v1";
  const initialApplications = [
    { id: "sample-1", role: "AI Engineer", company: "Sample company", status: "Interview", followUp: "2026-09-29", notes: "Prepare examples of production AI work." },
    { id: "sample-2", role: "Frontend Developer", company: "Sample company", status: "Applied", followUp: "2026-09-30", notes: "Send a brief follow-up this week." },
    { id: "sample-3", role: "Security Analyst", company: "Sample company", status: "Saved", followUp: "", notes: "Review the role requirements." },
    { id: "sample-4", role: "Full-stack Engineer", company: "Sample company", status: "Applied", followUp: "", notes: "" },
    { id: "sample-5", role: "Machine Learning Engineer", company: "Sample company", status: "Interview", followUp: "2026-10-02", notes: "Second conversation." }
  ];
  const allowedStatuses = new Set(["Saved", "Applied", "Interview", "Rejected"]);
  const list = document.querySelector("#application-list");
  const emptyState = document.querySelector("#empty-state");
  const dialog = document.querySelector("#application-dialog");
  const form = document.querySelector("#application-form");
  let activeFilter = "All";
  let applications = loadApplications();

  function loadApplications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isValidApplication)) return parsed;
      }
    } catch (error) {
      console.warn("AutoJob could not read saved data; loading sample applications.", error);
    }
    return structuredClone(initialApplications);
  }

  function isValidApplication(item) {
    return item && typeof item.id === "string" && typeof item.role === "string" &&
      typeof item.company === "string" && allowedStatuses.has(item.status) &&
      typeof item.followUp === "string" && typeof item.notes === "string";
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
      return true;
    } catch (error) {
      alert("Your browser could not save this change. Export your data or free some browser storage, then try again.");
      console.error("AutoJob could not save data.", error);
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function formatDate(value) {
    if (!value) return "—";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  }

  function render() {
    const search = document.querySelector("#search-input").value.trim().toLowerCase();
    const filtered = applications.filter(item => {
      const matchesStatus = activeFilter === "All" || item.status === activeFilter;
      const matchesSearch = `${item.role} ${item.company} ${item.notes}`.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
    list.innerHTML = filtered.map(item => `<tr>
      <td class="role-cell"><b>${escapeHtml(item.role)}</b><small>${escapeHtml(item.company)}</small></td>
      <td><select class="status-select status-${escapeHtml(item.status)}" data-status-id="${escapeHtml(item.id)}" aria-label="Status for ${escapeHtml(item.role)} at ${escapeHtml(item.company)}">${["Saved", "Applied", "Interview", "Rejected"].map(status => `<option${status === item.status ? " selected" : ""}>${status}</option>`).join("")}</select></td>
      <td class="date-cell">${escapeHtml(formatDate(item.followUp))}</td>
      <td class="note-cell" title="${escapeHtml(item.notes)}">${escapeHtml(item.notes || "—")}</td>
      <td><button class="delete-button" type="button" data-delete-id="${escapeHtml(item.id)}" aria-label="Delete ${escapeHtml(item.role)} at ${escapeHtml(item.company)}">×</button></td>
    </tr>`).join("");
    emptyState.hidden = filtered.length > 0;
    document.querySelector("#count-all").textContent = String(applications.length);
    document.querySelectorAll("[data-filter]").forEach(button => {
      const count = applications.filter(item => button.dataset.filter === "All" || item.status === button.dataset.filter).length;
      const existingCount = button.querySelector("span");
      if (existingCount) existingCount.textContent = String(count);
      button.classList.toggle("selected", button.dataset.filter === activeFilter);
      button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
    });
    document.querySelector("#mock-total").textContent = String(applications.length).padStart(2, "0");
    document.querySelector("#mock-active").textContent = String(applications.filter(item => ["Applied", "Interview"].includes(item.status)).length).padStart(2, "0");
    document.querySelector("#mock-followup").textContent = String(applications.filter(item => item.followUp && ["Applied", "Interview"].includes(item.status)).length).padStart(2, "0");
  }

  document.querySelector("#add-button").addEventListener("click", () => dialog.showModal());
  document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
  document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  document.querySelector("#search-input").addEventListener("input", render);
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  }));
  list.addEventListener("change", event => {
    const id = event.target.dataset.statusId;
    if (!id || !allowedStatuses.has(event.target.value)) return;
    const previousStatus = applications.find(item => item.id === id)?.status;
    applications = applications.map(item => item.id === id ? { ...item, status: event.target.value } : item);
    if (!persist()) applications = applications.map(item => item.id === id ? { ...item, status: previousStatus } : item);
    render();
  });
  list.addEventListener("click", event => {
    const id = event.target.dataset.deleteId;
    if (!id) return;
    const previous = applications;
    applications = applications.filter(item => item.id !== id);
    if (!persist()) applications = previous;
    render();
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const application = {
      id: crypto.randomUUID ? crypto.randomUUID() : `application-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: String(data.get("role")).trim(),
      company: String(data.get("company")).trim(),
      status: String(data.get("status")),
      followUp: String(data.get("followUp")),
      notes: String(data.get("notes")).trim()
    };
    if (!application.role || !application.company || !allowedStatuses.has(application.status)) return;
    applications = [application, ...applications];
    if (persist()) {
      form.reset();
      activeFilter = "All";
      document.querySelector("#search-input").value = "";
      dialog.close();
      render();
    } else {
      applications = applications.filter(item => item.id !== application.id);
    }
  });
  document.querySelector("#export-button").addEventListener("click", () => {
    const blob = new Blob([`${JSON.stringify(applications, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "autojob-applications.json";
    link.click();
    URL.revokeObjectURL(url);
  });
  document.querySelector("#reset-demo").addEventListener("click", () => {
    const previous = applications;
    applications = structuredClone(initialApplications);
    if (!persist()) applications = previous;
    activeFilter = "All";
    document.querySelector("#search-input").value = "";
    render();
  });

  render();
})();
