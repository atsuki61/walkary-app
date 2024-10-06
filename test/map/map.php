<?php //map.php
// index.php
include '../db_config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Walkary</title>
    <link rel="stylesheet" href="../index.css">
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-wUdCx7jMv78-AZ_8LCo9_qPyQJBYmHQ&libraries=geometry"></script>
    <script src="map.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>ルートジェネレーター</h1>
        </header>
        <main>
            <div id="controls">
                <label for="start">スタート地点:</label>
                <input type="text" id="start" placeholder="住所または場所名を入力">
                <br>
                <label for="end">ゴール地点:</label>
                <input type="text" id="end" placeholder="住所または場所名を入力">
                <br>
                地図上で指定
                <button onclick="setMapClickMode('start')">スタート地点</button>
                <button onclick="setMapClickMode('end')">ゴール地点</button>
                <br>
                <label for="distance">距離 (km):</label>
                <input type="number" id="distance" name="distance" value="5" min="1" max="20">
                <button onclick="generateRoute()">ルート生成</button>
                <br>
                <div id="route-distance">ルートの距離: </div>
            </div>
            <div id="map"></div>
        </main>
        <nav>
            <ul>
                <li><a href="../home/home.php">ホーム</a></li>
                <li><a href="map.php">マップ</a></li>
                <li><a href="../graph/graph.php">グラフ</a></li>
                <li><a href="../contact/mypage.php" class="active">マイページ</a></li>
            </ul>
        </nav>
    </div>
    <div style="text-align: center">
    <a href="https://px.a8.net/svt/ejp?a8mat=3ZBNS2+42GNLE+0K+10A5LT"><img src="../koukoku.png" alt="広告"></a>
    </div>
</body>
</html>
