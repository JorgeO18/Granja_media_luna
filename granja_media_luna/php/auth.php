<?php
session_start();
header("Content-Type: application/json");
include("conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = $_POST['correo'] ?? '';
    $contrasena = $_POST['contrasena'] ?? '';
    
    if (empty($correo) || empty($contrasena)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }
    
    $query = "SELECT * FROM usuarios WHERE correo = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
        
        // Verificar contraseña (en producción usar password_verify)
        // Aceptar contraseñas simples para desarrollo: password o 12345
        if ($contrasena === 'password' || $contrasena === '12345' || password_verify($contrasena, $usuario['contrasena'])) {
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_name'] = $usuario['nombre'];
            $_SESSION['user_email'] = $usuario['correo'];
            $_SESSION['user_role'] = $usuario['rol'];
            $_SESSION['logged_in'] = true;
            
            echo json_encode([
                'success' => true, 
                'message' => 'Login exitoso',
                'user' => [
                    'name' => $usuario['nombre'],
                    'role' => $usuario['rol']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>

