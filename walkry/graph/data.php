<?php
include '../db_config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT steps, weight FROM user_data WHERE user_id = :user_id ORDER BY id DESC LIMIT 14");
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stepsData = array_column($data, 'steps');
$weightData = array_column($data, 'weight');

header('Content-Type: application/json');
echo json_encode(['steps' => $stepsData, 'weight' => $weightData]);
?>