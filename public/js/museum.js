// Lazy-load art tiles via IntersectionObserver for performance
function initReveal() {
  const tiles = document.querySelectorAll(".art-tile");
  if (!tiles.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("art-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  tiles.forEach((tile) => observer.observe(tile));
}

// Fetch all verified artworks and render chronologically
async function loadMuseum() {
  const grid = document.getElementById("museumGrid");
  const message = document.getElementById("museumMessage");

  try {
    const response = await fetch("/api/museum");
    if (!response.ok) throw new Error("failed");
    const items = await response.json();

    if (!items.length) {
      message.textContent = "The museum is currently empty.";
      return;
    }

    // Template literals construct DOM from API response
    grid.innerHTML = items.map((item) => `
      <a class="art-tile" href="/artwork.html?id=${item.id}">
        <img src="${item.image_path}" alt="${item.title}">
        <div class="art-meta">
          <h3>${item.title}</h3>
          <p>${item.artist_name} · ${item.year_created}</p>
        </div>
      </a>
    `).join("");
    initReveal(); // ATELIER ANIMATION
  } catch (_error) {
    message.textContent = "Could not load museum artworks.";
    message.classList.add("error");
  }
}

loadMuseum();
