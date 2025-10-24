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
                $subtotal = $producto['precio'] * $producto['cantidad'];
                
                // Insertar detalle
                $query = "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)";
                $stmt = $conexion->prepare($query);
                $stmt->bind_param("iiid", $venta_id, $producto['id'], $producto['cantidad'], $subtotal);
                $stmt->execute();
                
                // Actualizar stock
                $query = "UPDATE productos SET stock = stock - ? WHERE id = ?";
                $stmt = $conexion->prepare($query);
                $stmt->bind_param("ii", $producto['cantidad'], $producto['id']);
                $stmt->execute();
            }
            
            $conexion->commit();
            echo json_encode(['success' => true, 'message' => 'Venta registrada exitosamente', 'venta_id' => $venta_id]);
            
        } catch (Exception $e) {
            $conexion->rollback();
            echo json_encode(['success' => false, 'message' => 'Error al registrar venta: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Método no permitido']);
}

$conexion->close();
?>

