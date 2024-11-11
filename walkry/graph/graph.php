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

    $sql = "SELECT total_01 FROM total WHERE user_id = ?";
    $stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($db_total);
    $stmt->fetch();
    $stmt->close();

    $ZERO=0;

    if(!isset($db_total)){
        $sql = "INSERT INTO total (user_id, total_01) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $ZERO);
        $stmt->execute();
    }

    if($db_steps==0&&$db_weight==0){
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

    $db_total=$db_total+$steps;

    $sql = "UPDATE total SET total_01 = ? WHERE user_id = ?";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("si", $db_total, $user_id);
        $stmt->execute();
}
?>


<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
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
                <li><a href="../contact/mypage.php">マイページ</a></li>
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

            const today = new Date();
            const year = today.getFullYear();

            const todayDate = `${year}年 ${today.getMonth() + 1}/${today.getDate()}`;
            const yesterdayDate = `${year}年 ${today.getMonth() + 1}/${today.getDate() - 1}`;

            function getDateDaysAgo(daysAgo) {
                const date = new Date();
                date.setDate(today.getDate() - daysAgo);
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const year = date.getFullYear();

                return `${year}年 ${month}/${day}`;
            }

            const labels = [todayDate, yesterdayDate];
            for (let i = 2; i < 14; i++) {
                labels.push(getDateDaysAgo(i));
            }

            // ラベルの順序を逆にする
            labels.reverse();

            // グラフ描画 (ラベルを逆にしたものを使用)
            const stepsChart = new Chart(stepsChartCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '距離(m)',
                        borderColor: 'blue',
                        backgroundColor: 'lightblue',
                        data: stepsDataArray.reverse(),  // データも逆にする
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 100  // Y軸のメモリを細かくする
                            }
                        }
                    }
                }
            });

            const weightChart = new Chart(weightChartCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '体重(kg)',
                        borderColor: 'red',
                        backgroundColor: 'lightcoral',
                        data: weightDataArray.reverse(),  // データも逆にする
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
                                },
                                stepSize: 0.5  // Y軸のメモリを細かくする
                            }
                        }
                    }
                }
            });
        });
});
</script>


    <div style="text-align: center">
        <a href="https://px.a8.net/svt/ejp?a8mat=3ZBNS2+42GNLE+0K+10A5LT" rel="nofollow">
        <img border="0" width="234" height="60" alt="" src="https://www27.a8.net/svt/bgt?aid=240729122246&wid=001&eno=01&mid=s00000000002006094000&mc=1"></a>
        <img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=3ZBNS2+42GNLE+0K+10A5LT" alt="">
    </div>
</body>
</html>