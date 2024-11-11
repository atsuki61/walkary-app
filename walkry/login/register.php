<?php
// register.php
include '../db_config.php';

$message = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 入力値の取得とサニタイズ
    $username = htmlspecialchars($_POST['username'], ENT_QUOTES, 'UTF-8');
    $password = $_POST['password'];

    // パスワードのハッシュ化
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // ユーザー名の重複チェック
    $check_user_query = "SELECT id FROM users WHERE username = ?";
    $stmt = $conn2->prepare($check_user_query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $message = "エラー: ユーザー名は既に存在します。";
        $stmt->close();
    } else {
        $stmt->close();

        // ユーザーをデータベースに挿入
        $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("ss", $username, $hashed_password);

        if ($stmt->execute()) {
            $message = "ユーザーが正常に登録されました。<a href='login.php'>ログイン</a>";
        } else {
            $message = "エラー: ユーザー登録に失敗しました。";
        }

        $stmt->close();
    }
}

$conn2->close();
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>新規登録 - ウォーキングアプリ</title>
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
            <h2>新規登録</h2>
            <?php if ($message) { echo "<div class='message'>$message</div>"; } ?>
            <form method="POST" action="register.php">
                <input type="text" name="username" placeholder="ユーザー名" required>
                <div class="password-field">
                    <input type="password" name="password" id="password" placeholder="パスワード" required>
                    <span class="toggle-password" onclick="togglePasswordVisibility()">👁️</span>
                </div>
                <input type="submit" value="登録">
            </form>
            <div class="additional-info">
                <p>すでにアカウントをお持ちですか？ <a href="login.php">ログイン</a></p>
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
