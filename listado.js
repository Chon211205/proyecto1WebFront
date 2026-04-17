const state = {
  series: [],
  q: ""
};

const apiStatus = document.querySelector("#apiStatus");
const refreshButton = document.querySelector("#refreshButton");
const seriesList = document.querySelector("#seriesList");
const template = document.querySelector("#seriesTemplate");
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const clearSearch = document.querySelector("#clearSearch");

refreshButton.addEventListener("click", loadSeries);

async function loadSeries() {
  setStatus(apiStatus, "Conectando API...");

  //Recibe los datos desde el back (adaptado con paginacion)
  try {
    const response = await fetch(`${API_URL}/series?page=1&limit=20`);
    if (!response.ok) throw new Error();

    const result = await response.json();
    state.series = result.data; 

    renderSeries();
    setStatus(apiStatus, "API conectada", "ok");
  } catch {
    state.series = [];
    renderSeries();
    setStatus(apiStatus, "API no disponible", "error");
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
    const cover = node.querySelector(".cover");
    const title = node.querySelector(".imdb-title");
    const rating = node.querySelector(".imdb-rating");
    const episodes = node.querySelector(".episodes");
    const progressBar = node.querySelector(".progress-bar");
    const viewButton = node.querySelector(".view");
    const editButton = node.querySelector(".edit");
    const deleteButton = node.querySelector(".delete");

    const progress = serie.total_episodes === 0
      ? 0
      : Math.min(100, Math.round((serie.current_episode / serie.total_episodes) * 100));

    cover.src = serie.image_url || getPlaceholderImage();
    cover.alt = `Portada de ${serie.name}`;
    title.textContent = serie.name;
    rating.textContent = `⭐ ${serie.rating}/10`;
    episodes.textContent = `${serie.current_episode} de ${serie.total_episodes} episodios`;
    progressBar.value = progress;
    progressBar.max = 100;

    viewButton.addEventListener("click", () => {
      window.location.href = `detalle.html?id=${serie.id}`;
    });

    editButton.addEventListener("click", () => {
      window.location.href = `form.html?id=${serie.id}`;
    });

    searchButton.addEventListener("click", () => {
      state.q = searchInput.value.trim();
      loadSeries();
    });

    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      state.q = "";
      loadSeries();
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        state.q = searchInput.value.trim();
        loadSeries();
      }
    });

    deleteButton.addEventListener("click", () => deleteSeries(serie.id));

    seriesList.append(node);
  });
}

async function deleteSeries(id) {
  const confirmed = confirm("Eliminar esta serie?");
  if (!confirmed) return;

  const response = await fetch(`${API_URL}/series/${id}`, { method: "DELETE" });
  if (response.ok) {
    await loadSeries();
  }
}

async function loadSeries() {
  setStatus(apiStatus, "Conectando API...");

  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "20"
    });

    if (state.q) {
      params.set("q", state.q);
    }

    const response = await fetch(`${API_URL}/series?${params.toString()}`);
    if (!response.ok) throw new Error("La API no respondio correctamente");

    const result = await response.json();
    state.series = result.data;

    renderSeries();
    setStatus(apiStatus, "API conectada", "ok");
  } catch (error) {
    state.series = [];
    renderSeries();
    setStatus(apiStatus, "API no disponible", "error");
  }
}