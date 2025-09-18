document.addEventListener("DOMContentLoaded", () => {
  const walkedDistance = localStorage.getItem("walked_distance");
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

    const walkedData = JSON.parse(localStorage.getItem("walked_data")) || [];
    const existingDataIndex = walkedData.findIndex((data) => data.date === today);
    if (existingDataIndex === -1) {
      walkedData.push({ date: today, steps: walked });
    } else {
      walkedData[existingDataIndex].steps = walked;
    }
    localStorage.setItem("walked_data", JSON.stringify(walkedData));
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


