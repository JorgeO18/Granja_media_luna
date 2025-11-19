// ============================================
// 🏠 JAVASCRIPT PRINCIPAL - Granja Media Luna
// ============================================
// Este archivo contiene funciones globales y de utilidad
// ============================================

// Funciones principales
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFormValidations();
    initializeAnimations();
    updateSessionUI(); // Actualizar interfaz según estado de sesión
});

// Navegación móvil
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// Validaciones de formularios
function initializeFormValidations() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    // Limpiar errores anteriores
    clearFieldError(field);
    
    // Validar campo requerido
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    // Validaciones específicas por tipo
    switch (fieldType) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, 'Ingrese un email válido');
                return false;
            }
            break;
        case 'tel':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Ingrese un teléfono válido');
                return false;
            }
            break;
        case 'number':
            if (value && isNaN(value)) {
                showFieldError(field, 'Ingrese un número válido');
                return false;
            }
            break;
    }
    
    // Validaciones específicas por nombre
    switch (fieldName) {
        case 'cedula':
            if (value && !isValidCedula(value)) {
                showFieldError(field, 'Ingrese una cédula válida (8-10 dígitos)');
                return false;
            }
            break;
        case 'precio':
            if (value && (parseFloat(value) <= 0)) {
                showFieldError(field, 'El precio debe ser mayor a 0');
                return false;
            }
            break;
        case 'cantidad':
            if (value && (parseInt(value) <= 0)) {
                showFieldError(field, 'La cantidad debe ser mayor a 0');
                return false;
            }
            break;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{7,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function isValidCedula(cedula) {
    const cedulaRegex = /^[0-9]{8,10}$/;
    return cedulaRegex.test(cedula.replace(/\s/g, ''));
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Animaciones
function initializeAnimations() {
    // Animación de aparición de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que deben animarse
    document.querySelectorAll('.feature-card, .product-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// Funciones de utilidad para cálculos
function calculateSubtotal(price, quantity) {
    return parseFloat(price) * parseInt(quantity);
}

function calculateTotal(subtotal, tax = 0) {
    return subtotal + (subtotal * tax / 100);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Funciones para manejo de productos en facturación
function addProductToInvoice(productId, productName, price, availableStock) {
    const invoiceTable = document.getElementById('invoice-products');
    if (!invoiceTable) return;
    
    const tbody = invoiceTable.querySelector('tbody');
    if (!tbody) return;
    
    // Verificar si el producto ya está en la factura
    const existingRow = tbody.querySelector(`tr[data-product-id="${productId}"]`);
    if (existingRow) {
        const quantityInput = existingRow.querySelector('.quantity-input');
        const currentQuantity = parseInt(quantityInput.value);
        if (currentQuantity < availableStock) {
            quantityInput.value = currentQuantity + 1;
            updateRowTotal(existingRow);
        } else {
            showAlert('No hay suficiente stock disponible', 'warning');
        }
        return;
    }
    
    // Crear nueva fila
    const row = document.createElement('tr');
    row.setAttribute('data-product-id', productId);
    row.innerHTML = `
        <td>${productName}</td>
        <td>
            <input type="number" class="quantity-input" value="1" min="1" max="${availableStock}" 
                   onchange="updateRowTotal(this.closest('tr'))">
        </td>
        <td class="unit-price">${formatCurrency(price)}</td>
        <td class="row-total">${formatCurrency(price)}</td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeProductRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    updateInvoiceTotal();
}

function updateRowTotal(row) {
    const quantity = parseInt(row.querySelector('.quantity-input').value);
    const price = parseFloat(row.querySelector('.unit-price').textContent.replace(/[^\d]/g, ''));
    const total = quantity * price;
    
    row.querySelector('.row-total').textContent = formatCurrency(total);
    updateInvoiceTotal();
}

function removeProductRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateInvoiceTotal();
}

function updateInvoiceTotal() {
    const rows = document.querySelectorAll('#invoice-products tbody tr');
    let subtotal = 0;
    
    rows.forEach(row => {
        const totalText = row.querySelector('.row-total').textContent;
        const total = parseFloat(totalText.replace(/[^\d]/g, ''));
        subtotal += total;
    });
    
    const taxRate = 19; // IVA del 19%
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax;
    
    document.getElementById('invoice-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('invoice-tax').textContent = formatCurrency(tax);
    document.getElementById('invoice-total').textContent = formatCurrency(total);
}

// Funciones para mostrar alertas
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button type="button" class="close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.maxWidth = '400px';
    
    document.body.appendChild(container);
    return container;
}

// Funciones para búsqueda y filtrado
function filterTable(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    
    if (!input || !table) return;
    
    const filter = input.value.toLowerCase();
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

// Funciones para confirmación de eliminación
function confirmDelete(message, callback) {
    if (confirm(message || '¿Está seguro de que desea eliminar este elemento?')) {
        callback();
    }
}

// Funciones para carga de datos
function loadSelectOptions(selectId, endpoint, valueField, textField) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            select.innerHTML = '<option value="">Seleccione...</option>';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar opciones:', error);
            showAlert('Error al cargar las opciones', 'danger');
        });
}

// Funciones para exportar datos
function exportToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = Array.from(table.querySelectorAll('tr'));
    const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => `"${cell.textContent.trim()}"`).join(',');
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicialización de tooltips (si se usa Bootstrap o similar)
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ============================================
// 🔐 FUNCIONES DE MANEJO DE SESIÓN
// ============================================

/**
 * Verifica si hay una sesión activa y redirige si no
 */
function checkSession() {
    fetch('php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
        });
}

/**
 * Actualiza la interfaz de usuario según el estado de sesión
 * Muestra/oculta botones de login/logout y nombre de usuario
 * Muestra/oculta enlaces administrativos
 */
async function updateSessionUI() {
    try {
        const response = await fetch('php/check_session.php');
        const data = await response.json();
        
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const adminLinks = document.querySelectorAll('.admin-only');
        const usuarioLinks = document.querySelectorAll('.usuario-only');
        const adminOnly = document.querySelectorAll('.admin-only-content');
        const employeeOnly = document.querySelectorAll('.employee-only');
        
        // Guardar el rol del usuario en una variable global
        window.userRole = data.user_role || null;
        window.isAdmin = (data.user_role === 'admin');
        
        console.log('[SessionUI] Datos de sesión:', data);
        console.log('[SessionUI] usuarioLinks:', usuarioLinks.length, 'adminLinks:', adminLinks.length);
        
        if (data.logged_in) {
            // Usuario está logueado
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
            if (userInfo) userInfo.style.display = 'block';
            if (userName) userName.textContent = data.user_name || 'Usuario';
            
            // Mostrar/ocultar enlaces administrativos según el rol
            const isAdmin = data.user_role === 'admin';
            adminLinks.forEach(link => {
                link.style.display = isAdmin ? 'block' : 'none';
            });
            
            // Mostrar/ocultar enlaces de usuario (solo para usuarios no admin)
            usuarioLinks.forEach(link => {
                link.style.display = isAdmin ? 'none' : 'block';
            });
            
            // Mostrar/ocultar contenido solo para admins
            adminOnly.forEach(element => {
                element.style.display = isAdmin ? 'block' : 'none';
            });
            
            // Mostrar/ocultar contenido solo para empleados
            employeeOnly.forEach(element => {
                element.style.display = isAdmin ? 'none' : 'block';
            });
        } else {
            // Usuario no está logueado
            if (loginLink) loginLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            
            // Ocultar enlaces administrativos
            adminLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            // Ocultar enlaces de usuario
            usuarioLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            // Ocultar contenido solo para admins
            adminOnly.forEach(element => {
                element.style.display = 'none';
            });
            
            // Ocultar contenido solo para empleados
            employeeOnly.forEach(element => {
                element.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Error al actualizar UI de sesión:', error);
    }
}

// Auto-logout después de inactividad
function initializeAutoLogout() {
    let inactivityTimer;
    const timeout = 30 * 60 * 1000; // 30 minutos
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            logout();
        }, timeout);
    }
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

function logout() {
    fetch('php/logout.php', { method: 'POST' })
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
        });
}

// Funciones para impresión
function printInvoice(invoiceId) {
    const printWindow = window.open('', '_blank');
    const invoiceContent = document.getElementById(`invoice-${invoiceId}`).innerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Factura ${invoiceId}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 20px; }
                    .invoice-table { width: 100%; border-collapse: collapse; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .invoice-table th { background-color: #f2f2f2; }
                    .invoice-total { text-align: right; font-weight: bold; }
                </style>
            </head>
            <body>
                ${invoiceContent}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}
