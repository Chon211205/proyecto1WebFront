const form = document.querySelector("#seriesForm");
const seriesId = document.querySelector("#seriesId");
const nameInput = document.querySelector("#name");
const currentEpisodeInput = document.querySelector("#currentEpisode");
const totalEpisodesInput = document.querySelector("#totalEpisodes");
const imageFileInput = document.querySelector("#imageFile");
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

  try {
    const id = seriesId.value.trim();
    const isEdit = id !== "";

    let imageUrl = "";

    if (isEdit) {
      const currentResponse = await fetch(`${API_URL}/series/${id}`);
      const currentData = await currentResponse.json();

      if (!currentResponse.ok) {
        throw new Error(currentData?.error || "No se pudo cargar la serie actual");
      }

      imageUrl = currentData.image_url || "";
    }

    const file = imageFileInput?.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadResponse.json().catch(() => null);

      if (!uploadResponse.ok) {
        throw new Error(uploadData?.error || "No se pudo subir la imagen");
      }

      imageUrl = uploadData.image_url;
    }

    const payload = {
      name: nameInput.value.trim(),
      current_episode: Number(currentEpisodeInput.value),
      total_episodes: Number(totalEpisodesInput.value),
      image_url: imageUrl
    };

    const url = isEdit ? `${API_URL}/series/${id}` : `${API_URL}/series`;
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "No se pudo guardar la serie");
    }

    const savedSeriesId = isEdit ? Number(id) : data.id;
    const ratingMethod = isEdit ? "PUT" : "POST";

    const ratingResponse = await fetch(`${API_URL}/series/${savedSeriesId}/rating`, {
      method: ratingMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: Number(ratingInput.value) })
    });

    if (!ratingResponse.ok && !(ratingMethod === "POST" && ratingResponse.status === 201)) {
      const ratingData = await ratingResponse.json().catch(() => null);
      throw new Error(ratingData?.error || "No se pudo guardar el rating");
    }

    window.location.href = "index.html";
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

async function loadSeriesForEdit() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    formTitle.textContent = "Agregar serie";
    ratingValue.textContent = ratingInput.value;
    return;
  }

  formTitle.textContent = "Editar serie";
  seriesId.value = id;

  try {
    const response = await fetch(`${API_URL}/series/${id}`);
    const serie = await response.json();

    if (!response.ok) {
      throw new Error(serie?.error || "No se pudo cargar la serie");
    }

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

    nameInput.value = serie.name;
    currentEpisodeInput.value = serie.current_episode;
    totalEpisodesInput.value = serie.total_episodes;
    ratingInput.value = rating;
    ratingValue.textContent = rating;
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

loadSeriesForEdit();