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
    const progress = serie.total_episodes === 0
      ? 0
      : Math.min(100, Math.round((serie.current_episode / serie.total_episodes) * 100));

    detailCard.innerHTML = `
      <img class="cover" src="${serie.image_url || getPlaceholderImage()}" alt="Portada de ${serie.name}">
      <section class="card-body">
        <header class="card-header">
          <h2>${serie.name}</h2>
          <span class="rating">${serie.rating}/10</span>
        </header>
        <p class="episodes">${serie.current_episode} de ${serie.total_episodes} episodios</p>
        <progress class="progress-bar" value="${progress}" max="100"></progress>
        <footer class="card-actions">
          <a href="form.html?id=${serie.id}" class="primary link-button">Editar</a>
          <a href="index.html" class="secondary link-button">Volver al listado</a>
        </footer>
      </section>
    `;
  } catch {
    detailCard.innerHTML = `<p class="empty">No se pudo cargar la serie.</p>`;
  }
}

loadDetail();