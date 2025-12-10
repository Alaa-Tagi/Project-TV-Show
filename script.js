async function setup() {
  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading episodes, please wait...</p>";

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const episodes = await response.json();

    root.innerHTML = "";
    populateSelector(episodes);
    makePageForEpisodes(episodes);
    addSearch(episodes);
    selectEpisode(episodes);
  } catch (error) {
    root.innerHTML = `<p style="color:red;">Failed to load episodes. Please try again later.</p>`;
    console.error(error);
  }
}

function makePageForEpisodes(list) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  list.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
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
  document.getElementById("countDisplay").textContent =
    `Displaying ${list.length} episodes`;
}

function populateSelector(episodes) {
  const select = document.getElementById("episodeSelector");
  select.innerHTML = "";
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = "Show All Episodes";
  select.append(all);

  episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;
    select.append(option);
  });
}

function addSearch(episodes) {
  const box = document.getElementById("searchInput");
  box.addEventListener("input", () => {
    const value = box.value.toLowerCase();
    const filtered = episodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(value) ||
        (ep.summary && ep.summary.toLowerCase().includes(value))
    );
    makePageForEpisodes(filtered);
  });
}

function selectEpisode(episodes) {
  const select = document.getElementById("episodeSelector");
  select.addEventListener("change", () => {
    if (select.value === "all") {
      makePageForEpisodes(episodes);
      return;
    }
    const ep = episodes.find((e) => e.id == select.value);
    makePageForEpisodes([ep]);
  });
}

window.onload = setup;
