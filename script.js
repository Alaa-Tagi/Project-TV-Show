const showsView = document.getElementById("showsView");
const episodesView = document.getElementById("episodesView");
const personView = document.getElementById("personView");
const backBtn = document.getElementById("backBtn");
const showSearch = document.getElementById("showSearch");
const sortShows = document.getElementById("sortShows");
const episodeSelector = document.getElementById("episodeSelector");
const episodeSearch = document.getElementById("episodeSearch");
const countDisplay = document.getElementById("countDisplay");

let allShows = [];
let episodesCache = {};
let castCache = {};
let currentShowId = null;
let currentEpisodes = [];
let episodesPage = 1;
const EPISODES_PER_PAGE = 18;

function saveFavourites(list){
  localStorage.setItem("favs", JSON.stringify(list));
}

function loadFavourites(){
  try{return JSON.parse(localStorage.getItem("favs")||"[]")}catch(e){return []}
}

function saveNotes(obj){
  localStorage.setItem("notes", JSON.stringify(obj));
}

function loadNotes(){
  try{return JSON.parse(localStorage.getItem("notes")||"{}")}catch(e){return {}}
}

async function fetchShows(){
  const r = await fetch("https://api.tvmaze.com/shows");
  const data = await r.json();
  allShows = data;
  renderShowList(allShows);
  history.replaceState({view:"shows"},"","?shows");
}

function renderShowList(list){
  showsView.innerHTML = "";
  const favs = loadFavourites();
  list.forEach(s=>{
    const card = document.createElement("article");
    card.className = "showCard";
    const img = document.createElement("img");
    img.src = s.image ? s.image.medium : "";
    const mid = document.createElement("div");
    const title = document.createElement("h2");
    title.className = "showTitle";
    title.innerHTML = s.name;
    title.addEventListener("click", ()=>openShow(s.id));
    const summary = document.createElement("div");
    summary.className = "showSummary";
    summary.appendChild(createSummaryElement(s.summary || "No summary available", 250));
    mid.appendChild(title);
    mid.appendChild(summary);
    const meta = document.createElement("aside");
    meta.className = "showMeta";
    meta.innerHTML = `<strong>Rated:</strong> ${s.rating && s.rating.average ? s.rating.average : "N/A"}<br>
    <strong>Genres:</strong> ${s.genres.join(" | ")}<br>
    <strong>Status:</strong> ${s.status}<br>
    <strong>Runtime:</strong> ${s.runtime || "N/A"} min`;
    const fav = document.createElement("span");
    fav.className = "favStar";
    fav.innerHTML = "★";
    if(favs.includes(s.id)) fav.classList.add("active");
    fav.addEventListener("click", (e)=>{
      e.stopPropagation();
      let f = loadFavourites();
      if(f.includes(s.id)){ f = f.filter(x=>x!==s.id); fav.classList.remove("active") }
      else{ f.push(s.id); fav.classList.add("active") }
      saveFavourites(f);
    });
    card.appendChild(img);
    card.appendChild(mid);
    card.appendChild(meta);
    card.appendChild(fav);
    showsView.appendChild(card);
  });
  document.body.style.background = "";
  showsView.classList.remove("hidden");
  episodesView.classList.add("hidden");
  personView.classList.add("hidden");
  backBtn.classList.add("hidden");
  episodeSelector.classList.add("hidden");
  episodeSearch.classList.add("hidden");
  countDisplay.classList.add("hidden");
}

function createSummaryElement(html, max){
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const txt = tmp.textContent || tmp.innerText || "";
  if(txt.length <= max){
    const p = document.createElement("p");
    p.textContent = txt;
    return p;
  }
  const p = document.createElement("p");
  const short = txt.slice(0,max).trim();
  p.textContent = short + "…";
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = " read more";
  a.style.marginLeft = "6px";
  a.addEventListener("click",(e)=>{
    e.preventDefault();
    if(a.textContent === " read more"){
      p.textContent = txt;
      a.textContent = " show less";
      p.appendChild(a);
    } else {
      p.textContent = short + "…";
      a.textContent = " read more";
      p.appendChild(a);
    }
  });
  p.appendChild(a);
  return p;
}

