
const DEFAULT_DATA_URL = "collocations.json";
const STORAGE_DATA = "collocationSprint.customData";
const STORAGE_PROGRESS = "collocationSprint.progress";
const STORAGE_SESSIONS = "collocationSprint.sessions";

let items = [];
let order = [];
let currentPos = 0;
let currentMode = "recall";
let speakInterval = null;

const $ = (id) => document.getElementById(id);
const views = {
  recall: $("recallMode"),
  speak: $("speakMode"),
  shadow: $("shadowMode"),
  library: $("libraryMode")
};

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_PROGRESS)) || {}; }
  catch { return {}; }
}
function saveProgress(progress) {
  localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
}
function getSessions() {
  return Number(localStorage.getItem(STORAGE_SESSIONS) || 0);
}
function bumpSessions() {
  localStorage.setItem(STORAGE_SESSIONS, String(getSessions() + 1));
}

async function init() {
  const res = await fetch(DEFAULT_DATA_URL);
  const baseItems = await res.json();
  let custom = [];
  try { custom = JSON.parse(localStorage.getItem(STORAGE_DATA)) || []; } catch {}
  const seen = new Set();
  items = [...baseItems, ...custom].filter(item => {
    const key = item.id || item.en;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  order = items.map((_, i) => i);
  updateStats();
  populateCategories();
  renderCurrent();
  renderLibrary();
  bindEvents();
}

function currentItem() { return items[order[currentPos]]; }

function renderCurrent() {
  if (!items.length) return;
  const item = currentItem();
  $("categoryBadge").textContent = item.category || "General";
  $("counter").textContent = `${currentPos + 1} / ${items.length}`;
  $("jaCue").textContent = item.ja;
  $("enAnswer").textContent = item.en;
  $("exampleEn").textContent = item.example_en || "";
  $("exampleJa").textContent = item.example_ja || "";
  $("speakTarget").textContent = item.en;
  $("situationPrompt").textContent = item.prompt_ja || `「${item.en}」を使って、自分の考えを英語で1文話してください。`;
  $("sampleAnswer").textContent = item.example_en || item.en;
  $("shadowText").textContent = item.en;
  $("shadowExample").textContent = item.example_en || "";
  $("answerArea").classList.add("hidden");
  $("sampleArea").classList.add("hidden");
  $("shadowTextArea").classList.add("hidden");
  $("revealBtn").classList.remove("hidden");
  $("speakTimer").textContent = "8";
  restartRecallTimer();
}

function restartRecallTimer() {
  const bar = $("timerBar");
  bar.classList.remove("running");
  void bar.offsetWidth;
  if (currentMode === "recall") bar.classList.add("running");
}

function nextItem() {
  currentPos = (currentPos + 1) % items.length;
  renderCurrent();
}

function rateCurrent(rating) {
  const item = currentItem();
  const progress = loadProgress();
  const old = progress[item.id] || { good: 0, mastered: false };
  if (rating === "mastered") old.mastered = true;
  if (rating === "good") old.good = (old.good || 0) + 1;
  if (rating === "again") old.mastered = false;
  progress[item.id] = old;
  saveProgress(progress);
  bumpSessions();
  updateStats();
  nextItem();
}

function updateStats() {
  const progress = loadProgress();
  const mastered = Object.values(progress).filter(v => v.mastered).length;
  $("masteredCount").textContent = mastered;
  $("totalCount").textContent = `${items.length || 25} chunks`;
  $("streakText").textContent = `今日の練習 ${getSessions()}回`;
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll(".mode-card").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
  Object.entries(views).forEach(([key, view]) => view.classList.toggle("hidden", key !== mode));
  $("trainerPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  if (mode === "recall") restartRecallTimer();
}

function shuffle() {
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  currentPos = 0;
  renderCurrent();
}

function speak(text, onend) {
  if (!("speechSynthesis" in window)) {
    alert("このブラウザでは音声読み上げが利用できません。");
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}

function startSpeakingChallenge() {
  clearInterval(speakInterval);
  let sec = 8;
  $("speakTimer").textContent = sec;
  $("sampleArea").classList.add("hidden");
  speakInterval = setInterval(() => {
    sec -= 1;
    $("speakTimer").textContent = sec;
    if (sec <= 0) {
      clearInterval(speakInterval);
      $("sampleArea").classList.remove("hidden");
      bumpSessions();
      updateStats();
    }
  }, 1000);
}

function populateCategories() {
  const categories = [...new Set(items.map(x => x.category).filter(Boolean))].sort();
  $("categoryFilter").innerHTML = '<option value="">All categories</option>' +
    categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function renderLibrary() {
  const query = ($("searchInput")?.value || "").toLowerCase().trim();
  const cat = $("categoryFilter")?.value || "";
  const filtered = items.filter(item => {
    const hay = `${item.en} ${item.ja} ${item.category}`.toLowerCase();
    return (!query || hay.includes(query)) && (!cat || item.category === cat);
  });
  $("libraryList").innerHTML = filtered.map(item => `
    <article class="library-item">
      <strong>${escapeHtml(item.en)}</strong>
      <span class="ja">${escapeHtml(item.ja)}</span>
      <span class="mini-category">${escapeHtml(item.category || "General")}</span>
    </article>
  `).join("") || "<p>該当するコロケーションがありません。</p>";
}

function escapeHtml(str="") {
  return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function validateItems(data) {
  const arr = Array.isArray(data) ? data : [data];
  const valid = arr.filter(x => x && x.en && x.ja).map((x, idx) => ({
    id: x.id || x.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `custom-${Date.now()}-${idx}`,
    en: x.en,
    ja: x.ja,
    category: x.category || "Custom",
    example_en: x.example_en || "",
    example_ja: x.example_ja || "",
    prompt_ja: x.prompt_ja || `「${x.en}」を使って、自分の考えを英語で1文話してください。`
  }));
  if (!valid.length) throw new Error("en と ja を含むデータが見つかりません。");
  return valid;
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const incoming = validateItems(JSON.parse(reader.result));
      const currentCustom = JSON.parse(localStorage.getItem(STORAGE_DATA) || "[]");
      const merged = [...currentCustom, ...incoming];
      localStorage.setItem(STORAGE_DATA, JSON.stringify(merged));
      alert(`${incoming.length}件を追加しました。ページを再読み込みします。`);
      location.reload();
    } catch (e) {
      alert(`JSONを読み込めませんでした: ${e.message}`);
    }
  };
  reader.readAsText(file);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "collocations.json";
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll() {
  if (!confirm("追加したJSONデータと学習進捗をリセットします。初期25件は残ります。")) return;
  localStorage.removeItem(STORAGE_DATA);
  localStorage.removeItem(STORAGE_PROGRESS);
  localStorage.removeItem(STORAGE_SESSIONS);
  location.reload();
}

function bindEvents() {
  document.querySelectorAll(".mode-card").forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  $("shuffleBtn").addEventListener("click", shuffle);
  $("revealBtn").addEventListener("click", () => {
    $("answerArea").classList.remove("hidden");
    $("revealBtn").classList.add("hidden");
  });
  $("speakChunkBtn").addEventListener("click", () => speak(currentItem().en));
  document.querySelectorAll("[data-rating]").forEach(btn => btn.addEventListener("click", () => rateCurrent(btn.dataset.rating)));
  $("startSpeakingBtn").addEventListener("click", startSpeakingChallenge);
  $("speakSampleBtn").addEventListener("click", () => speak(currentItem().example_en || currentItem().en));
  document.querySelectorAll("[data-speak-rating]").forEach(btn => btn.addEventListener("click", () => {
    if (btn.dataset.speakRating === "good") rateCurrent("good");
    else renderCurrent();
  }));
  $("playAudioBtn").addEventListener("click", () => {
    $("audioOrb").classList.add("playing");
    speak(currentItem().en, () => $("audioOrb").classList.remove("playing"));
  });
  $("audioOrb").addEventListener("click", () => $("playAudioBtn").click());
  $("showShadowTextBtn").addEventListener("click", () => $("shadowTextArea").classList.remove("hidden"));
  $("nextShadowBtn").addEventListener("click", nextItem);
  $("searchInput").addEventListener("input", renderLibrary);
  $("categoryFilter").addEventListener("change", renderLibrary);

  const dialog = $("settingsDialog");
  $("settingsBtn").addEventListener("click", () => dialog.showModal());
  $("jsonFileInput").addEventListener("change", e => {
    if (e.target.files[0]) importJson(e.target.files[0]);
  });
  $("exportBtn").addEventListener("click", exportJson);
  $("resetBtn").addEventListener("click", resetAll);
}

init().catch(err => {
  console.error(err);
  document.body.innerHTML = `<main style="padding:30px;font-family:sans-serif"><h1>読み込みエラー</h1><p>${escapeHtml(err.message)}</p><p>GitHub Pages またはローカルWebサーバーで開いてください。</p></main>`;
});
