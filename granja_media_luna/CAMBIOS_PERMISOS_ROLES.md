# 🔐 Cambios Implementados: Distinción de Roles (Admin vs Empleado)

## 📋 Resumen
Se ha implementado un sistema de permisos que distingue entre **Administrador** y **Empleado**, limitando las operaciones que cada rol puede realizar.

---

## ✅ Cambios Realizados

### 1. **Backend - Endpoints PHP** 🔧

#### `php/productos_crud.php`
- ✅ **POST** (Crear): `requireAdmin()` - Solo admins pueden crear productos
- ✅ **PUT** (Actualizar): `requireAdmin()` - Solo admins pueden editar productos
- ✅ **DELETE** (Eliminar): `requireAdmin()` - Solo admins pueden eliminar productos
- ✅ **GET** (Listar): Acceso público - Todos pueden ver productos

#### `php/clientes.php`
- ✅ **POST** (Crear): `requireAdmin()` - Solo admins pueden crear clientes
- ✅ **PUT** (Actualizar): `requireAdmin()` - Solo admins pueden editar clientes
- ✅ **DELETE** (Eliminar): `requireAdmin()` - Solo admins pueden eliminar clientes
- ✅ **GET** (Listar): Acceso público - Todos pueden ver clientes

#### `php/ventas.php`
- ✅ **POST** (Crear venta): `requireLogin()` - Empleados Y admins pueden registrar ventas
- ✅ **GET** (Listar ventas): `requireLogin()` - Empleados Y admins pueden ver ventas

---

### 2. **Frontend - JavaScript** 🎨

#### `js/main.js` - Función `updateSessionUI()`
Se mejoró la función para:
- ✅ Guardar el rol del usuario en variables globales: `window.userRole` y `window.isAdmin`
- ✅ Mostrar/ocultar elementos con clase `.admin-only-content` (solo para admins)
- ✅ Mostrar/ocultar elementos con clase `.employee-only` (solo para empleados)

#### `js/productos.js`
- ✅ Los botones de **Editar** y **Eliminar** solo aparecen para administradores
- ✅ Empleados pueden ver productos pero sin botones de edición/eliminación

#### `js/clientes.js`
- ✅ Los botones de **Editar** y **Eliminar** solo aparecen para administradores
- ✅ Empleados pueden ver clientes pero sin botones de edición/eliminación

---

### 3. **Frontend - HTML** 🎯

#### `productos.html`
- ✅ Formulario de "Agregar Nuevo Producto" envuelto en `<div class="admin-only-content">`
- ✅ Empleados no ven este formulario

#### `clientes.html`
- ✅ Formulario de "Agregar Nuevo Cliente" envuelto en `<div class="admin-only-content">`
- ✅ Empleados no ven este formulario

#### `registro.html`
- ✅ Eliminada la opción de seleccionar rol en el formulario
- ✅ Ahora el rol se envía automáticamente como `empleado` mediante un campo oculto
- ✅ Se agregó un mensaje informativo: "Se registrará como Empleado"

---

## 🎯 Permisos por Rol

### 👤 **EMPLEADO**
#### ✅ Puede hacer:
- Ver catálogo de productos
- Ver lista de clientes
- Ver historial de ventas
- Registrar nuevas ventas
- Actualizar stock al vender

#### ❌ NO puede hacer:
- Crear productos
- Editar productos
- Eliminar productos
- Crear clientes
- Editar clientes
- Eliminar clientes
- Ver formularios de gestión

---

### 👨‍💼 **ADMINISTRADOR**
#### ✅ Puede hacer:
- **TODO lo que puede un empleado, MÁS:**
- Crear productos
- Editar productos
- Eliminar productos
- Crear clientes
- Editar clientes
- Eliminar clientes
- Ver y usar formularios de gestión

---

## 🔍 Cómo Funciona

### Backend
1. La función `requireAdmin()` verifica si el usuario está logueado Y es admin
2. Si un empleado intenta crear/editar/eliminar, recibe un error: "No tiene permisos para realizar esta acción"

### Frontend
1. Al iniciar sesión, `check_session.php` devuelve el rol del usuario
2. La función `updateSessionUI()` guarda `window.isAdmin = true/false`
3. Los JavaScript específicos verifican `window.isAdmin` antes de mostrar botones
4. El HTML oculta elementos con clase `.admin-only-content` para empleados

---

## 🧪 Cómo Probar

### 1. Login como Empleado
```
Email: empleado@granjamedialuna.com
Contraseña: password
```

**Verificar que:**
- ❌ No aparece el formulario "Agregar Nuevo Producto"
- ❌ No aparecen botones "Editar" y "Eliminar" en productos
- ❌ No aparece el formulario "Agregar Nuevo Cliente"
- ❌ No aparecen botones "Editar" y "Eliminar" en clientes
- ✅ Puede ver la lista de productos
- ✅ Puede ver la lista de clientes
- ✅ Puede registrar ventas

### 2. Login como Administrador
```
Email: admin@granjamedialuna.com
Contraseña: password
```

**Verificar que:**
- ✅ Aparece el formulario "Agregar Nuevo Producto"
- ✅ Aparecen botones "Editar" y "Eliminar" en productos
- ✅ Aparece el formulario "Agregar Nuevo Cliente"
- ✅ Aparecen botones "Editar" y "Eliminar" en clientes
- ✅ Puede crear/editar/eliminar productos
- ✅ Puede crear/editar/eliminar clientes

### 3. Registro de Nuevo Usuario
1. Ir a `registro.html`
2. Intentar registrar un usuario
3. **Verificar que:**
   - ❌ No hay selector de rol
   - ✅ Aparece mensaje: "Se registrará como Empleado"
   - ✅ El usuario se crea como empleado

---

## 📝 Notas Importantes

1. **Seguridad:** Los permisos están verificados TANTO en frontend como en backend. Aunque un empleado modifique el JavaScript, el backend lo bloqueará.

2. **Creación de Administradores:** Los administradores solo se pueden crear desde:
   - El script `php/init_usuarios.php` (para pruebas)
   - Dirección manual en la base de datos
   - El formulario de registro NO permite crear admins

3. **Compatibilidad:** Los cambios son retrocompatibles. Los usuarios existentes mantienen sus roles actuales.

---

## 🔄 Archivos Modificados

### PHP (Backend)
- `php/productos_crud.php`
- `php/clientes.php`

### JavaScript (Frontend)
- `js/main.js`
- `js/productos.js`
- `js/clientes.js`

### HTML (Frontend)
- `productos.html`
- `clientes.html`
- `registro.html`

---

## 📊 Tabla de Permisos Completa

| Funcionalidad | Empleado | Administrador |
|--------------|----------|---------------|
| Ver productos | ✅ | ✅ |
| Crear productos | ❌ | ✅ |
| Editar productos | ❌ | ✅ |
| Eliminar productos | ❌ | ✅ |
| Ver clientes | ✅ | ✅ |
| Crear clientes | ❌ | ✅ |
| Editar clientes | ❌ | ✅ |
| Eliminar clientes | ❌ | ✅ |
| Ver ventas | ✅ | ✅ |
| Registrar ventas | ✅ | ✅ |
| Registrarse como admin | ❌ | ❌ |

---

## ✅ Verificación Final

- [x] Backend protegido con `requireAdmin()`
- [x] Frontend oculta controles según rol
- [x] Registro solo crea empleados
- [x] Empleados pueden ver pero no editar
- [x] Sin errores de linting
- [x] Documentación completa

---

**Fecha:** 2025-01-27  
**Estado:** ✅ Completado


