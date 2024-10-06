<?php
// データベース接続ファイルをインクルード
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('Asia/Tokyo');
include '../db_config.php';

session_start();

// ヘッダーをJSONに設定
header('Content-Type: application/json');
// POSTされたデータを取得
$input = json_decode(file_get_contents('php://input'), true);
$steps = $input['steps'];
$userId = $input['userId'];

// データベースに歩数を保存
try {
        $sql = "INSERT INTO steps (user_id, steps) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("ii", $user_Id, $steps);
        $stmt->execute();
        

    // 成功レスポンスをJSON形式で返す
    echo json_encode(["status" => "success", "steps" => $steps]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
