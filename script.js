// Global variables
let allEpisodes = [];
let allShows = [];
let template;

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
  const container = document.querySelector(".episodes-grid-container");
  if (container) container.innerHTML = "";

  if (!showId) return null;

  container.innerHTML =
    "<p class='loading-state'>Loading episodes, please wait...</p>";

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
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

function uiInitialization() {
  rootElem.innerHTML = "";

  const controls = document.createElement("div");
  controls.classList.add("search_bar");

  const showSelect = document.createElement("select");

  const defaultShow = document.createElement("option");
  defaultShow.textContent = "Select a show...";
  defaultShow.value = "";
  defaultShow.disabled = true;
  defaultShow.selected = true;
  showSelect.appendChild(defaultShow);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search episodes...";

  const counter = document.createElement("span");
  const episodeSelect = document.createElement("select");

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Jump to episode...";
  episodeSelect.appendChild(defaultOption);

  controls.appendChild(showSelect);
  controls.appendChild(searchInput);
  controls.appendChild(counter);
  controls.appendChild(episodeSelect);

  rootElem.appendChild(controls);

  const episodesGridContainer = document.createElement("div");
  episodesGridContainer.classList.add("episodes-grid-container");
  rootElem.appendChild(episodesGridContainer);

  template = document.getElementById("episode-card-template");

  counter.textContent = "0 episodes";

  showSelect.addEventListener("change", async (e) => {
    const showId = e.target.value;
    if (!showId) return;

    const episodes = await getEpisodesByShow(showId);

    if (!episodes) return;

    allEpisodes = episodes;

    renderEpisodes(allEpisodes);
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(query) ||
        (ep.summary && ep.summary.toLowerCase().includes(query)),
    );

    renderEpisodes(filtered);
    counter.textContent = `${filtered.length} / ${allEpisodes.length}`;
  });

  episodeSelect.addEventListener("change", (e) => {
    const index = e.target.value;

    if (!index) {
      renderEpisodes(allEpisodes);
      return;
    }

    renderEpisodes([allEpisodes[index]]);
  });
}

function renderEpisodes(episodeList) {
  const container = document.querySelector(".episodes-grid-container");
  if (!container) return;

  container.innerHTML = "";

  const counter = document.querySelector(".search_bar span");
  const episodeSelect = document.querySelector(
    ".search_bar select:nth-of-type(2)",
  );

  if (counter) {
    counter.textContent = `${episodeList.length} / ${allEpisodes.length}`;
  }

  if (episodeSelect) {
    episodeSelect.innerHTML = `<option value="">Jump to episode...</option>`;
  }

  episodeList.forEach((episode, index) => {
    const clone = template.content.cloneNode(true);

    const code =
      `S${episode.season.toString().padStart(2, "0")}` +
      `E${episode.number.toString().padStart(2, "0")}`;

    clone.querySelector("h3").textContent = `${episode.name} - ${code}`;

    clone.querySelector("img").src = episode.image?.medium || "";

    clone.querySelector("p").innerHTML =
      episode.summary || "No summary available.";

    clone.querySelector("a").href = episode.url;

    container.appendChild(clone);

    const option = new Option(`${code} - ${episode.name}`, index);
    episodeSelect.appendChild(option);
  });
}

async function setup() {
  allShows = await getAllShows();

  if (!allShows.length) return;

  uiInitialization();
}

window.onload = setup;
