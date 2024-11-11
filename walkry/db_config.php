<?php
// db_config.php
$servername = "localhost";
$username = "ll202290";
$password = "6666";
$dbname = "ll202290";

// データベース接続
$conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$conn2 = new mysqli($servername, $username, $password, $dbname);

// 接続確認
if ($conn2->connect_error) {
    die("Connection failed: " . $conn2->connect_error);
}

?>