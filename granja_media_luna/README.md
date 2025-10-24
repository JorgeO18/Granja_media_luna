# 🥚 Granja Media Luna - Sistema de Gestión

Sistema web completo para la comercialización y gestión administrativa de la Granja Media Luna, especializada en la producción y venta de huevos frescos.

---

## 📋 Descripción del Proyecto

Este sistema web permite gestionar de forma integral todas las operaciones de la granja, incluyendo:
- Gestión de inventario de productos
- Administración de clientes
- Registro y control de ventas
- Sistema de facturación con impresión
- Formulario de contacto con integración WhatsApp
- Sistema de autenticación de usuarios

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive con tema agrícola
- **JavaScript (ES6+)**: Interactividad y comunicación con el backend
- **Font Awesome**: Iconografía

### Backend
- **PHP 8.0+**: Lógica del servidor y API REST
- **MySQL**: Base de datos relacional

### Herramientas
- **XAMPP**: Servidor local de desarrollo
- **Git**: Control de versiones

---

## 📁 Estructura del Proyecto

```
granja_media_luna/
│
├── css/
│   ├── styles.css          # Estilos globales
│   └── productos.css       # Estilos específicos de productos
│
├── js/
│   ├── main.js             # Funciones globales y de utilidad
│   ├── productos.js        # Gestión de productos (CRUD)
│   ├── clientes.js         # Gestión de clientes (CRUD)
│   ├── ventas.js           # Sistema de ventas y facturación
│   ├── contacto.js         # Formulario de contacto
│   └── login.js            # Autenticación de usuarios
│
├── php/
│   ├── conexion.php        # Conexión a base de datos
│   ├── auth.php            # Autenticación
│   ├── check_session.php   # Verificación de sesión
│   ├── logout.php          # Cerrar sesión
│   ├── productos_crud.php  # API REST de productos
│   ├── clientes.php        # API REST de clientes
│   └── ventas.php          # API REST de ventas
│
├── sql/
│   └── granja_media_luna.sql  # Script de base de datos
│
├── img/                    # Imágenes del sitio
│
├── index.html              # Página principal
├── productos.html          # Gestión de productos
├── clientes.html           # Gestión de clientes
├── ventas.html             # Gestión de ventas
├── contacto.html           # Página de contacto
└── login.html              # Página de inicio de sesión
```

---

## ⚙️ Instalación y Configuración

### Requisitos Previos
- XAMPP (o servidor web con PHP 8.0+ y MySQL)
- Navegador web moderno

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd C:\xampp\htdocs\ejemplos
   ```

2. **Configurar la base de datos**
   - Abrir phpMyAdmin (http://localhost/phpmyadmin)
   - Crear una base de datos llamada `granja_media_luna`
   - Importar el archivo `sql/granja_media_luna.sql`

3. **Configurar la conexión a la base de datos**
   - Editar el archivo `php/conexion.php`
   - Verificar las credenciales de conexión:
     ```php
     $host = "localhost";
     $usuario = "root";
     $contrasena = "";
     $base_datos = "granja_media_luna";
     ```

4. **Iniciar el servidor**
   - Iniciar Apache y MySQL desde el panel de control de XAMPP
   - Acceder al proyecto: http://localhost/ejemplos/granja_media_luna/granja_media_luna/

---

## 👤 Usuarios de Prueba

El sistema incluye usuarios predefinidos para pruebas:

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| admin@granjamedialuna.com | password | Administrador |
| empleado@granjamedialuna.com | password | Empleado |

---

## 📦 Funcionalidades Implementadas

### ✅ Módulo de Productos
- **Listar productos**: Vista en cards con información detallada
- **Agregar productos**: Formulario con validaciones
- **Editar productos**: Modal de edición con validaciones
- **Eliminar productos**: Con confirmación de seguridad
- **Filtros**: Búsqueda por nombre y tipo

### ✅ Módulo de Clientes
- **Listar clientes**: Tabla con información completa
- **Agregar clientes**: Formulario con validaciones (nombre, teléfono, correo)
- **Editar clientes**: Modal de edición
- **Eliminar clientes**: Con confirmación

### ✅ Módulo de Ventas
- **Carrito de compras**: Agregar múltiples productos
- **Cálculo automático**: Subtotales y total de venta
- **Validación de stock**: Previene ventas sin inventario
- **Historial de ventas**: Listado completo con filtros
- **Facturación**: Visualización e impresión de facturas
- **Actualización de inventario**: Descuenta stock automáticamente

### ✅ Contacto
- **Formulario de contacto**: Con validaciones completas
- **Integración WhatsApp**: Enlace directo para mensajes
- **Mapa de ubicación**: Google Maps embebido
- **Información de contacto**: Teléfono, correo, dirección, horarios

### ✅ Autenticación
- **Login funcional**: Verificación de credenciales
- **Gestión de sesiones**: Control de acceso
- **Indicador de sesión**: Muestra usuario activo en navbar
- **Cerrar sesión**: Botón de logout

### ✅ Validaciones
- **Frontend**: Validaciones en tiempo real con JavaScript
- **Backend**: Validaciones en PHP antes de guardar
- **Mensajes informativos**: Alertas claras para el usuario

---

## 🎨 Diseño y UX

### Características de Diseño
- **Tema agrícola**: Paleta de colores verdes y tierra
- **Responsive**: Adaptable a móviles, tablets y desktop
- **Iconografía**: Font Awesome para mejor UX
- **Animaciones**: Transiciones suaves y elegantes
- **Accesibilidad**: Estructura semántica y contraste adecuado

### Colores Principales
- **Verde Primario**: `#2d5a27` (header, botones)
- **Verde Secundario**: `#4a7c59` (hover)
- **Amarillo Acento**: `#f4e4bc` (detalles)
- **Marrón**: `#8b4513` (elementos tierra)

