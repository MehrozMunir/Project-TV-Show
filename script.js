//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.textContent = `Got ${episodeList.length} episode(s)`;

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

    episodesGridContainer.appendChild(episodeTemplate);
  });
}

window.onload = setup;
