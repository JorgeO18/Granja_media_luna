<?php
header("Content-Type: application/json");
include("conexion.php");

// Verificamos si la conexión existe
if (!$conexion) {
    echo json_encode(["error" => "Error en la conexión a la base de datos."]);
    exit;
}

$query = "SELECT * FROM productos";
$result = $conexion->query($query);

$productos = [];

if ($result && $result->num_rows > 0) {
    while ($fila = $result->fetch_assoc()) {
        $productos[] = $fila;
    }
} else {
    echo json_encode([]); // No hay productos
    exit;
}

echo json_encode($productos);
$conexion->close();
?>
