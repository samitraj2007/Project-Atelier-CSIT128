const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 10;

// Reset all error messages in form
function clearErrors(form) {
  form.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
}

// Render field-specific validation message
function setError(form, field, message) {
  const slot = form.querySelector(`[data-error-for="${field}"]`);
  if (slot) slot.textContent = message;
}

// Accumulate validation errors before network request
function clientValidate(form) {
  const errors = {};
  const data = new FormData(form);
  const year = Number(data.get("year_created"));
  const currentYear = new Date().getFullYear();
  const image = form.image.files[0];

  if (!String(data.get("artist_name") || "").trim()) errors.artist_name = "Artist name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("artist_email") || "").trim())) {
    errors.artist_email = "Enter a valid email.";
  }
  if (!String(data.get("title") || "").trim()) errors.title = "Artwork title is required.";
  if (!Number.isInteger(year) || year < 1000 || year > currentYear) errors.year_created = "Enter a valid year.";
  if (!String(data.get("medium") || "").trim()) errors.medium = "Please choose a medium.";
  if (String(data.get("description") || "").length > 500) errors.description = "Maximum 500 characters.";
  if (!image) {
    errors.image = "Artwork image is required.";
  } else {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) errors.image = "Allowed formats: JPG, PNG, WEBP.";
    if (image.size > MAX_MB * 1024 * 1024) errors.image = "Image must be 10MB or smaller.";
  }
  if (!form.originality_confirmed.checked) errors.originality_confirmed = "Please confirm originality.";

  return errors;
}

const form = document.getElementById("submitForm");
const message = document.getElementById("submitMessage");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors(form);
  message.textContent = "";

  const errors = clientValidate(form);
  // Halt submission if validation errors exist
  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([key, text]) => setError(form, key, text));
    return;
  }

  const payload = new FormData(form);
  try {
    const response = await fetch("/api/submit-artwork", {
      method: "POST",
      body: payload
    });
    const result = await response.json();

    // Server-side validation errors or submission failure
    if (!response.ok) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, text]) => setError(form, key, text));
      } else {
        message.textContent = result.error || "Submission failed.";
        message.className = "message error";
      }
      return;
    }

    form.reset();
    submitBtn.disabled = true;
    message.textContent = `Submission received. Reference ID: #${result.submissionId}`;
    message.className = "message success";
  } catch (_error) {
    // Connection or parsing error
    message.textContent = "Network error while submitting artwork.";
    message.className = "message error";
  }

});
const checkbox = document.getElementById("originality_confirmed");
const submitBtn = document.getElementById("submitBtn");
// Toggle submit button based on originality checkbox
checkbox.addEventListener("change", () => {
  submitBtn.disabled = !checkbox.checked;
});