// Global variables
let allEpisodes = [];
let allShows = [];
let episodeCache = {};
let selectedShowId = null;
let template;

const rootElem = document.getElementById("root");

// 1. DATA FETCHING - Handles Loading and Error states
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
        <p>We couldn't load the shows. Details: <strong>${error.message}</strong></p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    `;
    return [];
  }
}

async function loadEpisodesForShow(showId) {
  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    uiInitialization();
    renderEpisodes(allEpisodes);
    return;
  }

  rootElem.innerHTML =
    "<p class='loading-state'>Loading episodes, please wait...</p>";

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} (${response.statusText})`,
      );
    }

    const episodes = await response.json();

    episodeCache[showId] = episodes;
    allEpisodes = episodes;

    uiInitialization();
    renderEpisodes(allEpisodes);
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-notice">
        <h1 style="color: #d9534f;">Oops! Something went wrong.</h1>
        <p>We couldn't load the episodes. Details: <strong>${error.message}</strong></p>
        <button onclick="location.reload()">Try Again</button>
      </div>
     `;
  }
}

// 2. UI INITIALIZATION - Only runs if data is successful
function uiInitialization() {
  // CRITICAL: Clear the loading message before building the UI
  rootElem.innerHTML = "";

  const controls = document.createElement("div");
  controls.classList.add("search_bar");

  const showSelect = document.createElement("select");
  const defaultShowOption = document.createElement("option");

  defaultShowOption.textContent = "Select a TV show...";
  defaultShowOption.value = "";
  defaultShowOption.disabled = true;
  defaultShowOption.selected = !selectedShowId;

  showSelect.appendChild(defaultShowOption);

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search episodes...";

  const counter = document.createElement("span");
  const episodeSelect = document.createElement("select");

  const defaultOption = document.createElement("option");

  defaultOption.textContent = "Jump to episode...";
  defaultOption.value = "";
  episodeSelect.appendChild(defaultOption);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);

    if (selectedShowId) {
      showSelect.value = selectedShowId;
    }
  });
  controls.appendChild(showSelect);
  controls.appendChild(searchInput);
  controls.appendChild(counter);
  controls.appendChild(episodeSelect);

  // Add controls to root
  rootElem.appendChild(controls);

  // Create and add the grid container to root
  const episodesGridContainer = document.createElement("div");
  episodesGridContainer.classList.add("episodes-grid-container");
  rootElem.appendChild(episodesGridContainer);

  template = document.getElementById("episode-card-template");

  counter.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

  // Populate Select Menu
  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");
    const episodeCode = `S${episode.season.toString().padStart(2, "0")}E${episode.number.toString().padStart(2, "0")}`;
    option.value = index;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(query) ||
        (ep.summary && ep.summary.toLowerCase().includes(query)),
    );
    renderEpisodes(filtered);
    counter.textContent = `${filtered.length} / ${allEpisodes.length} episodes`;
  });

  episodeSelect.addEventListener("change", (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") {
      renderEpisodes(allEpisodes);
      counter.textContent = `${allEpisodes.length} / ${allEpisodes.length} episodes`;
    } else {
      renderEpisodes([allEpisodes[selectedIndex]]);
      counter.textContent = `1 / ${allEpisodes.length} episodes`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  showSelect.addEventListener("change", (e) => {
    const showId = e.target.value;

    if (!showId) return;

    loadEpisodesForShow(showId);
  });
}

// 3. EPISODE RENDERER
function renderEpisodes(episodeList) {
  const container = document.querySelector(".episodes-grid-container");
  if (!container) return;

  container.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeTemplate = template.content.cloneNode(true);

    const episodeCode = `S${episode.season.toString().padStart(2, "0")}E${episode.number.toString().padStart(2, "0")}`;

    episodeTemplate.querySelector("h3").textContent =
      `${episode.name} - ${episodeCode}`;
    episodeTemplate.querySelector("img").src = episode.image?.medium || "";
    episodeTemplate.querySelector("p").innerHTML =
      episode.summary || "No summary available.";

    const link = episodeTemplate.querySelector("a");
    link.href = episode.url;
    link.textContent = "View on TVMaze";

    container.appendChild(episodeTemplate);
  });
}

// 4. MAIN ENTRY POINT
async function setup() {
  allShows = await getAllShows();

  if (allShows.length === 0) return;

  const defaultShow = allShows[0];
  await loadEpisodesForShow(defaultShow.id);
}

window.onload = setup;
