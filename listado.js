const state = {
  series: [],
  page: 1,
  limit: 20,
  q: "",
  sort: "",
  order: "desc"
};

const apiStatus = document.querySelector("#apiStatus");
const refreshButton = document.querySelector("#refreshButton");
const seriesList = document.querySelector("#seriesList");
const template = document.querySelector("#seriesTemplate");

const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const clearSearch = document.querySelector("#clearSearch");

const sortSelect = document.querySelector("#sortSelect");
const orderSelect = document.querySelector("#orderSelect");

const exportCsvButton = document.querySelector("#exportCsvButton");

const exportExcelButton = document.querySelector("#exportExcelButton");

refreshButton.addEventListener("click", loadSeries);

searchButton.addEventListener("click", () => {
  state.page = 1;
  state.q = searchInput.value.trim();
  state.sort = sortSelect.value;
  state.order = orderSelect.value || "desc";
  loadSeries();
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "";
  orderSelect.value = "desc";

  state.page = 1;
  state.q = "";
  state.sort = "";
  state.order = "desc";

  loadSeries();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    state.page = 1;
    state.q = searchInput.value.trim();
    state.sort = sortSelect.value;
    state.order = orderSelect.value || "desc";
    loadSeries();
  }
});

async function loadSeries() {
  setStatus(apiStatus, "Conectando API...");

  try {
    const params = new URLSearchParams({
      page: String(state.page),
      limit: String(state.limit)
    });

    if (state.q) {
      params.set("q", state.q);
    }

    if (state.sort) {
      params.set("sort", state.sort);
    }

    if (state.order) {
      params.set("order", state.order);
    }

    const response = await fetch(`${API_URL}/series?${params.toString()}`);
    if (!response.ok) {
      throw new Error("La API no respondio correctamente");
    }

    const result = await response.json();
    state.series = result.data || [];

    renderSeries();
    setStatus(apiStatus, "API conectada", "ok");
  } catch (error) {
    state.series = [];
    renderSeries();
    setStatus(apiStatus, "API no disponible", "error");
    console.error(error);
  }
}

function exportSeriesToCsv() {
  if (!state.series || state.series.length === 0) {
    alert("No hay series para exportar.");
    return;
  }

  const headers = [
    "id",
    "name",
    "current_episode",
    "total_episodes",
    "image_url",
    "rating"
  ];

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    const text = String(value);
    const escaped = text.replace(/"/g, '""');

    if (/[",\n]/.test(escaped)) {
      return `"${escaped}"`;
    }

    return escaped;
  };

  const rows = state.series.map((serie) => [
    escapeCsvValue(serie.id),
    escapeCsvValue(serie.name),
    escapeCsvValue(serie.current_episode),
    escapeCsvValue(serie.total_episodes),
    escapeCsvValue(serie.image_url),
    escapeCsvValue(serie.rating)
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  const csvWithBom = "\uFEFF" + csvContent;

  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "series.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function exportSeriesToSpreadsheetML() {
  if (!state.series || state.series.length === 0) {
    alert("No hay series para exportar.");
    return;
  }

  const escapeXml = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const headers = [
    "ID",
    "Nombre",
    "Episodio actual",
    "Total episodios",
    "Imagen",
    "Rating"
  ];

  const headerCells = headers.map((header) => `
      <Cell ss:StyleID="Header">
        <Data ss:Type="String">${escapeXml(header)}</Data>
      </Cell>
    `).join("");

  const dataRows = state.series.map((serie) => `
    <Row>
      <Cell><Data ss:Type="Number">${serie.id ?? 0}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(serie.name)}</Data></Cell>
      <Cell><Data ss:Type="Number">${serie.current_episode ?? 0}</Data></Cell>
      <Cell><Data ss:Type="Number">${serie.total_episodes ?? 0}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(serie.image_url ?? "")}</Data></Cell>
      <Cell><Data ss:Type="Number">${serie.rating ?? 0}</Data></Cell>
    </Row>
  `).join("");

  const xml = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook
      xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:html="http://www.w3.org/TR/REC-html40">
      <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
        <Author>Series Tracker</Author>
        <Created>${new Date().toISOString()}</Created>
      </DocumentProperties>
      <Styles>
        <Style ss:ID="Default" ss:Name="Normal">
          <Alignment ss:Vertical="Bottom"/>
          <Borders/>
          <Font ss:FontName="Calibri" ss:Size="11"/>
          <Interior/>
          <NumberFormat/>
          <Protection/>
        </Style>

        <Style ss:ID="Header">
          <Font ss:Bold="1" ss:Color="#000000"/>
          <Interior ss:Color="#F5C518" ss:Pattern="Solid"/>
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        </Style>
      </Styles>

      <Worksheet ss:Name="Series">
        <Table>
          <Column ss:Width="50"/>
          <Column ss:Width="180"/>
          <Column ss:Width="110"/>
          <Column ss:Width="110"/>
          <Column ss:Width="260"/>
          <Column ss:Width="60"/>

          <Row>
            ${headerCells}
          </Row>

          ${dataRows}
        </Table>

        <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
          <ProtectObjects>False</ProtectObjects>
          <ProtectScenarios>False</ProtectScenarios>
        </WorksheetOptions>
      </Worksheet>
    </Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "series.xls";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

    const progress =
      serie.total_episodes === 0
        ? 0
        : Math.min(
            100,
            Math.round((serie.current_episode / serie.total_episodes) * 100)
          );

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

    exportCsvButton.addEventListener("click", exportSeriesToCsv);

    exportExcelButton.addEventListener("click", exportSeriesToSpreadsheetML);

    deleteButton.addEventListener("click", () => {
      deleteSeries(serie.id);
    });

    seriesList.append(node);
  });
}

async function deleteSeries(id) {
  const confirmed = confirm("Eliminar esta serie?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/series/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("No se pudo eliminar la serie");
    }

    await loadSeries();
  } catch (error) {
    console.error(error);
  }
}

loadSeries();