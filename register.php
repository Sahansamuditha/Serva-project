<?php
// register.php - handle registration form POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: registration.php');
    exit;
}

$config = require __DIR__ . '/config.php';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
<?php

        if (!$tmp->query($createTableSql)) {
            echo "Database created but failed to create users table. Please create the table manually using the SQL in create_users_table.sql. MySQL error: " . htmlspecialchars($tmp->error);
            $tmp->close();
            exit;
        }

        $tmp->close();

        // Now reconnect using database name
        @$mysqli = new mysqli($config['db_host'], $config['db_user'], $config['db_pass'], $config['db_name']);
        if ($mysqli->connect_errno) {
            echo "Failed to connect to the newly created database: " . htmlspecialchars($mysqli->connect_error);
            exit;
        }
    } else {
        echo "DB connection failed: " . htmlspecialchars($mysqli->connect_error);
        exit;
    }
}

// check for existing email
$stmt = $mysqli->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo "<p>Email already registered. <a href=\"login.php\">Login</a></p>";
    exit;
}
$stmt->close();

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $mysqli->prepare('INSERT INTO users (name, email, password_hash, user_type, created_at) VALUES (?, ?, ?, ?, NOW())');
$stmt->bind_param('ssss', $name, $email, $passwordHash, $userType);
$ok = $stmt->execute();
if ($ok) {
    // redirect to login with success message
    header('Location: login.php?registered=1');
    exit;
} else {
    echo "Insert failed: " . htmlspecialchars($stmt->error);
}

$stmt->close();
$mysqli->close();

?>
