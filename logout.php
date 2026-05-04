<?php
// Start session and clear all session data
session_start();
$_SESSION = [];
// Remove session cookie if set
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}
// Destroy session
session_destroy();
// Redirect to home page after logout
header('Location: home.php');
exit;
