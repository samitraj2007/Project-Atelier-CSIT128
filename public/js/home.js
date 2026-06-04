// ATELIER ANIMATION — reveal art tiles as they enter the viewport
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

async function loadFeaturedWorks() {
  const grid = document.getElementById("featuredGrid");
  const message = document.getElementById("featuredMessage");

  try {
    const response = await fetch("/api/home-featured");
    if (!response.ok) throw new Error("failed");
    const items = await response.json();

    if (!items.length) {
      message.textContent = "No verified works yet. Check back soon.";
      return;
    }

    grid.innerHTML = items.map((item) => `
      <a class="art-tile" href="/artwork.html?id=${item.id}">
        <img src="${item.image_path}" alt="${item.title}">
        <div class="art-meta">
          <h3>${item.title}</h3>
          <p>${item.artist_name}</p>
        </div>
      </a>
    `).join("");
    initReveal(); // ATELIER ANIMATION
  } catch (_error) {
    message.textContent = "Featured artworks are currently unavailable.";
    message.classList.add("error");
  }
}

loadFeaturedWorks();
