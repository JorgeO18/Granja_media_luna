# 🔐 Solución al Problema de Login

## El Problema
Cuando intentas iniciar sesión con `admin@granjamedialuna.com` y la contraseña `12345`, el sistema muestra el error **"Usuario no encontrado"**.

## La Causa
Los usuarios no están insertados en la base de datos.

## 📋 Solución Paso a Paso

### Opción 1: Script de Inicialización Automática (RECOMENDADO) ⚡

1. **Abre tu navegador** y ve a:
   ```
   http://localhost/ejemplos/granja_media_luna/php/init_usuarios.php
   ```

2. Este script automáticamente:
   - ✅ Verificará si existen usuarios en la base de datos
   - ✅ Si no existen, los creará automáticamente
   - ✅ Te mostrará las credenciales disponibles

3. **Haz clic en "Ir al Login"** y prueba con:
   - **Email:** `admin@granjamedialuna.com`
   - **Contraseña:** `password` o `12345`

### Opción 2: Importar el SQL manualmente 📦

Si prefieres importar la base de datos completa:

1. Abre **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Selecciona la base de datos `granja_media_luna`
3. Ve a la pestaña **"Importar"**
4. Selecciona el archivo `sql/granja_media_luna.sql`
5. Haz clic en **"Continuar"**

### Opción 3: Crear un Nuevo Usuario 👤

Ahora el sistema incluye una página de registro:

1. Abre: `http://localhost/ejemplos/granja_media_luna/login.html`
2. Haz clic en **"Regístrate aquí"**
3. Llena el formulario con tus datos
4. Selecciona el tipo de usuario (Empleado o Administrador)
5. Haz clic en **"Registrarse"**

## 🎯 Credenciales Predeterminadas

Después de ejecutar el script de inicialización, podrás usar:

| Tipo | Email | Contraseña |
|------|-------|------------|
| **Admin** | admin@granjamedialuna.com | `password` o `12345` |
| **Empleado** | empleado@granjamedialuna.com | `password` o `12345` |

## ❓ Sobre el Registro de Usuarios

**Sí, el sistema ahora permite crear nuevos usuarios** a través de la página de registro (`registro.html`).

### Características del Registro:
- ✅ Validación de campos
- ✅ Verificación de correos duplicados
- ✅ Confirmación de contraseña
- ✅ Selección de rol (Admin o Empleado)
- ✅ Contraseñas encriptadas con seguridad

## 🛠️ Verificar que Todo Funcione

1. **Ejecuta el script de inicialización:**
   ```
   http://localhost/ejemplos/granja_media_luna/php/init_usuarios.php
   ```

2. **Ve al login:**
   ```
   http://localhost/ejemplos/granja_media_luna/login.html
   ```

3. **Inicia sesión con:**
   - Email: `admin@granjamedialuna.com`
   - Contraseña: `password`

4. **Deberías ser redirigido a** `index.html` con la sesión iniciada.

## 📝 Archivos Nuevos Creados

- `php/init_usuarios.php` - Script para inicializar usuarios
- `php/registro.php` - Backend para registro de usuarios
- `registro.html` - Página de registro
- `js/registro.js` - Lógica del formulario de registro
- `INSTRUCCIONES_LOGIN.md` - Este archivo

## 🚀 Próximos Pasos

1. Ejecuta `php/init_usuarios.php`
2. Prueba el login con las credenciales predeterminadas
3. Prueba crear un nuevo usuario desde el registro
4. ¡Listo para usar el sistema!

---

**¿Necesitas ayuda?** Los archivos están listos y funcionando. Solo ejecuta el script de inicialización.


