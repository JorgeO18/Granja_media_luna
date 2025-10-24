<?php
session_start();
header("Content-Type: application/json");

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'logged_in' => true,
        'user_name' => $_SESSION['user_name'] ?? 'Usuario',
        'user_email' => $_SESSION['user_email'] ?? '',
        'user_role' => $_SESSION['user_role'] ?? 'empleado',
        'user' => [
            'name' => $_SESSION['user_name'] ?? 'Usuario',
            'email' => $_SESSION['user_email'] ?? '',
            'role' => $_SESSION['user_role'] ?? 'empleado'
        ]
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>

