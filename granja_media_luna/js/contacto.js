// ============================================
// 📧 FORMULARIO DE CONTACTO - Granja Media Luna
// ============================================
// Este archivo maneja el formulario de contacto
// Valida datos y muestra mensajes de confirmación
// ============================================

/**
 * Valida el formato de un correo electrónico
 * @param {string} email - Correo a validar
 * @returns {boolean} - True si es válido, false si no
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida el formato de un teléfono
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} - True si es válido, false si no
 */
function validarTelefono(telefono) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(telefono);
}

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} event - Evento del formulario
 */
async function enviarFormularioContacto(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    // Validaciones
    if (!nombre) {
        showAlert('Por favor ingrese su nombre', 'warning');
        return;
    }
    
    if (nombre.length < 3) {
        showAlert('El nombre debe tener al menos 3 caracteres', 'warning');
        return;
    }
    
    if (!correo) {
        showAlert('Por favor ingrese su correo electrónico', 'warning');
        return;
    }
    
    if (!validarEmail(correo)) {
        showAlert('Por favor ingrese un correo electrónico válido', 'warning');
        return;
    }
    
    if (telefono && !validarTelefono(telefono)) {
        showAlert('Por favor ingrese un teléfono válido', 'warning');
        return;
    }
    
    if (!mensaje) {
        showAlert('Por favor ingrese su mensaje', 'warning');
        return;
    }
    
    if (mensaje.length < 10) {
        showAlert('El mensaje debe tener al menos 10 caracteres', 'warning');
        return;
    }
    
    // Simular envío exitoso (en producción aquí se enviaría por email o se guardaría en BD)
    // Para una implementación real, necesitarías un archivo PHP que maneje el envío de correos
    
    showAlert('¡Gracias por contactarnos! Hemos recibido tu mensaje y te responderemos pronto.', 'success');
    
    // Limpiar el formulario
    document.getElementById('contactoForm').reset();
    
    // Opcional: Abrir WhatsApp con el mensaje
    const telefonoWhatsApp = '573001234567'; // Número de la granja
    const mensajeWhatsApp = `Hola, soy ${nombre}. ${mensaje}`;
    const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    
    // Preguntar si quiere continuar por WhatsApp
    setTimeout(() => {
        if (confirm('¿Deseas continuar la conversación por WhatsApp?')) {
            window.open(urlWhatsApp, '_blank');
        }
    }, 1500);
}

// ============================================
// 🚀 INICIALIZACIÓN
// ============================================

/**
 * Inicializa el módulo de contacto al cargar la página
 * Configura event listeners
 */
document.addEventListener('DOMContentLoaded', function() {
    const contactoForm = document.getElementById('contactoForm');
    
    if (contactoForm) {
        contactoForm.addEventListener('submit', enviarFormularioContacto);
    }
});


