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

        walking_kcalElement.innerText = `${walkingKcal.toFixed(2)} kcal`;
        running_kcalElement.innerText = `${runningKcal.toFixed(2)} kcal`;
    };

    updateKcalDisplay();

    window.addEventListener("storage", (event) => {
        if (event.key === "walked_distance") {
            walkedDistance = JSON.parse(event.newValue) || 0;
            updateKcalDisplay();
        }
    });
});
