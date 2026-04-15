//You can edit ALL of the code here
let allEpisodes = [];
function setup() {
  const rootElem = document.getElementById("root");

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search episodes...";

  const counter = document.createElement("p");

  rootElem.prepend(counter);
  rootElem.prepend(searchInput);

  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(query);

      const summaryMatch = episode.summary
        ? episode.summary.toLowerCase().includes(query)
        : false;

      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);

    counter.textContent = `${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const episodesGridContainer = document.querySelector(
    ".episodes-grid-container",
  );

  episodeList.forEach((episode) => {
    const episodeTemplate = document
      .getElementById("episode-card-template")
      .content.cloneNode(true);
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
    //hi
    episodesGridContainer.appendChild(episodeTemplate);
  });
}

window.onload = setup;