async function openShow(showId){
  currentShowId = showId;
  episodesPage = 1;
  if(!episodesCache[showId]){
    const r = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    episodesCache[showId] = await r.json();
  }
  currentEpisodes = episodesCache[showId];
  buildEpisodeSelector(currentEpisodes);
  renderEpisodesPage();
  applyThemeForShow(showId);
  history.pushState({view:"episodes",showId}, "", `?show=${showId}`);
}

function buildEpisodeSelector(list){
  episodeSelector.innerHTML = "";
  list.forEach(ep=>{
    const op = document.createElement("option");
    op.value = ep.id;
    const code = `S${String(ep.season).padStart(2,"0")}E${String(ep.number).padStart(2,"0")}`;
    op.textContent = `${code} - ${ep.name}`;
    episodeSelector.appendChild(op);
  });
}

function renderEpisodesPage(){
  showsView.classList.add("hidden");
  episodesView.classList.remove("hidden");
  personView.classList.add("hidden");
  backBtn.classList.remove("hidden");
  episodeSelector.classList.remove("hidden");
  episodeSearch.classList.remove("hidden");
  countDisplay.classList.remove("hidden");
  episodesView.innerHTML = "";
  const start = 0;
  const end = episodesPage * EPISODES_PER_PAGE;
  const slice = currentEpisodes.slice(start, end);
  slice.forEach(ep=>{
    const card = document.createElement("div");
    card.className = "episodeCard";
    const h = document.createElement("h3");
    const code = `S${String(ep.season).padStart(2,"0")}E${String(ep.number).padStart(2,"0")}`;
    h.textContent = `${ep.name} - ${code}`;
    const img = document.createElement("img");
    img.src = ep.image ? ep.image.medium : "";
    const sum = document.createElement("p");
    sum.appendChild(createSummaryElement(ep.summary || "No summary available", 220));
    const notes = document.createElement("textarea");
    notes.className = "noteArea";
    const notesStore = loadNotes();
    notes.value = notesStore[ep.id] || "";
    notes.addEventListener("input", ()=>{
      const s = loadNotes();
      s[ep.id] = notes.value;
      saveNotes(s);
    });
    const castWrap = document.createElement("div");
    castWrap.style.marginTop = "8px";
    castWrap.style.fontSize = "13px";
    castWrap.style.color = "#444";
    castWrap.textContent = "Cast: ";
    fetchShowCast(currentShowId, castWrap);
    card.appendChild(h);
    card.appendChild(img);
    card.appendChild(sum);
    card.appendChild(castWrap);
    card.appendChild(notes);
    episodesView.appendChild(card);
  });
  if(end < currentEpisodes.length){
    const wrap = document.createElement("div");
    wrap.className = "loadMoreWrap";
    const btn = document.createElement("button");
    btn.className = "loadMoreBtn";
    btn.textContent = "Load More";
    btn.addEventListener("click", ()=>{
      episodesPage++;
      renderEpisodesPage();
    });
    wrap.appendChild(btn);
    episodesView.appendChild(wrap);
  }
  countDisplay.textContent = `Displaying ${Math.min(end, currentEpisodes.length)}/${currentEpisodes.length} episodes.`;
}

async function fetchShowCast(showId, container){
  if(castCache[showId]){
    renderCast(castCache[showId], container);
    return;
  }
  try{
    const r = await fetch(`https://api.tvmaze.com/shows/${showId}/cast`);
    const data = await r.json();
    castCache[showId] = data;
    renderCast(data, container);
  }catch(e){
    container.textContent += "n/a";
  }
}

function renderCast(list, container){
  container.innerHTML = "";
  list.slice(0,6).forEach(item=>{
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = item.person.name;
    a.style.marginRight = "8px";
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      openPerson(item.person.id);
    });
    container.appendChild(a);
  });
}

