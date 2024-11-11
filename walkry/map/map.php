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
    <script src="test.js"></script>
</head>
<body>
    <div class="container">
        <main>
            <div id="controls">
                <label for="start">スタート地点:</label>
                <input type="text" id="start" placeholder="住所または場所名を入力">
                <br>
                <label for="waypoint">経由地点:</label>
                <input type="text" id="waypoint" placeholder="住所または場所名を入力">
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
                <div id="walked-distance">歩いた距離: </div>
                <div id="route-duration"></div>
            </div>
        </main>
        <div id="map"></div>
        <nav>
            <ul>
                <li><a href="../home/home.php">ホーム</a></li>
                <li><a href="map.php" class="active">マップ</a></li>
                <li><a href="../graph/graph.php">グラフ</a></li>
                <li><a href="../contact/mypage.php">マイページ</a></li>
            </ul>
        </nav>
    </div>
</body>
</html>
