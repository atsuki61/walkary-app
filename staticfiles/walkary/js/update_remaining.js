document.addEventListener("DOMContentLoaded", () => {
    const goalElement = document.getElementById("target-goal");
    const goal = parseInt(goalElement.innerText, 10);

    const walkedDistance = JSON.parse(localStorage.getItem("walked_distance")) || 0;
    const remainingDistance = Math.max(goal - walkedDistance, 0);

    const remainingElement = document.getElementById("remaining");
    remainingElement.innerText = `${remainingDistance.toFixed(0)} m`;
    window.addEventListener("storage", (event) => {
        if (event.key === "walked_distance") {
            const newWalkedDistance = JSON.parse(event.newValue) || 0;
            const newRemainingDistance = Math.max(goal - newWalkedDistance, 0);
            // remainingElement.innerText = `${newRemainingDistance} m`;
            remainingElement.innerText = `${newRemainingDistance.toFixed(0)} m`;
        }
    });
});
