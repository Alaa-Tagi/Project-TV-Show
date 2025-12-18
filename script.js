window.onload = setup;

async function setup() {
  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading shows, please wait...</p>";

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const shows = await response.json();
    renderShows(shows);
  } catch (error) {
    root.innerHTML =
      `<p style="color:red;">Failed to load shows. Please try again later.</p>`;
    console.error(error);
  }
}

function renderShows(shows) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h2");
    title.textContent = show.name;

    const img = document.createElement("img");
    img.src = show.image ? show.image.medium : "";
    img.alt = show.name;

    const summary = document.createElement("div");
    summary.innerHTML = show.summary || "No summary available";

    const info = document.createElement("p");
    info.innerHTML = `
      Genres: ${show.genres.join(", ")}<br>
      Status: ${show.status}<br>
      Rating: ${show.rating.average ?? "N/A"}<br>
      Runtime: ${show.runtime ?? "N/A"} mins
    `;

    const button = document.createElement("button");
    button.textContent = "View Episodes";
    button.addEventListener("click", () => loadEpisodes(show.id));

    card.append(title, img, summary, info, button);
    root.append(card);
  });
}

async function loadEpisodes(showId) {
  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading episodes...</p>";

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const episodes = await response.json();
    renderEpisodes(episodes);
  } catch (error) {
    root.innerHTML =
      `<p style="color:red;">Failed to load episodes.</p>`;
    console.error(error);
  }
}

function renderEpisodes(episodes) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = `${ep.name} – ${code}`;

    const img = document.createElement("img");
    img.src = ep.image ? ep.image.medium : "";

    const summary = document.createElement("p");
    summary.innerHTML = ep.summary || "No summary available";

    card.append(title, img, summary);
    root.append(card);
  });
}
