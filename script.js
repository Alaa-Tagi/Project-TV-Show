const showsEl = document.getElementById('shows');
const showSearch = document.getElementById('showSearch');
const showCount = document.getElementById('showCount');
const episodesGrid = document.createElement('div');
episodesGrid.id = 'episodesGrid';
document.body.insertBefore(episodesGrid, document.getElementById('footer'));

let allShows = [];
let currentEpisodes = [];

async function loadShows() {
    const res = await fetch('https://api.tvmaze.com/shows');
    allShows = await res.json();
    displayShows(allShows);
}

function displayShows(shows) {
    showsEl.innerHTML = shows.map(show => `
        <div class="show-card" onclick="loadEpisodes(${show.id})">
            <img src="${show.image?.medium || ''}" alt="${show.name}">
            <h3>${show.name}</h3>
            <p>${show.summary || 'No summary available.'}</p>
            <p class="genres">Genres: ${show.genres.join(', ') || 'N/A'}</p>
            <p class="status-runtime">Status: ${show.status || 'N/A'} | Runtime: ${show.runtime || 'N/A'} min</p>
            <a href="${show.url}" target="_blank">TVMaze Link</a>
        </div>
    `).join('');
    showCount.textContent = `Total Shows: ${shows.length}`;
    episodesGrid.innerHTML = '';
}

async function loadEpisodes(showId) {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    currentEpisodes = await res.json();
    displayEpisodes(currentEpisodes);
}

function displayEpisodes(episodes) {
    episodesGrid.innerHTML = `
        <h2>Episodes</h2>
        ${episodes.map(ep => `
            <div class="episode-item" id="ep-${ep.id}" onclick="showEpisodeDetails(${ep.id})">
                ${ep.name} (S${ep.season}E${ep.number})
            </div>
        `).join('')}
    `;
}

function showEpisodeDetails(epId) {
    const episode = currentEpisodes.find(ep => ep.id == epId);
    if (episode) {
        const detailsDiv = document.getElementById('episodeDetails') || createEpisodeDetailsDiv();
        detailsDiv.innerHTML = `
            <h3>${episode.name} (S${episode.season}E${episode.number})</h3>
            <p>${episode.summary || 'No description available.'}</p>
            <img src="${episode.image?.medium || ''}" alt="${episode.name}">
        `;
        document.querySelectorAll('.episode-item').forEach(el => el.style.backgroundColor = '');
        const selected = document.getElementById(`ep-${epId}`);
        if (selected) selected.style.backgroundColor = '#d0f0d0';
    }
}

function createEpisodeDetailsDiv() {
    const div = document.createElement('div');
    div.id = 'episodeDetails';
    div.style.maxWidth = '600px';
    div.style.margin = '1rem auto';
    div.style.textAlign = 'center';
    document.body.insertBefore(div, episodesGrid.nextSibling);
    return div;
}

showSearch.addEventListener('input', () => {
    const query = showSearch.value.toLowerCase();
    const filtered = allShows.filter(show => show.name.toLowerCase().includes(query));
    displayShows(filtered);
});

loadShows();
addTVMazeCredit();
