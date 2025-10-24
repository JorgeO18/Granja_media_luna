<?php
$host = "localhost";
$usuario = "root";
$clave = "";
$base_datos = "granja_media_luna";

// Creación de la conexión
$conexion = new mysqli($host, $usuario, $clave, $base_datos);

// Verificación de errores
if ($conexion->connect_error) {
    die("❌ Error de conexión: " . $conexion->connect_error);
}

// echo "✅ Conexión exitosa"; // Puedes usar esto para probar si conecta bien
?>
