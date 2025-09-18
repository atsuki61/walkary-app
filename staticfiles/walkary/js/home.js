document.addEventListener("DOMContentLoaded", () => {
  // SafeStorage がない環境でも動けるようフォールバック
  const StorageAPI = typeof SafeStorage !== 'undefined' ? SafeStorage : {
    readJSON: (k, fb) => {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
    },
    getItem: (k) => {
      try { return localStorage.getItem(k); } catch { return null; }
    },
    writeJSON: (k, v) => {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    }
  };

  const walkedDistance = StorageAPI.getItem("walked_distance");
  const today = new Date().toISOString().split("T")[0];
  const targetGoal = parseInt(
    document.getElementById("target-goal").textContent
  );
  const progressCircle = document.querySelector(".progress");
  const circumference = 2 * Math.PI * 48.5; // r=48.5

  function updateProgress(walked) {
    const progress = Math.min((walked / targetGoal) * 100, 100);
    const offset = circumference - (progress / 100) * circumference;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;

    const progressBackground = document.querySelector(
      ".progress-background"
    );
    if (progressBackground) {
      progressCircle.style.display = "block";
      progressBackground.style.display = "block";
    }

    const remaining = Math.max(0, targetGoal - walked);
    const remainingEl = document.getElementById("remaining");
    if (remainingEl) remainingEl.innerText = `${remaining} m`;

    const circle = document.querySelector(".circle");
    if (walked >= targetGoal) {
      if (circle && !circle.classList.contains("goal-achieved")) {
        circle.classList.add("goal-achieved");
        showAchievementMessage();
      }
    } else if (circle) {
      circle.classList.remove("goal-achieved");
    }
  }

  function showAchievementMessage() {
    const message = document.createElement("div");
    message.className = "achievement-message";
    message.innerHTML = `
            <div class="achievement-popup" role="status" aria-live="polite">
                <h3>🎉 目標達成！</h3>
                <p>今日の目標距離を達成しました！<br>素晴らしい成果です！</p>
            </div>
        `;
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  if (walkedDistance) {
    const walked = JSON.parse(walkedDistance).toFixed(0);
    const walkedEl = document.getElementById("walked-distance");
    if (walkedEl) walkedEl.innerText = `${walked} m`;
    updateProgress(walked);

    const walkedData = StorageAPI.readJSON("walked_data", []) || [];
    const existingDataIndex = walkedData.findIndex((data) => data.date === today);
    if (existingDataIndex === -1) {
      walkedData.push({ date: today, steps: walked, distance_m: walked });
    } else {
      walkedData[existingDataIndex].steps = walked;
      walkedData[existingDataIndex].distance_m = walked;
    }
    StorageAPI.writeJSON("walked_data", walkedData);
  } else {
    const walkedEl = document.getElementById("walked-distance");
    if (walkedEl) walkedEl.innerText = "0 m";
    updateProgress(0);
  }

  const createBtn = document.getElementById("create-route-btn");
  if (createBtn) {
    const mapUrl = createBtn.dataset.mapUrl;
    createBtn.addEventListener("click", () => {
      if (mapUrl) window.location.href = mapUrl;
    });
  }
});


