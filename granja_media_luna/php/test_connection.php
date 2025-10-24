<?php
// Archivo para probar la conexión a la base de datos
include("conexion.php");

// Verificar si la conexión existe
if ($conexion) {
    echo "✅ Conexión exitosa a la base de datos 'granja_media_luna'<br>";
    
    // Probar una consulta simple
    $query = "SELECT COUNT(*) as total FROM productos";
    $result = $conexion->query($query);
    
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✅ Consulta exitosa. Total de productos: " . $row['total'] . "<br>";
    } else {
        echo "❌ Error en la consulta: " . $conexion->error . "<br>";
    }
    
    // Cerrar conexión
    $conexion->close();
} else {
    echo "❌ Error: No se pudo conectar a la base de datos<br>";
    echo "Verifica que:<br>";
    echo "1. XAMPP esté ejecutándose<br>";
    echo "2. MySQL esté activo<br>";
    echo "3. La base de datos 'granja_media_luna' exista<br>";
    echo "4. Las credenciales en conexion.php sean correctas<br>";
}
?>

