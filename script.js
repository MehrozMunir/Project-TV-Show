//You can edit ALL of the code here
let allEpisodes = [];
let template;
let showOnlySelected = false;

function setup() {
  const rootElem = document.getElementById("root");

  const controls = document.createElement("div");
  controls.classList.add("search_bar");

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search episodes...";

  const counter = document.createElement("span");

  controls.appendChild(searchInput);
  controls.appendChild(counter);
  rootElem.prepend(controls);

  const episodeSelect = document.createElement("select");
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Jump to episode...";
  defaultOption.value = "";
  episodeSelect.appendChild(defaultOption);

  controls.appendChild(episodeSelect);

  template = document.getElementById("episode-card-template");

  console.log("template:", template);
  allEpisodes = getAllEpisodes();

  counter.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;
  renderEpisodes(allEpisodes);
  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");

    const episodeCode =
      `S${episode.season.toString().padStart(2, "0")}` +
      `E${episode.number.toString().padStart(2, "0")}`;

    option.value = index;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(query);

      const summaryMatch = episode.summary
        ? episode.summary.toLowerCase().includes(query)
        : false;
      return nameMatch || summaryMatch;
    });

    renderEpisodes(filteredEpisodes);

    counter.textContent = `${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
    episodeSelect.value = "";
    showOnlySelected = false;
  });

  episodeSelect.addEventListener("change", (e) => {
    const selectedIndex = e.target.value;

    if (selectedIndex === "") {
      showOnlySelected = false;
      renderEpisodes(allEpisodes);
      counter.textContent = `${allEpisodes.length} / ${allEpisodes.length} episodes`;
      return;
    }
    const selectedEpisode = allEpisodes[selectedIndex];
    showOnlySelected = true;
    renderEpisodes([selectedEpisode]);

    counter.textContent = `1 / ${allEpisodes.length} episodes`;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderEpisodes(episodeList) {
  const episodesGridContainer = document.querySelector(
    ".episodes-grid-container",
  );

  console.log("container:", episodesGridContainer);

  episodesGridContainer.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeTemplate = template.content.cloneNode(true);
    const titleHeader = episodeTemplate.querySelector("h3");
    const episodeImage = episodeTemplate.querySelector("img");
    const episodeSummary = episodeTemplate.querySelector("p");
    const episodeLink = episodeTemplate.querySelector("a");
    const episodeCode =
      episode.name +
      " - S" +
      episode.season.toString().padStart(2, "0") +
      "E" +
      episode.number.toString().padStart(2, "0");
    titleHeader.textContent = episodeCode;
    episodeImage.src = episode.image?.medium || "";
    episodeSummary.innerHTML = episode.summary || "";
    episodeLink.href = episode.url;
    episodeLink.textContent =
      "Click here to visit the original source of this episode at TVMaze.com";

    episodesGridContainer.appendChild(episodeTemplate);
  });
}

window.onload = setup;
