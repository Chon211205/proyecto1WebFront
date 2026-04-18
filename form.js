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
    let imageUrl = "";

    const file = imageFileInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "No se pudo subir la imagen");
      }

      imageUrl = uploadData.image_url;
    }

    const payload = {
      name: nameInput.value.trim(),
      current_episode: Number(currentEpisodeInput.value),
      total_episodes: Number(totalEpisodesInput.value),
      image_url: imageUrl
    };

    const id = seriesId.value.trim();
    const isEdit = id !== "";
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

    // Rating separado
    const rating = Number(ratingInput.value);
    const savedSeriesId = isEdit ? Number(id) : data.id;

    const ratingResponse = await fetch(`${API_URL}/series/${savedSeriesId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating })
    });

    if (!ratingResponse.ok && ratingResponse.status !== 201) {
      const ratingData = await ratingResponse.json().catch(() => null);
      throw new Error(ratingData?.error || "No se pudo guardar el rating");
    }

    window.location.href = "index.html";
  } catch (error) {
    formMessage.textContent = error.message;
  }
});