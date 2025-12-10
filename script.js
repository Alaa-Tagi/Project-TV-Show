function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    const title = document.createElement("h3");
    title.textContent = `${episode.name} (${makeEpisodeCode(episode)})`;

    const img = document.createElement("img");
    img.src = episode.image.medium;
    img.alt = episode.name;

    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.textContent = "View on TVMaze";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(link);

    rootElem.appendChild(card);
  });
}

function makeEpisodeCode(ep) {
  const s = String(ep.season).padStart(2, "0");
  const e = String(ep.number).padStart(2, "0");
  return `S${s}E${e}`;
}

window.onload = setup;
