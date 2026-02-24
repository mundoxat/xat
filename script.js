/* ---------------------------
   YouTube Iframe API (GLOBAL)
   Requires in index.html:
   <script src="https://www.youtube.com/iframe_api"></script>
   <div id="ytPlayer"></div>
---------------------------- */

window.ytPlayer = null;
window.__ytMuted = true;      // UI state (starts muted)
window.__ytReady = false;

function updateSoundButton() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  btn.textContent = window.__ytMuted ? "Sound: Off" : "Sound: On";
}

// Try to play (some browsers need retries)
function tryPlay() {
  if (!window.ytPlayer || !window.__ytReady) return;
  try {
    window.ytPlayer.playVideo();
  } catch {}
}

// Applies mute state to player (if ready)
function applyMuteState() {
  if (!window.ytPlayer || !window.__ytReady) return;
  try {
    if (window.__ytMuted) window.ytPlayer.mute();
    else window.ytPlayer.unMute();
  } catch {}
}

window.onYouTubeIframeAPIReady = function () {
  window.ytPlayer = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
    videoId: "PazAofvr30A",
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      loop: 1,
      playlist: "PazAofvr30A"
    },
    events: {
      onReady: (event) => {
        window.__ytReady = true;

        // Autoplay is usually only allowed when muted
        window.__ytMuted = true;
        updateSoundButton();

        try {
          event.target.mute();
          event.target.playVideo();
        } catch {}

        // Retry play a few times (helps some browsers)
        let tries = 0;
        const t = setInterval(() => {
          tries++;
          tryPlay();
          if (tries >= 8) clearInterval(t);
        }, 350);
      },
      onStateChange: () => {
        // keep UI in sync if needed
        updateSoundButton();
      }
    }
  });
};

(() => {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const dotsWrap = document.getElementById("dots");
  const counter = document.getElementById("counter");
  const restartBtn = document.getElementById("restartBtn");

  let index = 0;
  let locked = false;

  // --- Build dots UI
  const dots = scenes.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.ariaLabel = `Go to scene ${i + 1}`;
    b.addEventListener("click", () => goTo(i));
    dotsWrap?.appendChild(b);
    return b;
  });

  function pad2(n) { return String(n).padStart(2, "0"); }

  function render() {
    scenes.forEach((s, i) => s.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    if (counter) counter.textContent = `${pad2(index + 1)} / ${pad2(scenes.length)}`;
  }

  function goTo(next) {
    const clamped = Math.max(0, Math.min(scenes.length - 1, next));
    if (clamped === index) return;
    if (locked) return;

    locked = true;
    index = clamped;
    render();
    window.setTimeout(() => (locked = false), 750);
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // --- Wheel handling
  function onWheel(e) {
    e.preventDefault();
    if (locked) return;
    const dy = e.deltaY;
    if (Math.abs(dy) < 6) return;
    if (dy > 0) next();
    else prev();
  }
  window.addEventListener("wheel", onWheel, { passive: false });

  // --- Keyboard (navigation + anti-inspect)
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    // Anti-inspect shortcuts (discourages only)
    if (e.key === "F12") { e.preventDefault(); return; }
    if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) { e.preventDefault(); return; }
    if (e.ctrlKey && key === "u") { e.preventDefault(); return; }

    // Navigation
    if (["arrowdown", "pagedown", " "].includes(key)) { e.preventDefault(); next(); }
    if (["arrowup", "pageup"].includes(key)) { e.preventDefault(); prev(); }
    if (key === "home") goTo(0);
    if (key === "end") goTo(scenes.length - 1);
  });

  // --- Touch support
  let touchStartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY - endY;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) next();
    else prev();
  }, { passive: true });

  if (restartBtn) restartBtn.addEventListener("click", () => goTo(0));

  // --- Disable right-click
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // --- Sound button
  const soundToggle = document.getElementById("soundToggle");
  updateSoundButton();

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      // Toggle UI immediately
      window.__ytMuted = !window.__ytMuted;
      updateSoundButton();

      // Apply to player + ensure playing
      applyMuteState();
      tryPlay();
    });
  }

  // ✅ The reliable way: on first user interaction anywhere, unmute + play
  // This makes it feel like "it starts automatically" right after the first scroll/click.
  const unlockSoundOnce = () => {
    // Try to start playing
    tryPlay();

    // Unmute automatically on first interaction
    window.__ytMuted = false;
    updateSoundButton();
    applyMuteState();
    tryPlay();

    window.removeEventListener("pointerdown", unlockSoundOnce);
    window.removeEventListener("touchstart", unlockSoundOnce);
    window.removeEventListener("keydown", unlockSoundOnce);
    window.removeEventListener("wheel", unlockSoundOnce);
  };

  window.addEventListener("pointerdown", unlockSoundOnce, { once: true });
  window.addEventListener("touchstart", unlockSoundOnce, { once: true, passive: true });
  window.addEventListener("keydown", unlockSoundOnce, { once: true });
  window.addEventListener("wheel", unlockSoundOnce, { once: true, passive: true });

  // initial render
  render();
})();
