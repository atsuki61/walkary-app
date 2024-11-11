const stepsDataArray = [];
const weightDataArray = [];

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const stepsInput = document.getElementById('steps').value;
    const weightInput = document.getElementById('weight').value;

    const stepsArray = stepsInput.split(',').map(Number);
    const weightArray = weightInput.split(',').map(Number);

    addData(stepsArray, weightArray);
    updateCharts();
});

const days = ['日', '月', '火', '水', '木', '金', '土'];

const stepsChartCtx = document.getElementById('stepsChart').getContext('2d');
const weightChartCtx = document.getElementById('weightChart').getContext('2d');

const stepsChart = new Chart(stepsChartCtx, {
    type: 'line',
    data: {
        labels: days,
        datasets: [
            {
                label: '歩数',
                borderColor: 'blue',
                backgroundColor: 'lightblue',
                data: [],
                fill: false
            },
            {
                label: '平均',
                borderColor: 'green',
                backgroundColor: 'lightgreen',
                data: [],
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const weightChart = new Chart(weightChartCtx, {
    type: 'line',
    data: {
        labels: days,
        datasets: [
            {
                label: '体重',
                borderColor: 'red',
                backgroundColor: 'lightcoral',
                data: [],
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

function addData(stepsArray, weightArray) {
    stepsDataArray.push(...stepsArray);
    weightDataArray.push(...weightArray);
}

function updateCharts() {
    // Update steps chart data
    stepsChart.data.datasets[0].data = stepsDataArray.slice(-7); // Show last 7 entries

    // Calculate the average for steps data
    const stepsAvg = stepsDataArray.reduce((a, b) => a + b, 0) / stepsDataArray.length;
    const avgArray = new Array(stepsDataArray.length).fill(stepsAvg).slice(-7);
    stepsChart.data.datasets[1].data = avgArray;

    // Adjust Y-axis for steps chart based on input data
    const stepsMax = Math.max(...stepsDataArray, 10000);
    stepsChart.options.scales.y.max = stepsMax;

    // Update weight chart data
    weightChart.data.datasets[0].data = weightDataArray.slice(-7); // Show last 7 entries

    // Adjust Y-axis for weight chart based on input data
    const weightMin = Math.min(...weightDataArray);
    const weightMax = Math.max(...weightDataArray);
    weightChart.options.scales.y.min = Math.floor(weightMin) - 1;
    weightChart.options.scales.y.max = Math.ceil(weightMax) + 1;

    // Update the charts
    stepsChart.update();
    weightChart.update();
}
