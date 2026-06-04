function readArtworkId() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function loadArtwork() {
  const container = document.getElementById("artworkContainer");
  const message = document.getElementById("artworkMessage");
  const artworkId = readArtworkId();

  if (!artworkId) {
    message.textContent = "Invalid artwork link.";
    message.classList.add("error");
    return;
  }

  try {
    const response = await fetch(`/api/artworks/${artworkId}`);
    if (!response.ok) throw new Error("failed");
    const item = await response.json();

    document.title = `${item.title} | ATELIER`;
    container.innerHTML = `
      <figure class="detail-image">
        <img src="${item.image_path}" alt="${item.title}">
      </figure>
      <article class="panel">
        <h1>${item.title}</h1>
        <p><strong>Artist:</strong> ${item.artist_name}</p>
        <p><strong>Year:</strong> ${item.year_created}</p>
        <p><strong>Medium:</strong> ${item.medium}</p>
        <p>${item.description || "No description provided."}</p>
      </article>
    `;

    // ATELIER ANIMATION — reveal detail image as it enters the viewport
    const detailImage = container.querySelector(".detail-image");
    if (detailImage) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("art-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      observer.observe(detailImage);
    }
  } catch (_error) {
    message.textContent = "Artwork could not be loaded.";
    message.classList.add("error");
  }
}

loadArtwork();
