function getStepsFromData() {
    const height = parseFloat(localStorage.getItem('userHeight')); // cm
    const distance = parseFloat(localStorage.getItem('walkedDistance')); // km

    if (height && distance) {
        // 計算: 身長 × 0.45 × 距離
        return Math.round(height * 0.45 * distance);
    } else {
        console.warn('必要なデータが不足しています');
        return null;
    }
}

function updateStepsOnHomePage() {
    const steps = getStepsFromData();
    const stepsElement = document.getElementById('steps');
    if (stepsElement) {
        stepsElement.innerText = steps !== null ? steps : '0';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const stepsElement = document.getElementById("steps");
    const steps = stepsElement.innerText;

    // 歩数を保存
    fetch('map/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify({ steps: steps })
    })
    .then(response => response.json())
    .then(data => console.log("Steps saved:", data))
    .catch(error => console.error("Error saving steps:", error));
});


// ページ読み込み時に自動更新
document.addEventListener('DOMContentLoaded', updateStepsOnHomePage);
