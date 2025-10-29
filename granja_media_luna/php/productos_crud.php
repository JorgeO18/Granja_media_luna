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
        requireLogin();
        
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
        $stmt->bind_param("ssdi", $nombre, $descripcion, $precio, $stock);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Producto creado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear producto']);
        }
        break;
        
    case 'PUT':
        // Solo administradores pueden actualizar productos
        requireLogin();
        
        // Actualizar producto
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'] ?? '';
        $nombre = $data['nombre'] ?? '';
        $descripcion = $data['descripcion'] ?? '';
        $precio = $data['precio'] ?? 0;
        $stock = $data['stock'] ?? 0;
        
        $query = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("ssdii", $nombre, $descripcion, $precio, $stock, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar producto']);
        }
        break;
        
    case 'DELETE':
        // Solo administradores pueden eliminar productos
        requireLogin();
        
        // Eliminar producto
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'] ?? '';
        
        $query = "DELETE FROM productos WHERE id = ?";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar producto']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Método no permitido']);
}

$conexion->close();
?>

