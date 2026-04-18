const detailCard = document.querySelector("#detailCard");

async function loadDetail() {
  const id = getQueryParam("id");

  if (!id) {
    detailCard.innerHTML = `<p class="empty">No se especificó una serie.</p>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/series/${id}`);
    if (!response.ok) throw new Error("No se pudo cargar la serie");

    const serie = await response.json();

    let rating = 0;
    try {
      const ratingResponse = await fetch(`${API_URL}/series/${id}/rating`);
      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        rating = ratingData.rating;
      }
    } catch {
      rating = 0;
    }

    serie.rating = rating;
    renderDetail(serie);
  } catch (error) {
    detailCard.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

function renderDetail(serie) {
  const progress =
    serie.total_episodes === 0
      ? 0
      : Math.min(
          100,
          Math.round((serie.current_episode / serie.total_episodes) * 100)
        );

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

  updateRatingStyle(ratingInput);

  ratingInput.addEventListener("input", () => {
    ratingValue.textContent = ratingInput.value;
    updateRatingStyle(ratingInput);
  });

  currentEpisodeInput.addEventListener("input", () => {
    updateProgressPreview(currentEpisodeInput, totalEpisodesInput, progressBar);
  });

  totalEpisodesInput.addEventListener("input", () => {
    updateProgressPreview(currentEpisodeInput, totalEpisodesInput, progressBar);
  });

  saveButton.addEventListener("click", () => {
    saveDetailChanges(serie.id);
  });
}

function updateProgressPreview(currentInput, totalInput, progressBar) {
  const current = Number(currentInput.value);
  const total = Number(totalInput.value);

  const progress =
    total === 0
      ? 0
      : Math.min(100, Math.round((current / total) * 100));

  progressBar.value = progress;
}

function updateRatingStyle(input) {
  const value = Number(input.value);
  const percent = (value / 10) * 100;
  const styles = getComputedStyle(document.body);
  const accent = styles.getPropertyValue("--accent").trim();
  const soft = styles.getPropertyValue("--soft").trim();

  input.style.background = `linear-gradient(to right, ${accent} ${percent}%, ${soft} ${percent}%)`;
}

async function saveSeriesChanges(id, payload) {
  const response = await fetch(`${API_URL}/series/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo guardar la serie");
  }

  return data;
}

async function saveRatingChanges(id, rating) {
  let response = await fetch(`${API_URL}/series/${id}/rating`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ rating })
  });

  if (response.status === 404) {
    response = await fetch(`${API_URL}/series/${id}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rating })
    });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok && response.status !== 201) {
    throw new Error(data?.error || "No se pudo guardar el rating");
  }

  return data;
}

async function saveDetailChanges(id) {
  const currentEpisodeInput = document.querySelector("#detailCurrentEpisode");
  const totalEpisodesInput = document.querySelector("#detailTotalEpisodes");
  const ratingInput = document.querySelector("#detailRating");
  const message = document.querySelector("#detailMessage");

  message.textContent = "";

  try {
    const currentSeriesResponse = await fetch(`${API_URL}/series/${id}`);
    if (!currentSeriesResponse.ok) {
      throw new Error("No se pudo obtener la serie actual");
    }

    const currentSerie = await currentSeriesResponse.json();

    const updatedSerie = await saveSeriesChanges(id, {
      name: currentSerie.name,
      current_episode: Number(currentEpisodeInput.value),
      total_episodes: Number(totalEpisodesInput.value),
      image_url: currentSerie.image_url
    });

    const updatedRating = await saveRatingChanges(id, Number(ratingInput.value));

    updatedSerie.rating = updatedRating.rating;
    renderDetail(updatedSerie);

    const updatedMessage = document.querySelector("#detailMessage");
    updatedMessage.textContent = "Cambios guardados correctamente.";
  } catch (error) {
    message.textContent = error.message;
  }
}

if (detailCard) {
  loadDetail();
}