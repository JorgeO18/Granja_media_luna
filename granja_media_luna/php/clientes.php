<?php
header("Content-Type: application/json");
include("conexion.php");
include("require_login.php");

if (!$conexion) {
    echo json_encode(["error" => "Error en la conexión a la base de datos."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener todos los clientes
        $query = "SELECT * FROM clientes ORDER BY nombre ASC";
        $result = $conexion->query($query);
        
        $clientes = [];
        if ($result && $result->num_rows > 0) {
            while ($fila = $result->fetch_assoc()) {
                $clientes[] = $fila;
            }
        }
        
        echo json_encode($clientes);
        break;
        
    case 'POST':
        // Solo administradores pueden crear clientes
        requireAdmin();
        
        // Crear nuevo cliente
        $nombre = trim($_POST['nombre'] ?? '');
        $telefono = trim($_POST['telefono'] ?? '');
        $correo = trim($_POST['correo'] ?? '');
        
        // Validaciones
        if (empty($nombre)) {
            echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
            exit;
        }
        
        if (strlen($nombre) < 3) {
            echo json_encode(['success' => false, 'message' => 'El nombre debe tener al menos 3 caracteres']);
            exit;
        }
        
        if (empty($telefono)) {
            echo json_encode(['success' => false, 'message' => 'El teléfono es obligatorio']);
            exit;
        }
        
        // Validar formato de correo si se proporciona
        if (!empty($correo) && !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'El correo electrónico no es válido']);
            exit;
        }
        
        $query = "INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("sss", $nombre, $telefono, $correo);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cliente creado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear cliente']);
        }
        break;
        
    case 'PUT':
        // Solo administradores pueden actualizar clientes
        requireAdmin();
        
        // Actualizar cliente
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'] ?? '';
        $nombre = $data['nombre'] ?? '';
        $telefono = $data['telefono'] ?? '';
        $correo = $data['correo'] ?? '';
        
        $query = "UPDATE clientes SET nombre = ?, telefono = ?, correo = ? WHERE id = ?";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("sssi", $nombre, $telefono, $correo, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cliente actualizado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar cliente']);
        }
        break;
        
    case 'DELETE':
        // Solo administradores pueden eliminar clientes
        requireAdmin();
        
        // Eliminar cliente
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'] ?? '';
        
        $query = "DELETE FROM clientes WHERE id = ?";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cliente eliminado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar cliente']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Método no permitido']);
}

$conexion->close();
?>

