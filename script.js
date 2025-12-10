const episodeSelector = document.getElementById("episodeSelector");
const episodeSearch = document.getElementById("episodeSearch");
const episodeCount = document.getElementById("episodeCount");
const showSelector = document.getElementById("showSelector");
const episodesGrid = document.getElementById("episodesGrid");

let episodes = [];
let allShows = [];

async function loadShows() {
  const res = await fetch("https://api.tvmaze.com/shows");
  allShows = await res.json();
  allShows.sort((a, b) => a.name.localeCompare(b.name));

  allShows.forEach((show) => {
    const op = document.createElement("option");
    op.value = show.id;
    op.textContent = show.name;
    showSelector.appendChild(op);
  });

  loadEpisodes(allShows[0].id);
}

async function loadEpisodes(showID) {
  const res = await fetch(`https://api.tvmaze.com/shows/${showID}/episodes`);
  episodes = await res.json();
  buildEpisodeSelector();
  renderEpisodes(episodes);
  updateCount(episodes.length, episodes.length);
}

function buildEpisodeSelector() {
  episodeSelector.innerHTML = "";
  episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;
    const op = document.createElement("option");
    op.value = ep.id;
    op.textContent = `${code} - ${ep.name}`;
    episodeSelector.appendChild(op);
  });
}

function renderEpisodes(list) {
  episodesGrid.innerHTML = "";
  list.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;

    const card = document.createElement("div");
    card.className = "episodeCard";

    card.innerHTML = `
      <h2>${ep.name} - ${code}</h2>
      <img src="${ep.image ? ep.image.medium : ""}">
      <p>${ep.summary || ""}</p>
    `;
    episodesGrid.appendChild(card);
  });
}

function updateCount(n, total) {
  episodeCount.textContent = `Displaying ${n}/${total} episodes.`;
}

function filterEpisodes() {
  const txt = episodeSearch.value.toLowerCase();

  const filtered = episodes.filter(
    (ep) =>
      ep.name.toLowerCase().includes(txt) ||
      (ep.summary && ep.summary.toLowerCase().includes(txt))
  );

  renderEpisodes(filtered);
  updateCount(filtered.length, episodes.length);
}

function jumpToEpisode() {
  const id = episodeSelector.value;
  const index = episodes.findIndex((ep) => ep.id == id);

  const card = episodesGrid.children[index];
  if (card) card.scrollIntoView({ behavior: "smooth" });
}

episodeSearch.addEventListener("input", filterEpisodes);
episodeSelector.addEventListener("change", jumpToEpisode);
showSelector.addEventListener("change", (e) => loadEpisodes(e.target.value));

loadShows();