async function openPerson(personId){
  showsView.classList.add("hidden");
  episodesView.classList.add("hidden");
  personView.classList.remove("hidden");
  backBtn.classList.remove("hidden");
  episodeSelector.classList.add("hidden");
  episodeSearch.classList.add("hidden");
  countDisplay.classList.add("hidden");
  personView.innerHTML = "";
  const r = await fetch(`https://api.tvmaze.com/people/${personId}/castcredits?embed=show`);
  const data = await r.json();
  const title = document.createElement("h2");
  title.textContent = "Shows featuring this person";
  personView.appendChild(title);
  const grid = document.createElement("div");
  grid.className = "personGrid";
  data.forEach(c=>{
    const sh = c._embedded.show;
    const card = document.createElement("div");
    card.className = "personCard";
    const img = document.createElement("img");
    img.src = sh.image ? sh.image.medium : "";
    const h = document.createElement("div");
    h.style.fontWeight = "700";
    h.style.margin = "8px 0";
    h.textContent = sh.name;
    const p = document.createElement("p");
    p.textContent = sh.summary ? (sh.summary.replace(/<[^>]+>/g,"").slice(0,160)+"…") : "";
    card.appendChild(img);
    card.appendChild(h);
    card.appendChild(p);
    card.addEventListener("click", ()=>openShow(sh.id));
    grid.appendChild(card);
  });
  personView.appendChild(grid);
  history.pushState({view:"person", personId}, "", `?person=${personId}`);
}

function applyThemeForShow(showId){
  const themes = {
    82:{bg:"#111", color:"#f4d03f"},
    169:{bg:"#0b0", color:"#fff"}
  };
  const t = themes[showId];
  if(t){ document.body.style.background = t.bg; document.body.style.color = t.color }
  else { document.body.style.background = ""; document.body.style.color = "" }
}

function handleShowSearch(){
  const q = showSearch.value.trim().toLowerCase();
  const sorted = [...allShows];
  if(sortShows.value === "rating"){
    sorted.sort((a,b)=> (b.rating.average||0) - (a.rating.average||0));
  } else {
    sorted.sort((a,b)=> a.name.localeCompare(b.name));
  }
  const filtered = sorted.filter(s=>{
    return s.name.toLowerCase().includes(q) ||
           s.genres.join(" ").toLowerCase().includes(q) ||
           (s.summary && s.summary.toLowerCase().includes(q));
  });
  renderShowList(filtered);
}

function handleEpisodeSearch(){
  const q = episodeSearch.value.trim().toLowerCase();
  const filtered = currentEpisodes.filter(ep=>{
    return ep.name.toLowerCase().includes(q) ||
           (ep.summary && ep.summary.toLowerCase().includes(q));
  });
  currentEpisodes = episodesCache[currentShowId];
  const temp = filtered;
  episodesView.innerHTML = "";
  temp.forEach(ep=>{
    const card = document.createElement("div");
    card.className = "episodeCard";
    const h = document.createElement("h3");
    const code = `S${String(ep.season).padStart(2,"0")}E${String(ep.number).padStart(2,"0")}`;
    h.textContent = `${ep.name} - ${code}`;
    const img = document.createElement("img");
    img.src = ep.image ? ep.image.medium : "";
    const sum = document.createElement("p");
    sum.appendChild(createSummaryElement(ep.summary||"",220));
    card.appendChild(h); card.appendChild(img); card.appendChild(sum);
    episodesView.appendChild(card);
  });
  countDisplay.textContent = `Displaying ${temp.length}/${episodesCache[currentShowId].length} episodes.`;
}

function jumpToEpisode(){
  const id = episodeSelector.value;
  const idx = episodesCache[currentShowId].findIndex(e=>e.id==id);
  const card = episodesView.children[idx];
  if(card) card.scrollIntoView({behavior:"smooth"});
}

window.onpopstate = (e)=>{
  const s = e.state;
  if(!s || s.view === "shows") renderShowList(allShows);
  else if(s.view === "episodes") openShow(s.showId);
  else if(s.view === "person") openPerson(s.personId);
};

document.addEventListener("click", (ev)=>{
  if(ev.target && ev.target.matches && ev.target.matches(".favStar")) ev.stopPropagation();
});

backBtn.addEventListener("click", ()=>{
  history.pushState({view:"shows"},"","?shows");
  renderShowList(allShows);
});

showSearch.addEventListener("input", handleShowSearch);
sortShows.addEventListener("change", handleShowSearch);
episodeSearch.addEventListener("input", handleEpisodeSearch);
episodeSelector.addEventListener("change", jumpToEpisode);

(async function init(){
  await fetchShows();
})();
