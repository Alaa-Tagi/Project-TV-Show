function setup() {
  const episodes = getAllEpisodes();
  populateSelector(episodes);
  makePageForEpisodes(episodes);
  addSearch(episodes);
  selectEpisode(episodes);
}

function makePageForEpisodes(list) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  list.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;
    const card = document.createElement("div");
    card.className = "card";
    const title = document.createElement("h3");
    title.textContent = `${ep.name} – ${code}`;
    const img = document.createElement("img");
    img.src = ep.image.medium;
    const summary = document.createElement("p");
    summary.innerHTML = ep.summary;
    card.append(title, img, summary);
    root.append(card);
  });
  document.getElementById(
    "countDisplay"
  ).textContent = `Displaying ${list.length} episodes`;
}

function populateSelector(episodes) {
  const select = document.getElementById("episodeSelector");
  episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;
    select.append(option);
  });
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = "Show All Episodes";
  select.prepend(all);
}

function addSearch(episodes) {
  const box = document.getElementById("searchInput");
  box.addEventListener("input", () => {
    const value = box.value.toLowerCase();
    const filtered = episodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(value) ||
        ep.summary.toLowerCase().includes(value)
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
