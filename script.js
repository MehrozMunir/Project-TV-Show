// Global variables
let allEpisodes = [];
let allShows = [];
let template;

let showSearchInput, showsGridContainer, backToShowsLink, showSelect;
let showsView, episodesView;
let showsCounter, showsSelect;

const episodeCache = {};

const rootElem = document.getElementById("root");

async function getAllShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const shows = await response.json();

    shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    return shows;
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-notice">
        <h1 style="color: #d9534f;">Oops! Something went wrong.</h1>
        <p>We couldn't load the episodes. Details: <strong>${error.message}</strong></p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    `;
    return [];
  }
}

async function getEpisodesByShow(showId) {
  if (!showId) return null;

  if (episodeCache[showId]) {
    return episodeCache[showId];
  }

  const container = document.querySelector(".episodes-grid-container");
  if (container) {
    container.innerHTML =
      "<p class='loading-state'>Loading episodes, please wait...</p>";
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const episodes = await response.json();
    episodeCache[showId] = episodes;
    return episodes;
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-notice">
        <h1 style="color: #d9534f;">Oops! Something went wrong.</h1>
        <p>${error.message}</p>
      </div>
    `;
    return null;
  }
}
function buildLayout() {
  rootElem.innerHTML = "";

  template = document.getElementById("episode-card-template");

  // ---------- Shows View ----------
  showsView = document.createElement("section");
  showsView.className = "shows-view";

  const showsMenuBar = document.createElement("div");
  showsMenuBar.className = "menu_bar";

  const filteringLabel = document.createElement("span");
  filteringLabel.className = "filter-label";
  filteringLabel.textContent = "Filtering for";

  showSearchInput = document.createElement("input");
  showSearchInput.placeholder = "Search shows...";

  showsCounter = document.createElement("span");
  showsCounter.className = "shows-counter";
  showsCounter.textContent = `found ${allShows.length} shows`;

  showsSelect = document.createElement("select");

  const defaultShowsOption = document.createElement("option");
  defaultShowsOption.textContent = "Select a show...";
  defaultShowsOption.value = "";
  defaultShowsOption.disabled = true;
  defaultShowsOption.selected = true;
  showsSelect.appendChild(defaultShowsOption);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showsSelect.appendChild(option);
  });

  showsMenuBar.appendChild(filteringLabel);
  showsMenuBar.appendChild(showSearchInput);
  showsMenuBar.appendChild(showsCounter);
  showsMenuBar.appendChild(showsSelect);

  showsGridContainer = document.createElement("div");
  showsGridContainer.className = "shows-grid-container";

  showsView.appendChild(showsMenuBar);
  showsView.appendChild(showsGridContainer);

  // ---------- Episodes View ----------
  episodesView = document.createElement("section");
  episodesView.className = "episodes-view hidden";

  const controls = document.createElement("div");
  controls.classList.add("menu_bar");

  backToShowsLink = document.createElement("a");
  backToShowsLink.href = "#";
  backToShowsLink.textContent = "Back to shows";
  backToShowsLink.className = "back-link";

  showSelect = document.createElement("select");

  const defaultShowOption = document.createElement("option");
  defaultShowOption.textContent = "Select a show...";
  defaultShowOption.value = "";
  defaultShowOption.disabled = true;
  defaultShowOption.selected = true;
  showSelect.appendChild(defaultShowOption);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  searchInput = document.createElement("input");
  searchInput.placeholder = "Search episodes...";

  counter = document.createElement("span");
  counter.textContent = "0 / 0";

  episodeSelect = document.createElement("select");
  populateEpisodeDropdown([]);

  controls.appendChild(backToShowsLink);
  controls.appendChild(showSelect);
  controls.appendChild(searchInput);
  controls.appendChild(counter);
  controls.appendChild(episodeSelect);

  episodesGridContainer = document.createElement("div");
  episodesGridContainer.classList.add("episodes-grid-container");

  episodesView.appendChild(controls);
  episodesView.appendChild(episodesGridContainer);

  rootElem.appendChild(showsView);
  rootElem.appendChild(episodesView);

  // ---------- Event listeners ----------

  showSearchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    const filteredShows = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(query) ||
        show.genres.join(" ").toLowerCase().includes(query) ||
        (show.summary && show.summary.toLowerCase().includes(query)),
    );

    showsCounter.textContent = `found ${filteredShows.length} shows`;
    showsSelect.selectedIndex = 0;
    renderShows(filteredShows);
  });

  showsSelect.addEventListener("change", async (e) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) return;

    const selectedShow = allShows.find((show) => show.id === selectedId);
    if (!selectedShow) return;

    await openShow(selectedShow);
  });

  backToShowsLink.addEventListener("click", (e) => {
    e.preventDefault();
    showShowsView();
  });

  showSelect.addEventListener("change", async (e) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) return;

    const selectedShow = allShows.find((show) => show.id === selectedId);
    if (!selectedShow) return;

    await openShow(selectedShow);
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    episodeSelect.selectedIndex = 0;

    const filteredEpisodes = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(query) ||
        (ep.summary && ep.summary.toLowerCase().includes(query)),
    );

    renderEpisodes(filteredEpisodes);
  });

  episodeSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "") return;

    searchInput.value = "";
    renderEpisodes([allEpisodes[value]]);
  });
}
function renderShows(showList) {
  showsGridContainer.innerHTML = "";

  showList.forEach((show) => {
    const showCard = document.createElement("section");
    showCard.className = "show-card";

    showCard.innerHTML = `
      <img
        class="show-image"
        src="${show.image?.medium || ""}"
        alt="Poster of ${show.name}"
      />
      <div class="show-content">
        <h2 class="show-title">
          <a href="#" data-id="${show.id}">${show.name}</a>
        </h2>
        <p><strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}</p>
        <p><strong>Status:</strong> ${show.status || "N/A"}</p>
        <p><strong>Rating:</strong> ${show.rating?.average ?? "N/A"}</p>
        <p><strong>Runtime:</strong> ${show.runtime ?? "N/A"} minutes</p>
        <div class="show-summary">
          ${show.summary || "No summary available."}
        </div>
      </div>
    `;

    const nameLink = showCard.querySelector("a");
    nameLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await openShow(show);
    });

    const image = showCard.querySelector("img");
    image.style.cursor = "pointer";

    image.addEventListener("click", async () => {
      await openShow(show);
    });

    showsGridContainer.appendChild(showCard);
  });
}

function showShowsView() {
  showsView.classList.remove("hidden");
  episodesView.classList.add("hidden");
}

function showEpisodesView() {
  episodesView.classList.remove("hidden");
  showsView.classList.add("hidden");
}
async function openShow(show) {
  showEpisodesView();

  showSelect.value = String(show.id);
  searchInput.value = "";

  const episodes = await getEpisodesByShow(show.id);
  if (!episodes) return;

  allEpisodes = episodes;
  populateEpisodeDropdown(allEpisodes);
  renderEpisodes(allEpisodes);
}
function renderEpisodes(episodeList) {
  if (!episodesGridContainer) return;

  episodesGridContainer.innerHTML = "";

  if (counter) {
    counter.textContent = `${episodeList.length} / ${allEpisodes.length}`;
  }

  episodeList.forEach((episode) => {
    const clone = template.content.cloneNode(true);

    const code =
      `S${episode.season.toString().padStart(2, "0")}` +
      `E${episode.number.toString().padStart(2, "0")}`;

    clone.querySelector("h3").textContent = `${episode.name} - ${code}`;
    clone.querySelector("img").src = episode.image?.medium || "";
    clone.querySelector("p").innerHTML =
      episode.summary || "No summary available.";
    clone.querySelector("a").href = episode.url;
    clone.querySelector("a").textContent = "View on TVMaze";

    episodesGridContainer.appendChild(clone);
  });
}

function populateEpisodeDropdown(episodes) {
  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Jump to episode...";
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  episodeSelect.appendChild(defaultOption);

  episodes.forEach((episode, index) => {
    const code =
      `S${episode.season.toString().padStart(2, "0")}` +
      `E${episode.number.toString().padStart(2, "0")}`;

    const option = new Option(`${code} - ${episode.name}`, index);
    episodeSelect.appendChild(option);
  });
}

async function setup() {
  allShows = await getAllShows();

  if (!allShows || !allShows.length) return;

  buildLayout();
  renderShows(allShows);
  showShowsView();
}

window.onload = setup;
