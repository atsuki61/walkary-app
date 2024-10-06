CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date DATE,
    distance FLOAT,
    calories FLOAT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE variables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    var_a FLOAT,
    var_b FLOAT,
    var_c FLOAT,
    var_d FLOAT,
    var_e FLOAT,
    var_f FLOAT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    steps INT NOT NULL,
    weight DECIMAL(5, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE my_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    A VARCHAR(255) NOT NULL DEFAULT '0'
);

CREATE TABLE my_t (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    B VARCHAR(255) NOT NULL DEFAULT '0'
);

CREATE TABLE my (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    C DECIMAL(10, 2) NOT NULL DEFAULT '0.00'
);


CREATE TABLE U (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        last_access_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DBNAME (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    DBNAME_1 VARCHAR(255) NOT NULL DEFAULT '0'
);

CREATE TABLE DBNENREI (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    DBNENREI_1 VARCHAR(255) NOT NULL DEFAULT '0'
);

CREATE TABLE DBSEIBETU (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    DBSEIBETU_1 VARCHAR(255) NOT NULL DEFAULT '0'
);

-- ユーザーごとの歩数データを保存するテーブル
CREATE TABLE steps (
id INT AUTO_INCREMENT PRIMARY KEY,
-- 自動で増えるID
user_id INT,
-- ユーザーID（外部キーとして使用）
steps INT NOT NULL DEFAULT '0',
-- 計測した歩数
recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
-- 記録した時間
);
