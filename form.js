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

ratingInput.addEventListener("input", () => {
  ratingValue.textContent = ratingInput.value;
});

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

    window.location.href = "index.html";
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

async function loadSeriesForEdit() {
  const id = getQueryParam("id");
  if (!id) return;

  formTitle.textContent = "Editar serie";
  seriesId.value = id;

  const response = await fetch(`${API_URL}/series/${id}`);
  if (!response.ok) return;

  const serie = await response.json();

  nameInput.value = serie.name;
  currentEpisodeInput.value = serie.current_episode;
  totalEpisodesInput.value = serie.total_episodes;
  imageUrlInput.value = serie.image_url;
  ratingInput.value = serie.rating;
  ratingValue.textContent = serie.rating;
}

loadSeriesForEdit();