const pendingList = document.getElementById("pendingList");
const message = document.getElementById("dashboardMessage");
const logoutBtn = document.getElementById("logoutBtn");

// Prevent XSS by encoding HTML special characters
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// POST verify or reject action to server
async function moderateArtwork(id, action) {
  const response = await fetch(`/api/admin/${action}/${id}`, { method: "POST" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Action failed.");
  return result;
}

// Render pending submissions as grid of cards
function renderPending(items) {
  if (!items.length) {
    pendingList.innerHTML = "<p>No pending submissions.</p>";
    return;
  }

  // Template literal constructs submission cards with image, metadata, and actions
  pendingList.innerHTML = items.map((item) => `
    <article class="pending-item" data-id="${item.id}">
      <img src="${item.image_path}" alt="${escapeHtml(item.title)}">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p><strong>${escapeHtml(item.artist_name)}</strong> · ${item.year_created} · ${escapeHtml(item.medium)}</p>
        <p>${escapeHtml(item.artist_email)}</p>
        <p>${escapeHtml(item.description || "No description provided.")}</p>
      </div>
      <div class="actions">
        <button class="button" data-action="verify">Verify</button>
        <button class="button secondary" data-action="reject">Reject</button>
      </div>
    </article>
  `).join("");
}

// Fetch pending submissions; redirect if auth token expired (401)
async function loadPending() {
  try {
    const response = await fetch("/api/admin/pending");
    if (response.status === 401) {
      window.location.href = "/admin-login.html";
      return;
    }
    if (!response.ok) throw new Error("Failed");
    const items = await response.json();
    renderPending(items);
  } catch (_error) {
    message.textContent = "Could not load pending submissions.";
    message.className = "message error";
  }
}

// Event delegation: capture verify/reject button clicks on pending cards
pendingList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) return;

  const card = actionButton.closest("[data-id]");
  const id = card ? card.dataset.id : null;
  const action = actionButton.dataset.action;
  if (!id || !action) return;

  actionButton.disabled = true;
  try {
    await moderateArtwork(id, action);
    message.textContent = action === "verify"
      ? "Artwork verified. Museum will auto-update on next load."
      : "Artwork rejected.";
    message.className = "message success";
    await loadPending();
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
    actionButton.disabled = false;
  }
});

// Clear session and return to login
logoutBtn.addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin-login.html";
});

loadPending();
