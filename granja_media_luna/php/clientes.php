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
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("sss", $nombre, $telefono, $correo);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cliente creado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear cliente: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;
        
    case 'PUT':
        // Solo administradores pueden actualizar clientes
        requireAdmin();
        
        // Actualizar cliente
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data['id'] ?? 0);
        $nombre = trim($data['nombre'] ?? '');
        $telefono = trim($data['telefono'] ?? '');
        $correo = trim($data['correo'] ?? '');
        
        // Validar ID
        if (empty($id) || $id <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de cliente inválido']);
            exit;
        }
        
        // Validar campos
        if (empty($nombre) || strlen($nombre) < 3) {
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
        
        $query = "UPDATE clientes SET nombre = ?, telefono = ?, correo = ? WHERE id = ?";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("sssi", $nombre, $telefono, $correo, $id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'message' => 'Cliente actualizado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el cliente a actualizar']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar cliente: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;
        
    case 'DELETE':
        // Solo administradores pueden eliminar clientes
        requireAdmin();
        
        // Eliminar cliente
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data['id'] ?? 0);
        
        // Validar que el ID sea válido
        if (empty($id) || $id <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de cliente inválido']);
            exit;
        }
        
        // Verificar si el cliente tiene ventas asociadas
        $query = "SELECT COUNT(*) as total FROM ventas WHERE id_cliente = ?";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $total_ventas = intval($row['total']);
        $stmt->close();
        
        // Si hay ventas asociadas, no se puede eliminar
        if ($total_ventas > 0) {
            echo json_encode([
                'success' => false, 
                'message' => "No se puede eliminar este cliente porque tiene {$total_ventas} venta(s) asociada(s). Para eliminar el cliente, primero debe eliminar las ventas relacionadas."
            ]);
            exit;
        }
        
        // Si no hay ventas asociadas, proceder con la eliminación
        $query = "DELETE FROM clientes WHERE id = ?";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            // Verificar si se eliminó algún registro
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'message' => 'Cliente eliminado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el cliente a eliminar']);
            }
        } else {
            // Capturar errores de foreign key y mostrar mensaje amigable
            $error = $stmt->error;
            if (strpos($error, 'foreign key constraint') !== false) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'No se puede eliminar este cliente porque tiene ventas asociadas. Para eliminar el cliente, primero debe eliminar las ventas relacionadas.'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al eliminar cliente: ' . $error]);
            }
        }
        
        $stmt->close();
        break;
        
    default:
        echo json_encode(['error' => 'Método no permitido']);
}

$conexion->close();
?>

