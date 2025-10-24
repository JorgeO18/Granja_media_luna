<?php
/**
 * Script de protección para endpoints PHP
 * Verifica que el usuario esté logueado antes de permitir operaciones
 */

session_start();

/**
 * Verifica si el usuario está logueado
 * @return bool True si está logueado, False si no
 */
function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Requiere que el usuario esté logueado
 * Si no lo está, devuelve error y termina la ejecución
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header("Content-Type: application/json");
        echo json_encode([
            'success' => false,
            'message' => 'Debe iniciar sesión para realizar esta acción',
            'require_login' => true
        ]);
        exit;
    }
}

/**
 * Verifica si el usuario es administrador
 * @return bool True si es admin, False si no
 */
function isAdmin() {
    return isLoggedIn() && 
           isset($_SESSION['user_role']) && 
           $_SESSION['user_role'] === 'admin';
}

/**
 * Requiere que el usuario sea administrador
 * Si no lo es, devuelve error y termina la ejecución
 */
function requireAdmin() {
    requireLogin(); // Primero verificar que esté logueado
    
    if (!isAdmin()) {
        header("Content-Type: application/json");
        echo json_encode([
            'success' => false,
            'message' => 'No tiene permisos para realizar esta acción',
            'require_admin' => true
        ]);
        exit;
    }
}
?>



