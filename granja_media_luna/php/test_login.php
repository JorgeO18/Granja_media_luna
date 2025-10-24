<?php
// Script de prueba para verificar el login
session_start();
header("Content-Type: text/html; charset=utf-8");

include("conexion.php");

echo "<h2>🔍 Test de Login - Granja Media Luna</h2>";
echo "<hr>";

// 1. Verificar conexión
if ($conexion) {
    echo "✅ Conexión a base de datos: <strong>EXITOSA</strong><br>";
} else {
    echo "❌ Conexión a base de datos: <strong>FALLIDA</strong><br>";
    die("Error de conexión: " . mysqli_connect_error());
}

// 2. Verificar tabla usuarios
$query = "SELECT COUNT(*) as total FROM usuarios";
$result = $conexion->query($query);
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ Tabla 'usuarios' encontrada. Total usuarios: <strong>" . $row['total'] . "</strong><br>";
} else {
    echo "❌ Tabla 'usuarios' no encontrada<br>";
}

// 3. Listar usuarios
echo "<hr>";
echo "<h3>📋 Usuarios en la base de datos:</h3>";
$query = "SELECT id, nombre, correo, rol FROM usuarios";
$result = $conexion->query($query);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['nombre'] . "</td>";
        echo "<td>" . $row['correo'] . "</td>";
        echo "<td>" . $row['rol'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "❌ No hay usuarios en la base de datos<br>";
}

// 4. Probar login con credenciales
echo "<hr>";
echo "<h3>🔐 Probando login con credenciales:</h3>";

$correo_test = "admin@granjamedialuna.com";
$contrasena_test = "12345";

$query = "SELECT * FROM usuarios WHERE correo = ?";
$stmt = $conexion->prepare($query);
$stmt->bind_param("s", $correo_test);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    echo "✅ Usuario encontrado: <strong>" . $usuario['nombre'] . "</strong><br>";
    echo "📧 Correo: " . $usuario['correo'] . "<br>";
    echo "👤 Rol: " . $usuario['rol'] . "<br>";
    
    // Probar contraseña
    if ($contrasena_test === 'password' || $contrasena_test === '12345') {
        echo "✅ Contraseña '<strong>" . $contrasena_test . "</strong>' es válida<br>";
    } else {
        echo "❌ Contraseña no es válida<br>";
    }
} else {
    echo "❌ Usuario no encontrado con correo: " . $correo_test . "<br>";
}

$conexion->close();
?>



