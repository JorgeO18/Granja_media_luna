<?php
session_start();
header("Content-Type: application/json");

include("conexion.php");
include("require_login.php");

try {
    requireLogin();
    
    $userEmail = $_SESSION['user_email'] ?? '';
    $userName = $_SESSION['user_name'] ?? 'Usuario';
    
    if (empty($userEmail)) {
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró el correo del usuario en la sesión'
        ]);
        exit;
    }
    
    // Buscar cliente existente por correo
    $query = "SELECT id, nombre FROM clientes WHERE correo = ?";
    $stmt = $conexion->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $cliente = $result->fetch_assoc();
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'cliente_id' => intval($cliente['id']),
            'cliente_nombre' => $cliente['nombre'],
            'message' => 'Cliente existente encontrado'
        ]);
        $conexion->close();
        exit;
    }
    $stmt->close();
    
    // Crear cliente nuevo con datos básicos
    $nombreCliente = !empty($userName) ? $userName : 'Usuario sin nombre';
    
    $insert = "INSERT INTO clientes (nombre, telefono, correo) VALUES (?, '', ?)";
    $stmtInsert = $conexion->prepare($insert);
    
    if (!$stmtInsert) {
        throw new Exception('Error al preparar inserción: ' . $conexion->error);
    }
    
    $stmtInsert->bind_param("ss", $nombreCliente, $userEmail);
    
    if (!$stmtInsert->execute()) {
        $error = $stmtInsert->error;
        $stmtInsert->close();
        throw new Exception('Error al crear cliente: ' . $error);
    }
    
    $nuevoId = $stmtInsert->insert_id;
    $stmtInsert->close();
    
    echo json_encode([
        'success' => true,
        'cliente_id' => intval($nuevoId),
        'cliente_nombre' => $nombreCliente,
        'message' => 'Cliente creado automáticamente'
    ]);
    
    $conexion->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

?>

