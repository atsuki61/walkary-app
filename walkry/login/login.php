<?php
// login.php
include '../db_config.php';
session_start();

$message = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 入力値の取得とサニタイズ
    $username = htmlspecialchars($_POST['username'], ENT_QUOTES, 'UTF-8');
    $password = $_POST['password'];

    $sql = "SELECT id, password FROM users WHERE username = ?";
    $stmt = $conn2->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $hashed_password);

    if ($stmt->num_rows > 0) {
        $stmt->fetch();
        if (password_verify($password, $hashed_password)) {
            $_SESSION['user_id'] = $id;
            header("Location: ../home/home.php");
            exit();
        } else {
            $message = "パスワードが間違っています。";
        }
    } else {
        $message = "ユーザー名が存在しません。";
    }

    $stmt->close();
}

$conn2->close();
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ログイン - ウォーキングアプリ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- CSSファイルの読み込み -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- ロゴの表示 -->
        <div class="logo">
            <img src="images/walkry2.png" alt="ウォーキングアプリのロゴ">
        </div>
        <div class="form-wrapper">
            <h2>ログイン</h2>
            <?php if ($message) { echo "<div class='message'>$message</div>"; } ?>
            <form method="POST" action="login.php">
                <input type="text" name="username" placeholder="ユーザー名" required>
                <div class="password-field">
                    <input type="password" name="password" id="password" placeholder="パスワード" required>
                    <span class="toggle-password" onclick="togglePasswordVisibility()">👁️</span>
                </div>
                <input type="submit" value="ログイン">
            </form>
            <div class="additional-info">
                <p>初めてご利用ですか？ <a href="register.php">新規登録</a></p>
            </div>
        </div>
    </div>

    <script>
    function togglePasswordVisibility() {
        var passwordInput = document.getElementById('password');
        var type = passwordInput.getAttribute('type');
        if (type === 'password') {
            passwordInput.setAttribute('type', 'text');
        } else {
            passwordInput.setAttribute('type', 'password');
        }
    }
    </script>
</body>
</html>
