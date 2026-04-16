const state = {
  series: [],
};

const apiStatus = document.querySelector("#apiStatus");
const refreshButton = document.querySelector("#refreshButton");
const seriesList = document.querySelector("#seriesList");
const template = document.querySelector("#seriesTemplate");

refreshButton.addEventListener("click", loadSeries);

async function loadSeries() {
  setStatus(apiStatus, "Conectando API...");

  try {
    const response = await fetch(`${API_URL}/series`);
    if (!response.ok) throw new Error();

    state.series = await response.json();
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
    const title = node.querySelector("h3");
    const rating = node.querySelector(".rating");
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
    rating.textContent = `${serie.rating}/10`;
    episodes.textContent = `${serie.current_episode} de ${serie.total_episodes} episodios`;
    progressBar.value = progress;
    progressBar.max = 100;

    viewButton.addEventListener("click", () => {
      window.location.href = `detalle.html?id=${serie.id}`;
    });

    editButton.addEventListener("click", () => {
      window.location.href = `form.html?id=${serie.id}`;
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

loadSeries();