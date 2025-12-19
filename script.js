const showsEl = document.getElementById('shows');
const episodesGrid = document.getElementById('episodesGrid');
const episodeDetails = document.getElementById('episodeDetails');
const searchBox = document.getElementById('episodeSearch');
const showSelector = document.getElementById('showSelector');
const episodeSelector = document.getElementById('episodeSelector');
const episodeCount = document.getElementById('episodeCount');

let allShows = [];
let currentEpisodes = [];

async function loadShows() {
    const res = await fetch('https://api.tvmaze.com/shows');
    allShows = await res.json();
    populateShowSelector(allShows);
    displayShows(allShows);
}

function populateShowSelector(shows) {
    shows.forEach(show => {
        const option = document.createElement('option');
        option.value = show.id;
        option.textContent = show.name;
        showSelector.appendChild(option);
    });
}

function displayShows(shows) {
    episodesGrid.innerHTML = '';
    episodeDetails.innerHTML = '';
    showsEl.innerHTML = shows.map(show => `
        <div class="show-card" onclick="loadEpisodes(${show.id})">
            <img src="${show.image?.medium || ''}" alt="${show.name}">
            <h3>${show.name}</h3>
            <a href="${show.url}" target="_blank">TVMaze Link</a>
        </div>
    `).join('');
}

async function loadEpisodes(showId) {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    currentEpisodes = await res.json();
    populateEpisodeSelector(currentEpisodes);
    displayEpisodes(currentEpisodes);
}

function populateEpisodeSelector(episodes) {
    episodeSelector.innerHTML = '<option value="">Select an episode</option>';
    episodes.forEach(ep => {
        const option = document.createElement('option');
        option.value = ep.id;
        option.textContent = `${ep.name} (S${ep.season}E${ep.number})`;
        episodeSelector.appendChild(option);
    });
}

function displayEpisodes(episodes) {
    showsEl.innerHTML = '';
    episodeDetails.innerHTML = '';
    episodesGrid.innerHTML = episodes.map(ep => `
        <div class="episode-item" id="ep-${ep.id}" onclick="showEpisodeDetails(${ep.id})">
            ${ep.name} (S${ep.season}E${ep.number})
        </div>
    `).join('');
    episodeCount.textContent = `Total Episodes: ${episodes.length}`;
}

function showEpisodeDetails(epId) {
    const episode = currentEpisodes.find(ep => ep.id == epId);
    if (episode) {
        episodeDetails.innerHTML = `
            <h2>${episode.name} (S${episode.season}E${episode.number})</h2>
            <p>${episode.summary || 'No description available.'}</p>
            <img src="${episode.image?.medium || ''}" alt="${episode.name}">
        `;
        document.querySelectorAll('.episode-item').forEach(el => el.style.backgroundColor = '');
        const selected = document.getElementById(`ep-${epId}`);
        if (selected) selected.style.backgroundColor = '#d0f0d0';
    }
}

searchBox.addEventListener('input', () => {
    const query = searchBox.value.toLowerCase();
    const filtered = allShows.filter(show => show.name.toLowerCase().includes(query));
    displayShows(filtered);
});

showSelector.addEventListener('change', () => {
    const showId = showSelector.value;
    if (showId) loadEpisodes(showId);
});

episodeSelector.addEventListener('change', () => {
    const epId = episodeSelector.value;
    if (epId) showEpisodeDetails(epId);
});

loadShows();
addTVMazeCredit();
