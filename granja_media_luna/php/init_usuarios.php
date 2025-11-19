<?php
/**
 * Script para inicializar usuarios en la base de datos
 * Inserta usuarios por defecto si no existen
 */

header("Content-Type: text/html; charset=utf-8");
include("conexion.php");

echo "<h2>🚀 Inicialización de Usuarios - Granja Media Luna</h2>";
echo "<hr>";

// Verificar si ya existen usuarios
$query = "SELECT COUNT(*) as total FROM usuarios";
$result = $conexion->query($query);
$row = $result->fetch_assoc();

if ($row['total'] > 0) {
    echo "<p style='color: orange;'>⚠️ Ya existen " . $row['total'] . " usuario(s) en la base de datos.</p>";
    echo "<p>¿Deseas ver los usuarios existentes?</p>";
    
    // Mostrar usuarios existentes
    $query = "SELECT id, nombre, correo, rol FROM usuarios";
    $result = $conexion->query($query);
    
    if ($result && $result->num_rows > 0) {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse; margin-top: 20px;'>";
        echo "<tr style='background-color: #5c8a4b; color: white;'><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['nombre'] . "</td>";
            echo "<td>" . $row['correo'] . "</td>";
            echo "<td>" . $row['rol'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    echo "<hr>";
    echo "<p><strong>Credenciales de prueba:</strong></p>";
    echo "<ul>";
    echo "<li>Admin: admin@granjamedialuna.com / password (o 12345)</li>";
    echo "<li>Usuario: empleado@granjamedialuna.com / password (o 12345)</li>";
    echo "</ul>";
    echo "<br>";
    echo "<p><a href='../login.html' style='background-color: #5c8a4b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🔐 Ir al Login</a></p>";
} else {
    echo "<p style='color: blue;'>📝 No hay usuarios en la base de datos. Insertando usuarios por defecto...</p>";
    
    // Contraseñas hasheadas para "password"
    // También aceptará "12345" en el código de auth.php
    $passwordHash = password_hash("password", PASSWORD_DEFAULT);
    
    // Insertar admin
    $query = "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    
    $nombre = "Administrador";
    $correo = "admin@granjamedialuna.com";
    $rol = "admin";
    $stmt->bind_param("ssss", $nombre, $correo, $passwordHash, $rol);
    
    if ($stmt->execute()) {
        echo "<p style='color: green;'>✅ Usuario administrador creado exitosamente</p>";
    } else {
        echo "<p style='color: red;'>❌ Error al crear administrador: " . $stmt->error . "</p>";
    }
    
    // Insertar usuario
    $nombre = "Usuario";
    $correo = "empleado@granjamedialuna.com";
    $rol = "usuario";
    $stmt->bind_param("ssss", $nombre, $correo, $passwordHash, $rol);
    
    if ($stmt->execute()) {
        echo "<p style='color: green;'>✅ Usuario creado exitosamente</p>";
    } else {
        echo "<p style='color: red;'>❌ Error al crear usuario: " . $stmt->error . "</p>";
    }
    
    echo "<hr>";
    echo "<h3>✅ Inicialización completa</h3>";
    echo "<p><strong>Credenciales creadas:</strong></p>";
    echo "<ul>";
    echo "<li>Admin: admin@granjamedialuna.com / password (o 12345)</li>";
    echo "<li>Usuario: empleado@granjamedialuna.com / password (o 12345)</li>";
    echo "</ul>";
    echo "<br>";
    echo "<p><a href='../login.html' style='background-color: #5c8a4b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🔐 Ir al Login</a></p>";
}

$conexion->close();
?>


