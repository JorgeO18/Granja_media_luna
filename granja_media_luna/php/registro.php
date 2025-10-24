<?php
/**
 * Endpoint para registro de nuevos usuarios
 */
session_start();
header("Content-Type: application/json");
include("conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'] ?? '';
    $correo = $_POST['correo'] ?? '';
    $contrasena = $_POST['contrasena'] ?? '';
    $confirmar_contrasena = $_POST['confirmar_contrasena'] ?? '';
    $rol = $_POST['rol'] ?? 'empleado'; // Por defecto empleado
    
    // Validaciones
    if (empty($nombre) || empty($correo) || empty($contrasena)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }
    
    if ($contrasena !== $confirmar_contrasena) {
        echo json_encode(['success' => false, 'message' => 'Las contraseñas no coinciden']);
        exit;
    }
    
    if (strlen($contrasena) < 4) {
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 4 caracteres']);
        exit;
    }
    
    // Validar email
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'El correo electrónico no es válido']);
        exit;
    }
    
    // Verificar si el correo ya existe
    $query = "SELECT id FROM usuarios WHERE correo = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Este correo ya está registrado']);
        exit;
    }
    
    // Hashear contraseña
    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
    
    // Insertar usuario
    $query = "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("ssss", $nombre, $correo, $contrasenaHash, $rol);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Usuario registrado exitosamente. Ya puedes iniciar sesión.'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar usuario: ' . $stmt->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>


