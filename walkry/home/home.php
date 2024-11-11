<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('Asia/Tokyo');

// index.php
include '../db_config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

if(!isset($db_steps)) {
    $db_steps = 0;
}

if(!isset($db_Shintyo)) {
    $db_Shintyo = 0;
}

if(!isset($db_weight)) {
    $db_weight = 0;
}

if(!isset($nokorinohosu)) {
    $nokorinohosu = 0;
}

if(!isset($dbmokuhyo)) {
    $dbmokuhyo = 0;
}

// my_tableからデータを取得
$sql = "SELECT A FROM my_table WHERE user_id = ?";
$stmt = $conn2->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_steps);
$stmt->fetch();
$stmt->close(); // 追加: ステートメントを閉じる

$sql = "SELECT B FROM my_t WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_Shintyo);
$stmt->fetch();
$stmt->close(); // 追加: ステートメントを閉じる

if(!isset($db_Shintyo)) {
    $db_Shintyo = 0;
}

$sql = "SELECT C FROM my WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_weight);
$stmt->fetch();
$stmt->close();

$sql = "SELECT DBMOKUHYO_1 FROM DBMOKUHYO WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($dbmokuhyo);
$stmt->fetch();
$stmt->close();

if(!isset($dbmokuhyo)) {
    $dbmokuhyo = 0;
}

$h1=($db_steps/1000)/4;
$h2=($db_steps/1000)/6.4;
$aruku_kcal=3.0*$db_weight*$h1*1.05;
$hasiru_kcal=11.0*$db_weight*$h2*1.05;
$nokorinohosu = $dbmokuhyo - $db_steps;

    $sql = "SELECT last_access_time FROM U WHERE user_id = ?";
    $stmt = $conn2->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($last_access_time);
    $stmt->fetch();
    $stmt->close();

    if(!isset($last_access_time)){
        $sql = "INSERT INTO U (user_id) VALUES (?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

    }

    $stmt = $conn2->prepare("SELECT last_access_time FROM U WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($lat);
    $stmt->fetch();
    $stmt->close();
    
    $lat = new DateTime($lat);
    $NOW = new DateTime();
    
    if ($lat->format('Y-m-d') != $NOW->format('Y-m-d')) {
        $Re = 0;
        $sql = "UPDATE my_table SET A = ? WHERE user_id = ?";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("ii", $Re, $user_id);
        $stmt->execute();
    }
    
    $NOW_str = $NOW->format('Y-m-d');
    $sql = "UPDATE U SET last_access_time = ? WHERE user_id = ?";
    $stmt = $conn2->prepare($sql);
    $stmt->bind_param("si", $NOW_str, $user_id);
    $stmt->execute();
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Walkary</title>
    <link rel="stylesheet" href="../index.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>今日のワークアウト</h1>
        </header>
        <main>
            <div class="circle">
                <p>目標 <span id="target-steps"><?php echo $dbmokuhyo; ?></span>m</p>
                <p class="steps">本日の歩数 <span id="steps"><?php echo $db_steps; ?></span>m</p>
                <p>目標まで残り：</br><span id="remaining"><?php if($nokorinohosu<=0){echo 0;}else{echo $nokorinohosu;}?></span>m</p>
            </div>
            <div class="info-buttons">
                <button class="info-button" id="goal-days"><?php  echo round($aruku_kcal, 2);?>kcal(歩いた場合)</button>
                <button class="info-button" id="calories-burned"><?php echo round($hasiru_kcal, 2); ?>kcal(走った場合)</button>
            </div>

            <button onclick="location.href='../map/map.php'">ルートを作成する</button>
        </main>
        <nav>
            <ul>
                <li><a href="home.php">ホーム</a></li>
                <li><a href="../map/map.php">マップ</a></li>
                <li><a href="../graph/graph.php">グラフ</a></li>
                <li><a href="../contact/mypage.php">マイページ</a></li>
            </ul>
        </nav>
    </div>
    <script src="../scripts.js"></script>
    <div style="text-align: center">
        <a href="https://px.a8.net/svt/ejp?a8mat=3ZBNS2+42GNLE+0K+10A5LT" rel="nofollow">
        <img border="0" width="234" height="60" alt="" src="https://www27.a8.net/svt/bgt?aid=240729122246&wid=001&eno=01&mid=s00000000002006094000&mc=1"></a>
        <img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=3ZBNS2+42GNLE+0K+10A5LT" alt="">
    </div>
</body>
</html>
