const episodeSelector = document.getElementById("episodeSelector");
const episodeSearch = document.getElementById("episodeSearch");
const episodeCount = document.getElementById("episodeCount");
const showSelector = document.getElementById("showSelector");
const episodesGrid = document.getElementById("episodesGrid");

let allShowsCache = null;
let episodesCache = {};
let episodes = [];

async function loadShows() {
  if (allShowsCache) {
    populateShowSelector(allShowsCache);
    loadEpisodes(allShowsCache[0].id);
    return;
  }
  try {
    const res = await fetch("https://api.tvmaze.com/shows");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    allShowsCache = await res.json();
    allShowsCache.sort((a, b) => a.name.localeCompare(b.name));
    populateShowSelector(allShowsCache);
    loadEpisodes(allShowsCache[0].id);
  } catch (err) {
    console.error(err);
    episodesGrid.innerHTML = "<p style='color:red;'>Failed to load shows. Please try again later.</p>";
  }
}

function populateShowSelector(shows) {
  showSelector.innerHTML = "";
  shows.forEach((show) => {
    const op = document.createElement("option");
    op.value = show.id;
    op.textContent = show.name;
    showSelector.appendChild(op);
  });
}

async function loadEpisodes(showID) {
  if (episodesCache[showID]) {
    episodes = episodesCache[showID];
    buildEpisodeSelector();
    renderEpisodes(episodes);
    updateCount(episodes.length, episodes.length);
    return;
  }
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showID}/episodes`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    episodes = await res.json();
    episodesCache[showID] = episodes;
    buildEpisodeSelector();
    renderEpisodes(episodes);
    updateCount(episodes.length, episodes.length);
  } catch (err) {
    console.error(err);
    episodesGrid.innerHTML = "<p style='color:red;'>Failed to load episodes. Please try again later.</p>";
  }
}

function buildEpisodeSelector() {
  episodeSelector.innerHTML = "";
  episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const op = document.createElement("option");
    op.value = ep.id;
    op.textContent = `${code} - ${ep.name}`;
    episodeSelector.appendChild(op);
  });
}

function renderEpisodes(list) {
  episodesGrid.innerHTML = "";
  list.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const card = document.createElement("div");
    card.className = "episodeCard";
    card.innerHTML = `
      <h2>${ep.name} - ${code}</h2>
      <img src="${ep.image ? ep.image.medium : ""}">
      <p>${ep.summary || ""}</p>
      <p><a href="${ep.url}" target="_blank">View on TVMaze.com</a></p>
    `;
    episodesGrid.appendChild(card);
  });
  addTVMazeCredit();
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

function addTVMazeCredit() {
  if (!document.getElementById("tvmazeCredit")) {
    const credit = document.createElement("footer");
    credit.id = "tvmazeCredit";
    credit.innerHTML = 'Data provided by <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>';
    document.body.appendChild(credit);
  }
}

episodeSearch.addEventListener("input", filterEpisodes);
episodeSelector.addEventListener("change", jumpToEpisode);
showSelector.addEventListener("change", (e) => loadEpisodes(e.target.value));

loadShows();
