const detailCard = document.querySelector("#detailCard");

async function loadDetail() {
  const id = getQueryParam("id");

  if (!id) {
    detailCard.innerHTML = `<p class="empty">No se especificó una serie.</p>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/series/${id}`);
    if (!response.ok) throw new Error();

    const serie = await response.json();
    renderDetail(serie);
  } catch {
    detailCard.innerHTML = `<p class="empty">No se pudo cargar la serie.</p>`;
  }
}

function renderDetail(serie) {
  const progress = serie.total_episodes === 0
    ? 0
    : Math.min(100, Math.round((serie.current_episode / serie.total_episodes) * 100));

  detailCard.innerHTML = `
    <img class="cover detail-cover" src="${serie.image_url || getPlaceholderImage()}" alt="Portada de ${serie.name}">
    <section class="card-body detail-body">
      <header class="card-header">
        <h2>${serie.name}</h2>
      </header>

      <label class="detail-field">
        Episodio actual
        <input id="detailCurrentEpisode" type="number" min="0" value="${serie.current_episode}">
      </label>

      <label class="detail-field">
        Total de episodios
        <input id="detailTotalEpisodes" type="number" min="0" value="${serie.total_episodes}">
      </label>

      <label class="detail-field">
        Rating: <span id="detailRatingValue">${serie.rating}</span>/10
        <input id="detailRating" type="range" min="0" max="10" value="${serie.rating}">
      </label>

      <progress id="detailProgress" class="progress-bar" value="${progress}" max="100"></progress>

      <p id="detailMessage" class="message"></p>

      <footer class="card-actions">
        <button id="saveDetail" class="primary" type="button">Guardar cambios</button>
        <a href="index.html" class="secondary link-button">Volver al listado</a>
      </footer>
    </section>
  `;

  const ratingInput = document.querySelector("#detailRating");
  const ratingValue = document.querySelector("#detailRatingValue");
  const currentEpisodeInput = document.querySelector("#detailCurrentEpisode");
  const totalEpisodesInput = document.querySelector("#detailTotalEpisodes");
  const progressBar = document.querySelector("#detailProgress");
  const saveButton = document.querySelector("#saveDetail");

  ratingInput.addEventListener("input", () => {
    ratingValue.textContent = ratingInput.value;
  });

  currentEpisodeInput.addEventListener("input", () => {
    updateProgressPreview(currentEpisodeInput, totalEpisodesInput, progressBar);
  });

  totalEpisodesInput.addEventListener("input", () => {
    updateProgressPreview(currentEpisodeInput, totalEpisodesInput, progressBar);
  });

  saveButton.addEventListener("click", () => {
    saveDetailChanges(serie);
  });
}

function updateProgressPreview(currentInput, totalInput, progressBar) {
  const current = Number(currentInput.value);
  const total = Number(totalInput.value);

  const progress = total === 0
    ? 0
    : Math.min(100, Math.round((current / total) * 100));

  progressBar.value = progress;
}

async function saveDetailChanges(serie) {
  const currentEpisodeInput = document.querySelector("#detailCurrentEpisode");
  const totalEpisodesInput = document.querySelector("#detailTotalEpisodes");
  const ratingInput = document.querySelector("#detailRating");
  const message = document.querySelector("#detailMessage");

  message.textContent = "";

  const payload = {
    name: serie.name,
    current_episode: Number(currentEpisodeInput.value),
    total_episodes: Number(totalEpisodesInput.value),
    image_url: serie.image_url,
    rating: Number(ratingInput.value),
  };

  try {
    const response = await fetch(`${API_URL}/series/${serie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "No se pudo guardar");
    }

    const updatedSerie = await response.json();
    renderDetail(updatedSerie);

    const updatedMessage = document.querySelector("#detailMessage");
    updatedMessage.textContent = "Cambios guardados correctamente.";
  } catch (error) {
    message.textContent = error.message;
  }
}

loadDetail();