// 📝 Gestión de registro de usuarios
async function handleRegistro(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contrasena = formData.get('contrasena');
    const confirmarContrasena = formData.get('confirmar_contrasena');
    
    // Validar que las contraseñas coincidan
    if (contrasena !== confirmarContrasena) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    try {
        console.log('Intentando registrar usuario...'); // Debug
        
        const response = await fetch('php/registro.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('Resultado:', result); // Debug
        
        if (result.success) {
            showAlert('Usuario registrado exitosamente. Redirigiendo al login...', 'success');
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showAlert(result.message || 'Error al registrar usuario', 'danger');
        }
    } catch (error) {
        showAlert('Error al registrar usuario. Revisa la consola.', 'danger');
        console.error('Error completo:', error);
    }
}

// Inicializar formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', handleRegistro);
        console.log('Formulario de registro inicializado');
    }
});


