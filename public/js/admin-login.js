function setError(form, field, message) {
  const slot = form.querySelector(`[data-error-for="${field}"]`);
  if (slot) slot.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
}

const form = document.getElementById("adminLoginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors(form);
  message.textContent = "";

  const username = form.username.value.trim();
  const password = form.password.value;

  if (!username) setError(form, "username", "Username is required.");
  if (!password) setError(form, "password", "Password is required.");
  if (!username || !password) return;

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.error || "Login failed.";
      message.className = "message error";
      return;
    }

    message.textContent = "Login successful. Redirecting to dashboard...";
    message.className = "message success";
    window.location.href = "/admin-dashboard.html";
  } catch (_error) {
    message.textContent = "Network error while logging in.";
    message.className = "message error";
  }
});
