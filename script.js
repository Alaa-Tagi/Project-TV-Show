const showsView = document.getElementById("showsView");
const episodesView = document.getElementById("episodesView");
const showSearch = document.getElementById("showSearch");
const episodeSearch = document.getElementById("episodeSearch");
const showSelector = document.getElementById("showSelector");
const episodeSelector = document.getElementById("episodeSelector");
const showCount = document.getElementById("showCount");
const episodeCount = document.getElementById("episodeCount");
const backBtn = document.getElementById("backBtn");

let shows = [];
let episodesCache = {};
let currentEpisodes = [];

async function loadShows() {
  const res = await fetch("https://api.tvmaze.com/shows");
  shows = await res.json();
  shows.sort((a, b) => a.name.localeCompare(b.name));
  showSelector.innerHTML = "";
  shows.forEach((s) => {
    const op = document.createElement("option");
    op.value = s.id;
    op.textContent = s.name;
    showSelector.appendChild(op);
  });
  renderShowList(shows);
  updateShowCount(shows.length);
}

function renderShowList(list) {
  showsView.innerHTML = "";
  list.forEach((s) => {
    const card = document.createElement("div");
    card.className = "showCard";
    card.dataset.id = s.id;
    const genres = s.genres.join(" | ");
    card.innerHTML = `
      <div><img src="${s.image ? s.image.medium : ""}"></div>
      <div>
        <h2 class="showTitle">${s.name}</h2>
        <p>${s.summary || ""}</p>
      </div>
      <div class="showInfoBox">
        Rated: ${s.rating.average || "N/A"}<br>
        Genres: ${genres}<br>
        Status: ${s.status}<br>
        Runtime: ${s.runtime || "-"}
      </div>
    `;
    card.addEventListener("click", () => openShow(s.id));
    showsView.appendChild(card);
  });
}

function updateShowCount(n) {
  showCount.textContent = `found ${n} shows`;
}

function searchShows() {
  const t = showSearch.value.toLowerCase();
  const filtered = shows.filter(
    (s) =>
      s.name.toLowerCase().includes(t) ||
      s.summary.toLowerCase().includes(t) ||
      s.genres.join(" ").toLowerCase().includes(t)
  );
  renderShowList(filtered);
  updateShowCount(filtered.length);
}

async function openShow(id) {
  showsView.classList.add("hidden");
  backBtn.classList.remove("hidden");
  episodeSelector.classList.remove("hidden");
  episodeSearch.classList.remove("hidden");
  episodeCount.classList.remove("hidden");

  if (!episodesCache[id]) {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}/episodes`);
    episodesCache[id] = await res.json();
  }

  currentEpisodes = episodesCache[id];
  buildEpisodeSelector();
  renderEpisodes(currentEpisodes);
  updateEpisodeCount(currentEpisodes.length, currentEpisodes.length);
}

function buildEpisodeSelector() {
  episodeSelector.innerHTML = "";
  currentEpisodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const op = document.createElement("option");
    op.value = ep.id;
    op.textContent = `${code} - ${ep.name}`;
    episodeSelector.appendChild(op);
  });
}

function renderEpisodes(list) {
  episodesView.classList.remove("hidden");
  episodesView.innerHTML = "";
  list.forEach((ep) => {
    const card = document.createElement("div");
    card.className = "episodeCard";
    card.innerHTML = `
      <h3>${ep.name}</h3>
      <p>S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}</p>
      <img src="${ep.image ? ep.image.medium : ""}">
      <p>${ep.summary || ""}</p>
    `;
    episodesView.appendChild(card);
  });
}

function updateEpisodeCount(showing, total) {
  episodeCount.textContent = `Displaying ${showing}/${total} episodes`;
}

function filterEpisodes() {
  const t = episodeSearch.value.toLowerCase();
  const filtered = currentEpisodes.filter(
    (ep) =>
      ep.name.toLowerCase().includes(t) ||
      ep.summary.toLowerCase().includes(t)
  );
  renderEpisodes(filtered);
  updateEpisodeCount(filtered.length, currentEpisodes.length);
}

function jumpToEpisode() {
  const id = episodeSelector.value;
  const card = document.querySelector(`.episodeCard:nth-child(${currentEpisodes.findIndex(e => e.id == id) + 1})`);
  if (card) card.scrollIntoView({ behavior: "smooth" });
}

function goBack() {
  episodesView.classList.add("hidden");
  backBtn.classList.add("hidden");
  episodeSelector.classList.add("hidden");
  episodeSearch.classList.add("hidden");
  episodeCount.classList.add("hidden");
  showsView.classList.remove("hidden");
  episodesView.innerHTML = "";
}

showSearch.addEventListener("input", searchShows);
episodeSearch.addEventListener("input", filterEpisodes);
episodeSelector.addEventListener("change", jumpToEpisode);
backBtn.addEventListener("click", goBack);

loadShows();
