const searchInput = document.getElementById("episodeSearch");
const episodeSelector = document.getElementById("episodeSelector");
const episodeCount = document.getElementById("episodeCount");
const episodesGrid = document.getElementById("episodesGrid");

let showsCache = null;
let episodesCache = {};
let currentShows = [];
let currentEpisodes = [];
let viewMode = "shows";

async function loadShows() {
  if (showsCache) {
    currentShows = showsCache;
    renderShows(currentShows);
    return;
  }
  const res = await fetch("https://api.tvmaze.com/shows");
  showsCache = await res.json();
  showsCache.sort((a, b) => a.name.localeCompare(b.name));
  currentShows = showsCache;
  renderShows(currentShows);
}

function renderShows(shows) {
  viewMode = "shows";
  episodesGrid.innerHTML = "";
  episodeSelector.style.display = "none";
  episodeCount.textContent = `Displaying ${shows.length} shows`;

  shows.forEach(show => {
    const card = document.createElement("div");
    card.className = "episodeCard";
    card.innerHTML = `
      <h2 class="show-link">${show.name}</h2>
      <img src="${show.image ? show.image.medium : ""}" class="show-link">
      <p>${show.summary || ""}</p>
      <p>
        <strong>Genres:</strong> ${show.genres.join(", ")}<br>
        <strong>Status:</strong> ${show.status}<br>
        <strong>Runtime:</strong> ${show.runtime ?? "N/A"} mins
      </p>
      <button>View Episodes</button>
    `;

    card.querySelectorAll(".show-link, button").forEach(el =>
      el.addEventListener("click", () => loadEpisodes(show.id))
    );

    episodesGrid.appendChild(card);
  });

  addTVMazeCredit();
}

async function loadEpisodes(showID) {
  viewMode = "episodes";
  episodeSelector.style.display = "inline";

  if (episodesCache[showID]) {
    currentEpisodes = episodesCache[showID];
    renderEpisodes(currentEpisodes);
    return;
  }

  const res = await fetch(`https://api.tvmaze.com/shows/${showID}/episodes`);
  const episodes = await res.json();
  episodesCache[showID] = episodes;
  currentEpisodes = episodes;
  renderEpisodes(episodes);
}

function renderEpisodes(episodes) {
  episodesGrid.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Shows";
  backBtn.onclick = () => renderShows(currentShows);
  episodesGrid.appendChild(backBtn);

  episodeSelector.innerHTML = "";
  episodes.forEach(ep => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${code} - ${ep.name}`;
    episodeSelector.appendChild(opt);

    const card = document.createElement("div");
    card.className = "episodeCard";
    card.innerHTML = `
      <h2>${ep.name} - ${code}</h2>
      <img src="${ep.image ? ep.image.medium : ""}">
      <p>${ep.summary || ""}</p>
      <a href="${ep.url}" target="_blank">View on TVMaze.com</a>
    `;
    episodesGrid.appendChild(card);
  });

  episodeCount.textContent = `Displaying ${episodes.length} episodes`;
  addTVMazeCredit();
}

searchInput.addEventListener("input", () => {
  const txt = searchInput.value.toLowerCase();
  if (viewMode === "shows") {
    const filtered = currentShows.filter(
      s => s.name.toLowerCase().includes(txt) ||
      (s.summary && s.summary.toLowerCase().includes(txt))
    );
    renderShows(filtered);
  } else {
    const filtered = currentEpisodes.filter(
      e => e.name.toLowerCase().includes(txt) ||
      (e.summary && e.summary.toLowerCase().includes(txt))
    );
    renderEpisodes(filtered);
  }
});

episodeSelector.addEventListener("change", () => {
  const index = currentEpisodes.findIndex(e => e.id == episodeSelector.value);
  const card = episodesGrid.children[index + 1];
  if (card) card.scrollIntoView({ behavior: "smooth" });
});

function addTVMazeCredit() {
  if (!document.getElementById("tvmazeCredit")) {
    const footer = document.createElement("footer");
    footer.id = "tvmazeCredit";
    footer.innerHTML =
      'Data provided by <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>';
    document.body.appendChild(footer);
  }
}

loadShows();
