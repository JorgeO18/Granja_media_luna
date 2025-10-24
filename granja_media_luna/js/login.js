// 🔐 Gestión de autenticación
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const correo = formData.get('correo');
    const contrasena = formData.get('contrasena');
    
    try {
        console.log('Intentando login con:', correo); // Debug
        
        const response = await fetch('php/auth.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status); // Debug
        
        const result = await response.json();
        console.log('Resultado:', result); // Debug
        
        if (result.success) {
            showAlert('Login exitoso. Redirigiendo...', 'success');
            
            // Redirigir al dashboard o página principal
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showAlert(result.message || 'Error al iniciar sesión', 'danger');
            console.error('Login fallido:', result.message);
        }
    } catch (error) {
        showAlert('Error al iniciar sesión. Revisa la consola.', 'danger');
        console.error('Error completo:', error);
    }
}

// Verificar sesión al cargar la página
async function checkSession() {
    try {
        const response = await fetch('php/check_session.php');
        const result = await response.json();
        
        if (result.logged_in) {
            // Usuario ya está logueado, redirigir
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

// Cerrar sesión
async function logout() {
    try {
        const response = await fetch('php/logout.php', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Sesión cerrada correctamente', 'info');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error cerrando sesión:', error);
    }
}

// Cargar opciones de clientes para ventas
async function loadClientesForVentas() {
    const select = document.getElementById('cliente');
    if (!select) return;
    
    try {
        const response = await fetch('php/clientes.php');
        const clientes = await response.json();
        
        select.innerHTML = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

// Cargar opciones de productos para ventas
async function loadProductosForVentas() {
    const select = document.getElementById('producto');
    if (!select) return;
    
    try {
        const response = await fetch('php/productos_crud.php');
        const productos = await response.json();
        
        select.innerHTML = '<option value="">Seleccione un producto...</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${producto.precio}`;
            option.dataset.precio = producto.precio;
            option.dataset.stock = producto.stock;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        checkSession(); // Verificar si ya está logueado
    }
    
    // Cargar opciones para ventas
    if (document.getElementById('cliente')) {
        loadClientesForVentas();
    }
    if (document.getElementById('producto')) {
        loadProductosForVentas();
    }
});
