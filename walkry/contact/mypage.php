<?php //mypage.ph
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include '../db_config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

if(!isset($db_weight)) {
    $db_weight = 0;
}

$sql = "SELECT C FROM my WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_weight);
$stmt->fetch();
$stmt->close();

$sql = "SELECT DBNAME_1 FROM DBNAME WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_name);
$stmt->fetch();
$stmt->close();

if(!isset($db_name)) {
    $db_name = "";
}

$db2_name=$db_name;

$sql = "SELECT DBNENREI_1 FROM DBNENREI WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_nenrei);
$stmt->fetch();
$stmt->close();

if(!isset($db_nenrei)) {
    $db_nenrei = "";
}

$dbnenrei=$db_nenrei;

$sql = "SELECT B FROM my_t WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_sintyou);
$stmt->fetch();
$stmt->close();

if(!isset($db_sintyou)) {
    $db_sintyou = "";
}

$dbsintyou=$db_sintyou;

$sql = "SELECT DBSEIBETU_1 FROM DBSEIBETU WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_seibetu);
$stmt->fetch();
$stmt->close();

if(!isset($db_seibetu)) {
    $db_seibetu = "";
}

$dbseibetu=$db_seibetu;

$sql = "SELECT DBMOKUHYO_1 FROM DBMOKUHYO WHERE user_id = ?";
$stmt = $conn2->prepare($sql); // 新しいステートメントオブジェクトを作成
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($db_mokuhyo);
$stmt->fetch();
$stmt->close();

if(!isset($db_mokuhyo)) {
    $db_mokuhyo = "";
}

$dbmokuhyo=$db_mokuhyo;

if(!isset($name)) {
    $name = "";
}

if(!isset($nenrei)) {
    $nenrei = "";
}

if(!isset($sintyou)) {
    $sintyou = "";
}

if(!isset($seibetu)) {
    $seibetu = "";
}

