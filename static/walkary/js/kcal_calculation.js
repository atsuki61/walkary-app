document.addEventListener("DOMContentLoaded", () => {
    const weight = JSON.parse(localStorage.getItem("userWeight")) || 0;
    let walkedDistance = JSON.parse(localStorage.getItem("walked_distance")) || 0;

    const walking_kcalElement = document.getElementById("walk-kcal");
    const running_kcalElement = document.getElementById("run-kcal");

    const calculateWalkingKcal = (distanceInMeters) => {
        const distanceInKm = distanceInMeters / 1000;
        return Math.max(weight * distanceInKm * 1.05, 0);
    };

    const calculateRunningKcal = (distanceInMeters) => {
        const distanceInKm = distanceInMeters / 1000;
        return Math.max(weight * distanceInKm * 1.25, 0);
    };

    const updateKcalDisplay = () => {
        const walkingKcal = calculateWalkingKcal(walkedDistance);
        const runningKcal = calculateRunningKcal(walkedDistance);

        walking_kcalElement.innerHTML = `
            <img src="/static/walkary/icons/walk.png" alt="歩行アイコン">
            <span class="action-label">歩行</span>
            <span class="kcal-value">${walkingKcal.toFixed(2)} kcal</span>
        `;
        
        running_kcalElement.innerHTML = `
            <img src="/static/walkary/icons/run.png" alt="ランニングアイコン">
            <span class="action-label">ランニング</span>
            <span class="kcal-value">${runningKcal.toFixed(2)} kcal</span>
        `;

        // 画像サイズを直接設定
        walking_kcalElement.querySelector('img').style.width = '24px';
        walking_kcalElement.querySelector('img').style.height = '24px';
        running_kcalElement.querySelector('img').style.width = '24px';
        running_kcalElement.querySelector('img').style.height = '24px';
    };

    updateKcalDisplay();

    window.addEventListener("storage", (event) => {
        if (event.key === "walked_distance") {
            walkedDistance = JSON.parse(event.newValue) || 0;
            updateKcalDisplay();
        }
    });
});
