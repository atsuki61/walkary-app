<?php //graph.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// index.php
include '../db_config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

    $sql = "SELECT A FROM my_table WHERE user_id = ?";
    $stmt = $conn2->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($db_steps);
    $stmt->fetch();
    $stmt->close();

    $sql = "SELECT C FROM my WHERE user_id = ?";
    $stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($db_weight);
    $stmt->fetch();
    $stmt->close(); 

    if($db_steps==0&&$db_weight){
        $syokiti=0;

        $sql = "INSERT INTO my_table (user_id, A) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $syokiti);
        $stmt->execute();

        $sql = "INSERT INTO my (user_id, C) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $syokiti);
        $stmt->execute();
    }


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $steps = $_POST['steps'];
    $weight = $_POST['weight'];

    $sql = "UPDATE my_table SET A = ? WHERE user_id = ?";
    $stmt = $conn2->prepare($sql);
    $stmt->bind_param("si", $steps, $user_id);
    $stmt->execute();

    $sql = "UPDATE my SET C = ? WHERE user_id = ?";
    $stmt = $conn2->prepare($sql);
    $stmt->bind_param("si", $weight, $user_id);
    $stmt->execute();


    // user_dataにデータを挿入
    $sql = "INSERT INTO user_data (user_id, steps, weight) VALUES (:user_id, :steps, :weight)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':steps', $steps);
    $stmt->bindParam(':weight', $weight);
    $stmt->execute();
}
?>


<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Walkary</title>
    <link rel="stylesheet" href="../index.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>グラフ</h1>
        </header>
        <main>
            <div class="form-container">
            <form id="dataForm" method="post" action="">
                <label for="steps">距離(m):</label>
                <input type="number" id="steps" name="steps" step="0.01" required>
                <label for="weight">体重(kg):</label>
                <input type="number" id="weight" name="weight" step="0.01" required>
                <button type="submit">送信</button>
            </form>
            </div>
            <div class="chart-container">
                <div class="chart-wrapper">
                    <canvas id="stepsChart"></canvas>
                </div>
                <div class="chart-wrapper">
                    <canvas id="weightChart"></canvas>
                </div>
            </div>
        </main>
        <nav>
            <ul>
                <li><a href="../home/home.php">ホーム</a></li>
                <li><a href="../map/map.php">マップ</a></li>
                <li><a href="graph.php">グラフ</a></li>
                <li><a href="../contact/mypage.php" class="active">マイページ</a></li>
            </ul>
        </nav>
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        fetch('data.php')
            .then(response => response.json())
            .then(data => {
                const stepsDataArray = data.steps;
                const weightDataArray = data.weight;

                const stepsChartCtx = document.getElementById('stepsChart').getContext('2d');
                const weightChartCtx = document.getElementById('weightChart').getContext('2d');

                const stepsChart = new Chart(stepsChartCtx, {
                        type: 'line',
                        data: {
                          
                            labels: ['今日', '昨日', '2日前', '3日前', '4日前', '5日前', '6日前'],
                            datasets: [{
                                label: '距離',
                                borderColor: 'blue',
                                backgroundColor: 'lightblue',
                                data: stepsDataArray,
                                fill: false
                            }]
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
                        labels: ['今日', '昨日', '2日前', '3日前', '4日前', '5日前', '6日前'],
                        datasets: [{
                            label: '体重',
                            borderColor: 'red',
                            backgroundColor: 'lightcoral',
                            data: weightDataArray,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: {
                                    callback: function(value) {
                                        return value.toFixed(2); // 小数点以下2桁まで表示
                                    }
                                }
                            }
                        }
                    }
                });
            });
    });
</script>

    <div style="text-align: center">
    <a href="https://px.a8.net/svt/ejp?a8mat=3ZBNS2+42GNLE+0K+10A5LT"><img src="../koukoku.png" alt="広告"></a>
    </div>
</body>
</html>