if(!isset($mokuhyo)) {
    $mokuhyo = "";
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $nenrei = $_POST["nenrei"];
    $sintyou = $_POST["sintyou"];
    $seibetu = $_POST["seibetu"];
    $mokuhyo = $_POST["mokuhyo"];

    if($db_name=="") {
        $sql = "INSERT INTO DBNAME (user_id, DBNAME_1) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $name);
        $stmt->execute();
    }
    else if($db_name!==""){
        $sql = "UPDATE DBNAME SET DBNAME_1 = ? WHERE user_id = ?";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("si", $name, $user_id);
        $stmt->execute();
    }
    if($db_nenrei=="") {
        $sql = "INSERT INTO DBNENREI (user_id, DBNENREI_1) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $nenrei);
        $stmt->execute();
    }
    else if($db_nenrei!==""){
        $sql = "UPDATE DBNENREI SET DBNENREI_1 = ? WHERE user_id = ?";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("si", $nenrei, $user_id);
        $stmt->execute();
    }
    if($db_sintyou=="") {
        $sql = "INSERT INTO my_t (user_id, B) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $sintyou);
        $stmt->execute();
    }
    else if($db_sintyou!==""){
        $sql = "UPDATE my_t SET B = ? WHERE user_id = ?";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("si", $sintyou, $user_id);
        $stmt->execute();
    }
    if($db_seibetu=="") {
            $sql = "INSERT INTO DBSEIBETU (user_id, DBSEIBETU_1) VALUES (?, ?)";
            $stmt = $conn2->prepare($sql);
            $stmt->bind_param("is", $user_id, $seibetu);
            $stmt->execute();
        }
    else if($db_seibetu!==""){
            $sql = "UPDATE DBSEIBETU SET DBSEIBETU_1 = ? WHERE user_id = ?";
            $stmt = $conn2->prepare($sql);
            $stmt->bind_param("si", $seibetu, $user_id);
            $stmt->execute();
    }
    if($db_mokuhyo=="") {
        $sql = "INSERT INTO DBMOKUHYO (user_id, DBMOKUHYO_1) VALUES (?, ?)";
        $stmt = $conn2->prepare($sql);
        $stmt->bind_param("is", $user_id, $mokuhyo);
        $stmt->execute();
    }
    else if($dbmokuhyo!==""){
            $sql = "UPDATE DBMOKUHYO SET DBMOKUHYO_1 = ? WHERE user_id = ?";
            $stmt = $conn2->prepare($sql);
            $stmt->bind_param("si", $mokuhyo, $user_id);
            $stmt->execute();
    }
    header("Location: " . $_SERVER['PHP_SELF']);
}

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
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Walkary</title>
    <link rel="stylesheet" href="../index.css">
    <style>
        .hidden { display: none; }
    </style>
    <script>
        function toggleDisplay() {
            var infoDiv = document.getElementById('info');
            var formDiv = document.getElementById('form');
            if (infoDiv.classList.contains('hidden')) {
                infoDiv.classList.remove('hidden');
                formDiv.classList.add('hidden');
            } else {
                infoDiv.classList.add('hidden');
                formDiv.classList.remove('hidden');
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <header>
            <h1>マイページ</h1>
        </header>
        <main>
            <section>
                <h2>ユーザー情報</h2>
                <p>ユーザーID:<?php
                try {
                    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                    // SQLクエリを準備
                    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = :user_id");
                    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                    // クエリを実行
                    $stmt->execute();

                    // 結果を取得し、表示
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        echo $row['username'];
                    }
                } catch (PDOException $e) {
                    echo "データベース接続失敗: " . $e->getMessage();
                }

                // 接続を閉じる
                $pdo = null;
                ?></p>
            </section>
            
            <button onclick="toggleDisplay()">表示/入力</button>
            <div id="info">
            <p>名前：<?php echo htmlspecialchars($db2_name, ENT_QUOTES, 'UTF-8'); ?></p>
            <p>年齢(歳)：<?php echo htmlspecialchars($dbnenrei, ENT_QUOTES, 'UTF-8'); ?></p>
            <p>身長(cm)：<?php echo htmlspecialchars($dbsintyou, ENT_QUOTES, 'UTF-8'); ?></p>
            <p>体重(kg)：<?php echo htmlspecialchars($db_weight, ENT_QUOTES, 'UTF-8'); ?></p>
            <p>性別：<?php echo htmlspecialchars($dbseibetu, ENT_QUOTES, 'UTF-8'); ?></p>
            <p>目標(m)：<?php echo htmlspecialchars($dbmokuhyo, ENT_QUOTES, 'UTF-8'); ?></p>
            <p>距離総計(km)：</br><?php echo htmlspecialchars($db_total/1000, ENT_QUOTES, 'UTF-8'); ?></p>
            </div>
    
    <div id="form" class="hidden">
            <form method="post" action="">
                <label for="name">名前:</label>
                <input type="text" id="name" name="name" value=<?php echo $db2_name; ?> required>

                <label for="nenrei">年齢(歳):</label>
                <input type="number" id="nenrei" name="nenrei" value=<?php echo $dbnenrei; ?> required>

                <label for="sintyou">身長(cm):</label>
                <input type="number" id="sintyou" name="sintyou" value=<?php echo $dbsintyou; ?> required>

                <label for="seibetu">性別:</label>
                <input type="text" id="seibetu" name="seibetu" value=<?php echo $dbseibetu; ?> required>

                <label for="mokuhyo">目標(m):</label>
                <input type="number" id="mokuhyo" name="mokuhyo" value=<?php echo $dbmokuhyo; ?> required>

                <input type="submit" value="保存">
            </form>
    </div>
        </main>
        <nav>
            <ul>
                <li><a href="../home/home.php">ホーム</a></li>
                <li><a href="../map/map.php">マップ</a></li>
                <li><a href="../graph/graph.php">グラフ</a></li>
                <li><a href="mypage.php">マイページ</a></li>
            </ul>
        </nav>
    </div>
    <div style="text-align: center">
        <a href="https://px.a8.net/svt/ejp?a8mat=3ZBNS2+42GNLE+0K+10A5LT" rel="nofollow">
        <img border="0" width="234" height="60" alt="" src="https://www27.a8.net/svt/bgt?aid=240729122246&wid=001&eno=01&mid=s00000000002006094000&mc=1"></a>
        <img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=3ZBNS2+42GNLE+0K+10A5LT" alt="">
    </div>
</body>
</html>
