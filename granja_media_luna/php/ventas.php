<?php
header("Content-Type: application/json");
include("conexion.php");
include("require_login.php");

if (!$conexion) {
    echo json_encode(["error" => "Error en la conexión a la base de datos."]);
    exit;
}

// Todas las operaciones de ventas requieren login
requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener todas las ventas con detalles
        $query = "SELECT v.*, c.nombre as cliente_nombre, 
                         GROUP_CONCAT(CONCAT(p.nombre, ' (', dv.cantidad, ')') SEPARATOR ', ') as productos
                  FROM ventas v 
                  LEFT JOIN clientes c ON v.id_cliente = c.id 
                  LEFT JOIN detalle_venta dv ON v.id = dv.id_venta
                  LEFT JOIN productos p ON dv.id_producto = p.id
                  GROUP BY v.id 
                  ORDER BY v.fecha DESC";
        
        $result = $conexion->query($query);
        $ventas = [];
        
        if ($result && $result->num_rows > 0) {
            while ($fila = $result->fetch_assoc()) {
                $ventas[] = $fila;
            }
        }
        
        echo json_encode($ventas);
        break;
        
    case 'POST':
        // Crear nueva venta
        $id_cliente = $_POST['cliente'] ?? '';
        $productos = json_decode($_POST['productos'] ?? '[]', true);
        
        if (empty($id_cliente) || empty($productos)) {
            echo json_encode(['success' => false, 'message' => 'Cliente y productos son obligatorios']);
            exit;
        }
        
        // Calcular total
        $total = 0;
        foreach ($productos as $producto) {
            $total += $producto['precio'] * $producto['cantidad'];
        }
        
        // Iniciar transacción
        $conexion->begin_transaction();
        
        try {
            // Insertar venta
            $query = "INSERT INTO ventas (id_cliente, total) VALUES (?, ?)";
            $stmt = $conexion->prepare($query);
            $stmt->bind_param("id", $id_cliente, $total);
            $stmt->execute();
            $venta_id = $conexion->insert_id;
            
            // Insertar detalles de venta y actualizar stock
            foreach ($productos as $producto) {
                $producto_id = intval($producto['id']);
                $cantidad = intval($producto['cantidad']);
                $precio = floatval($producto['precio']);
                
                // Verificar que el producto existe y tiene stock suficiente
                $query = "SELECT stock FROM productos WHERE id = ?";
                $stmt = $conexion->prepare($query);
                if (!$stmt) {
                    throw new Exception('Error al preparar consulta de stock: ' . $conexion->error);
                }
                $stmt->bind_param("i", $producto_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows === 0) {
                    $stmt->close();
                    throw new Exception("Producto con ID {$producto_id} no encontrado");
                }
                
                $producto_data = $result->fetch_assoc();
                $stock_actual = intval($producto_data['stock']);
                
                if ($stock_actual < $cantidad) {
                    $stmt->close();
                    throw new Exception("Stock insuficiente para el producto ID {$producto_id}. Stock disponible: {$stock_actual}, solicitado: {$cantidad}");
                }
                
                $stmt->close();
                
                $subtotal = $precio * $cantidad;
                
                // Insertar detalle
                $query = "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)";
                $stmt = $conexion->prepare($query);
                if (!$stmt) {
                    throw new Exception('Error al preparar consulta de detalle: ' . $conexion->error);
                }
                $stmt->bind_param("iiid", $venta_id, $producto_id, $cantidad, $subtotal);
                if (!$stmt->execute()) {
                    $error = $stmt->error;
                    $stmt->close();
                    throw new Exception('Error al insertar detalle: ' . $error);
                }
                $stmt->close();
                
                // Actualizar stock
                $query = "UPDATE productos SET stock = stock - ? WHERE id = ?";
                $stmt = $conexion->prepare($query);
                if (!$stmt) {
                    throw new Exception('Error al preparar consulta de actualización: ' . $conexion->error);
                }
                $stmt->bind_param("ii", $cantidad, $producto_id);
                if (!$stmt->execute()) {
                    $error = $stmt->error;
                    $stmt->close();
                    throw new Exception('Error al actualizar stock: ' . $error);
                }
                $stmt->close();
            }
            
            $conexion->commit();
            echo json_encode(['success' => true, 'message' => 'Venta registrada exitosamente', 'venta_id' => $venta_id]);
            
        } catch (Exception $e) {
            $conexion->rollback();
            echo json_encode(['success' => false, 'message' => 'Error al registrar venta: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Solo administradores pueden eliminar ventas
        requireAdmin();
        
        // Eliminar venta
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data['id'] ?? 0);
        
        // Validar que el ID sea válido
        if (empty($id) || $id <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de venta inválido']);
            exit;
        }
        
        // Iniciar transacción para asegurar integridad
        $conexion->begin_transaction();
        
        try {
            // Primero, obtener los detalles de la venta para restaurar stock
            $query = "SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = ?";
            $stmt = $conexion->prepare($query);
            
            if (!$stmt) {
                throw new Exception('Error al preparar consulta de detalles: ' . $conexion->error);
            }
            
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $detalles = [];
            
            while ($row = $result->fetch_assoc()) {
                $detalles[] = $row;
            }
            $stmt->close();
            
            // Restaurar stock de cada producto
            foreach ($detalles as $detalle) {
                $producto_id = intval($detalle['id_producto']);
                $cantidad = intval($detalle['cantidad']);
                
                $query = "UPDATE productos SET stock = stock + ? WHERE id = ?";
                $stmt = $conexion->prepare($query);
                
                if (!$stmt) {
                    throw new Exception('Error al preparar consulta de restauración de stock: ' . $conexion->error);
                }
                
                $stmt->bind_param("ii", $cantidad, $producto_id);
                if (!$stmt->execute()) {
                    $error = $stmt->error;
                    $stmt->close();
                    throw new Exception('Error al restaurar stock: ' . $error);
                }
                $stmt->close();
            }
            
            // Eliminar detalles de venta
            $query = "DELETE FROM detalle_venta WHERE id_venta = ?";
            $stmt = $conexion->prepare($query);
            
            if (!$stmt) {
                throw new Exception('Error al preparar consulta de eliminación de detalles: ' . $conexion->error);
            }
            
            $stmt->bind_param("i", $id);
            if (!$stmt->execute()) {
                $error = $stmt->error;
                $stmt->close();
                throw new Exception('Error al eliminar detalles de venta: ' . $error);
            }
            $stmt->close();
            
            // Eliminar la venta
            $query = "DELETE FROM ventas WHERE id = ?";
            $stmt = $conexion->prepare($query);
            
            if (!$stmt) {
                throw new Exception('Error al preparar consulta de eliminación: ' . $conexion->error);
            }
            
            $stmt->bind_param("i", $id);
            if (!$stmt->execute()) {
                $error = $stmt->error;
                $stmt->close();
                throw new Exception('Error al eliminar venta: ' . $error);
            }
            
            if ($stmt->affected_rows > 0) {
                $stmt->close();
                $conexion->commit();
                echo json_encode(['success' => true, 'message' => 'Venta eliminada exitosamente. El stock de los productos ha sido restaurado.']);
            } else {
                $stmt->close();
                $conexion->rollback();
                echo json_encode(['success' => false, 'message' => 'No se encontró la venta a eliminar']);
            }
            
        } catch (Exception $e) {
            $conexion->rollback();
            echo json_encode(['success' => false, 'message' => 'Error al eliminar venta: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Método no permitido']);
}

$conexion->close();
?>

