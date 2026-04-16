const API_URL = "http://localhost:8080";

const state = {
  series: [],
};

const form = document.querySelector("#seriesForm");
const seriesId = document.querySelector("#seriesId");
const nameInput = document.querySelector("#name");
const currentEpisodeInput = document.querySelector("#currentEpisode");
const totalEpisodesInput = document.querySelector("#totalEpisodes");
const imageUrlInput = document.querySelector("#imageUrl");
const ratingInput = document.querySelector("#rating");
const ratingValue = document.querySelector("#ratingValue");
const formTitle = document.querySelector("#formTitle");
const formMessage = document.querySelector("#formMessage");
const cancelEdit = document.querySelector("#cancelEdit");
const refreshButton = document.querySelector("#refreshButton");
const apiStatus = document.querySelector("#apiStatus");
const seriesList = document.querySelector("#seriesList");
const template = document.querySelector("#seriesTemplate");

ratingInput.addEventListener("input", () => {
  ratingValue.textContent = ratingInput.value;
});

refreshButton.addEventListener("click", loadSeries);
cancelEdit.addEventListener("click", resetForm);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const payload = {
    name: nameInput.value.trim(),
    current_episode: Number(currentEpisodeInput.value),
    total_episodes: Number(totalEpisodesInput.value),
    image_url: imageUrlInput.value.trim(),
    rating: Number(ratingInput.value),
  };

  const id = seriesId.value;
  const url = id ? `${API_URL}/series/${id}` : `${API_URL}/series`;
  const method = id ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "No se pudo guardar la serie");
    }

    resetForm();
    await loadSeries();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

async function loadSeries() {
  setStatus("Conectando API...", "");

  try {
    const response = await fetch(`${API_URL}/series`);
    if (!response.ok) throw new Error("La API no respondio correctamente");

    state.series = await response.json();
    renderSeries();
    setStatus("API conectada", "ok");
  } catch (error) {
    state.series = [];
    renderSeries();
    setStatus("API no disponible", "error");
  }
}

function renderSeries() {
  seriesList.replaceChildren();

  if (state.series.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No hay series guardadas.";
    seriesList.append(empty);
    return;
  }

  state.series.forEach((serie) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".card");
    const cover = node.querySelector(".cover");
    const title = node.querySelector("h3");
    const rating = node.querySelector(".rating");
    const episodes = node.querySelector(".episodes");
    const progressBar = node.querySelector(".progress-bar");
    const editButton = node.querySelector(".edit");
    const deleteButton = node.querySelector(".delete");

    const progress = serie.total_episodes === 0
      ? 0
      : Math.min(100, Math.round((serie.current_episode / serie.total_episodes) * 100));

    cover.src = serie.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23dfe8eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='28' fill='%2352616b'%3ESin imagen%3C/text%3E%3C/svg%3E";
    cover.alt = `Portada de ${serie.name}`;
    title.textContent = serie.name;
    rating.textContent = `${serie.rating}/10`;
    episodes.textContent = `${serie.current_episode} de ${serie.total_episodes} episodios`;

    progressBar.max = 100;
    progressBar.value = progress;

    editButton.addEventListener("click", () => startEdit(serie));
    deleteButton.addEventListener("click", () => deleteSeries(serie.id));
    card.dataset.id = serie.id;

    seriesList.append(node);
  });
}

function startEdit(serie) {
  seriesId.value = serie.id;
  nameInput.value = serie.name;
  currentEpisodeInput.value = serie.current_episode;
  totalEpisodesInput.value = serie.total_episodes;
  imageUrlInput.value = serie.image_url;
  ratingInput.value = serie.rating;
  ratingValue.textContent = serie.rating;
  formTitle.textContent = "Editar serie";
  cancelEdit.hidden = false;
  nameInput.focus();
}

async function deleteSeries(id) {
  const confirmed = confirm("Eliminar esta serie?");
  if (!confirmed) return;

  await fetch(`${API_URL}/series/${id}`, { method: "DELETE" });
  await loadSeries();
}

function resetForm() {
  form.reset();
  seriesId.value = "";
  ratingInput.value = 5;
  ratingValue.textContent = "5";
  formTitle.textContent = "Agregar serie";
  formMessage.textContent = "";
  cancelEdit.hidden = true;
}

function setStatus(text, className) {
  apiStatus.textContent = text;
  apiStatus.className = `status ${className}`.trim();
}

loadSeries();