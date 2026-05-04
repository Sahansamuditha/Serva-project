<?php
// Handle login form POST
session_start();
// Redirect to login page if not POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.php');
    exit;
}

// Load database config
$config = require __DIR__ . '/config.php';

// Get form values
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Validate form fields
$errors = [];
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required.';
if (strlen($password) < 6) $errors[] = 'Password must be at least 6 characters.';

// If there are errors, redirect with error code
if (!empty($errors)) {
    // pass a generic error message to login.php
    header('Location: login.php?error=1');
    exit;
}

// Connect to database
$mysqli = new mysqli($config['db_host'], $config['db_user'], $config['db_pass'], $config['db_name']);
if ($mysqli->connect_errno) {
    // redirect with error
    header('Location: login.php?error=2');
    exit;
}

// Look up user by email
$stmt = $mysqli->prepare('SELECT id, name, email, password_hash, user_type FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
if (!$user) {
    // user not found
    header('Location: login.php?error=3');
    exit;
}

// Check password
if (!password_verify($password, $user['password_hash'])) {
    header('Location: login.php?error=4');
    exit;
}

// Successful login: set session and redirect
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_type'] = $user['user_type'];

header('Location: profile.php');
exit;
