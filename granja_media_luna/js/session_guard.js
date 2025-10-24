// ============================================
// 🔐 PROTECCIÓN DE SESIÓN
// ============================================
// Este script protege páginas administrativas
// Redirige al login si no hay sesión activa
// ============================================

/**
 * Verifica si el usuario está logueado
 * Si no lo está, redirige al login
 */
async function requireLogin() {
    try {
        const response = await fetch('php/check_session.php');
        const data = await response.json();
        
        if (!data.logged_in) {
            // No está logueado, redirigir al login
            alert('Debes iniciar sesión para acceder a esta página');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        // En caso de error, redirigir al login por seguridad
        window.location.href = 'login.html';
    }
}

// Ejecutar verificación al cargar la página
requireLogin();


