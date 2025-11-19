<?php
session_start(); // Iniciar sesión antes de cualquier header
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
        // Obtener todos los productos
        $query = "SELECT * FROM productos ORDER BY nombre ASC";
        $result = $conexion->query($query);
        
        $productos = [];
        if ($result && $result->num_rows > 0) {
            while ($fila = $result->fetch_assoc()) {
                $productos[] = $fila;
            }
        }
        
        echo json_encode($productos);
        break;
        
    case 'POST':
        // Solo administradores pueden crear productos
        requireAdmin();
        
        // Crear nuevo producto
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $precio = floatval($_POST['precio'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        
        // Validaciones
        if (empty($nombre)) {
            echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
            exit;
        }
        
        if (strlen($nombre) < 3) {
            echo json_encode(['success' => false, 'message' => 'El nombre debe tener al menos 3 caracteres']);
            exit;
        }
        
        if (empty($descripcion)) {
            echo json_encode(['success' => false, 'message' => 'La descripción es obligatoria']);
            exit;
        }
        
        if ($precio <= 0) {
            echo json_encode(['success' => false, 'message' => 'El precio debe ser mayor a 0']);
            exit;
        }
        
        if ($stock < 0) {
            echo json_encode(['success' => false, 'message' => 'El stock no puede ser negativo']);
            exit;
        }
        
        $query = "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("ssdi", $nombre, $descripcion, $precio, $stock);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Producto creado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear producto: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;
        
    case 'PUT':
        // Solo administradores pueden actualizar productos
        requireAdmin();
        
        // Actualizar producto
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data['id'] ?? 0);
        $nombre = trim($data['nombre'] ?? '');
        $descripcion = trim($data['descripcion'] ?? '');
        $precio = floatval($data['precio'] ?? 0);
        $stock = intval($data['stock'] ?? 0);
        
        // Validar ID
        if (empty($id) || $id <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de producto inválido']);
            exit;
        }
        
        // Validaciones
        if (empty($nombre)) {
            echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
            exit;
        }
        
        if (strlen($nombre) < 3) {
            echo json_encode(['success' => false, 'message' => 'El nombre debe tener al menos 3 caracteres']);
            exit;
        }
        
        if (empty($descripcion)) {
            echo json_encode(['success' => false, 'message' => 'La descripción es obligatoria']);
            exit;
        }
        
        if ($precio <= 0) {
            echo json_encode(['success' => false, 'message' => 'El precio debe ser mayor a 0']);
            exit;
        }
        
        if ($stock < 0) {
            echo json_encode(['success' => false, 'message' => 'El stock no puede ser negativo']);
            exit;
        }
        
        $query = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("ssdii", $nombre, $descripcion, $precio, $stock, $id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el producto a actualizar']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar producto: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;
        
    case 'DELETE':
        // Solo administradores pueden eliminar productos
        requireAdmin();
        
        // Eliminar producto
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data['id'] ?? 0);
        
        // Validar que el ID sea válido
        if (empty($id) || $id <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de producto inválido']);
            exit;
        }
        
        // Verificar si el producto tiene ventas asociadas
        $query = "SELECT COUNT(*) as total FROM detalle_venta WHERE id_producto = ?";
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
                'message' => "No se puede eliminar este producto porque tiene {$total_ventas} venta(s) asociada(s). Para eliminar el producto, primero debe eliminar las ventas relacionadas."
            ]);
            exit;
        }
        
        // Si no hay ventas asociadas, proceder con la eliminación
        $query = "DELETE FROM productos WHERE id = ?";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
            exit;
        }
        
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            // Verificar si se eliminó algún registro
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el producto a eliminar']);
            }
        } else {
            // Capturar errores de foreign key y mostrar mensaje amigable
            $error = $stmt->error;
            if (strpos($error, 'foreign key constraint') !== false) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'No se puede eliminar este producto porque tiene ventas asociadas. Para eliminar el producto, primero debe eliminar las ventas relacionadas.'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al eliminar producto: ' . $error]);
            }
        }
        
        $stmt->close();
        break;
        
    default:
        echo json_encode(['error' => 'Método no permitido']);
}

$conexion->close();
?>