---

## 📊 Base de Datos

### Tablas Principales

**productos**
- id (PK)
- nombre
- descripcion
- precio
- stock

**clientes**
- id (PK)
- nombre
- telefono
- correo

**ventas**
- id (PK)
- id_cliente (FK)
- fecha
- total

**detalle_venta**
- id (PK)
- id_venta (FK)
- id_producto (FK)
- cantidad
- subtotal

**usuarios**
- id (PK)
- nombre
- correo
- contrasena (hash)
- rol

---

## 🔒 Seguridad

- Contraseñas hasheadas con `password_hash()` de PHP
- Consultas preparadas (Prepared Statements) para prevenir SQL Injection
- Validación de datos en frontend y backend
- Control de sesiones con PHP sessions
- Sanitización de entradas de usuario

---

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop**: 1024px en adelante
- **Tablet**: 768px - 1023px
- **Móvil**: Hasta 767px

---

## 🚀 Características Destacadas

1. **Sistema de Carrito Inteligente**: Valida stock en tiempo real
2. **Facturación Profesional**: Diseño listo para imprimir
3. **Integración WhatsApp**: Comunicación directa con clientes
4. **Modales Elegantes**: Edición sin recargar página
5. **Alertas Informativas**: Feedback claro para cada acción
6. **Código Comentado**: Fácil de entender y mantener

---

## 📝 Notas Importantes

### Para Producción
1. Cambiar contraseñas predeterminadas
2. Configurar HTTPS
3. Actualizar coordenadas del mapa en `contacto.html`
4. Personalizar número de WhatsApp en el código
5. Configurar envío de correos real (actualmente simulado)
6. Implementar respaldos automáticos de base de datos

### Mejoras Futuras Sugeridas
- Sistema de reportes y estadísticas
- Gráficos de ventas
- Exportación a PDF de facturas
- Sistema de notificaciones por correo
- Panel de administración completo
- Gestión de proveedores
- Control de gastos

---

## 🤝 Contribuciones

Este proyecto fue desarrollado como sistema de gestión para la Granja Media Luna.
Todas las funcionalidades están implementadas y documentadas.

---

## 📄 Licencia

Proyecto educativo - Granja Media Luna © 2025

---

## 📞 Soporte

Para consultas o soporte:
- **Teléfono**: (300) 123-4567
- **Email**: info@granjamedialuna.com
- **WhatsApp**: +57 300 123 4567

---

## ✨ Características del Código

### Buenas Prácticas Implementadas
✅ Código comentado y legible
✅ Separación de responsabilidades (MVC básico)
✅ Funciones reutilizables
✅ Validaciones completas
✅ Manejo de errores
✅ Nombres descriptivos de variables
✅ Estructura organizada de archivos
✅ API REST para comunicación
✅ Responsive design
✅ Accesibilidad web

---

**¡Gracias por usar el Sistema de Gestión de Granja Media Luna!** 🥚🐔


