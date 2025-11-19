// ============================================
// 🛒 GESTIÓN DE COMPRAS - Granja Media Luna
// ============================================
// Este archivo maneja el módulo de compras para usuarios:
// - Cargar productos dinámicamente
// - Calcular totales automáticamente
// - Registrar nuevas compras (ventas asociadas al usuario)
// - Mostrar historial de compras del usuario
// ============================================

// 📋 Variables globales
let productosDisponibles = []; // Almacena los productos cargados
let carritoCompra = []; // Almacena los productos agregados a la compra actual

// ============================================
// 🔄 CARGAR DATOS INICIALES
// ============================================

/**
 * Carga todos los productos desde la base de datos
 * y los muestra en el select del formulario
 */
async function loadProductos() {
    try {
        const response = await fetch('php/productos_crud.php');
        const productos = await response.json();
        
        productosDisponibles = productos; // Guardar para uso posterior
        
        const selectProducto = document.getElementById('producto');
        
        if (!selectProducto) return;
        
        // Limpiar opciones previas (excepto la primera)
        selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
        
        // Agregar cada producto como opción
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${parseFloat(producto.precio).toLocaleString()} (Stock: ${producto.stock})`;
            option.dataset.precio = producto.precio;
            option.dataset.stock = producto.stock;
            option.dataset.nombre = producto.nombre;
            selectProducto.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        showAlert('Error al cargar la lista de productos', 'danger');
    }
}

/**
 * Obtiene o crea un cliente basado en el email del usuario logueado
 * @returns {Promise<number>} ID del cliente
 */
async function obtenerClienteId() {
    try {
        const response = await fetch('php/get_or_create_cliente.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'No se pudo obtener el cliente');
        }
        
        return data.cliente_id;
    } catch (error) {
        console.error('Error obteniendo/creando cliente:', error);
        throw error;
    }
}

/**
 * Carga el historial de compras del usuario desde la base de datos
 * y lo muestra en la tabla (solo las compras donde el cliente coincide con el email del usuario)
 */
async function loadCompras() {
    const tbody = document.querySelector('#comprasTable tbody');
    
    if (!tbody) {
        console.error('❌ No se encontró #comprasTable tbody');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando compras...</td></tr>';
    
    try {
        // Obtener email del usuario logueado
        const sessionResponse = await fetch('php/check_session.php');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.logged_in || !sessionData.user_email) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Debe iniciar sesión para ver sus compras</td></tr>';
            return;
        }
        
        const userEmail = sessionData.user_email;
        
        // Obtener todas las ventas
        const response = await fetch('php/ventas.php');
        const ventas = await response.json();
        
        // Obtener clientes para filtrar
        const clientesResponse = await fetch('php/clientes.php');
        const clientes = await clientesResponse.json();
        
        // Filtrar ventas donde el cliente tiene el mismo email que el usuario
        const comprasUsuario = ventas.filter(venta => {
            const cliente = clientes.find(c => c.id == venta.id_cliente);
            return cliente && cliente.correo && cliente.correo.toLowerCase() === userEmail.toLowerCase();
        });
        
        tbody.innerHTML = '';
        
        if (comprasUsuario.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No has realizado compras aún</td></tr>';
            return;
        }
        
        // Crear una fila por cada compra
        comprasUsuario.forEach(compra => {
            const row = document.createElement('tr');
            
            // Formatear la fecha
            const fecha = new Date(compra.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-CO') + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
            
            // Generar botones de acción
            let actionButtons = `
                <button class="btn btn-sm btn-secondary" onclick="verDetalleCompra(${compra.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
            `;
            
            row.innerHTML = `
                <td>${compra.id}</td>
                <td>${fechaFormateada}</td>
                <td>${compra.productos || 'Sin productos'}</td>
                <td>$${parseFloat(compra.total || 0).toLocaleString('es-CO')}</td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('❌ ERROR en loadCompras():', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar compras</td></tr>';
    }
}

// ============================================
// 🛍️ GESTIÓN DEL CARRITO DE COMPRA
// ============================================

/**
 * Agrega un producto al carrito de la compra actual
 * Valida stock y cantidad
 */
function agregarProductoCarrito() {
    const selectProducto = document.getElementById('producto');
    const inputCantidad = document.getElementById('cantidad');
    
    // Validar que se haya seleccionado un producto
    if (!selectProducto.value) {
        showAlert('Por favor seleccione un producto', 'warning');
        return;
    }
    
    // Validar cantidad
    const cantidad = parseInt(inputCantidad.value);
    if (!cantidad || cantidad <= 0) {
        showAlert('Por favor ingrese una cantidad válida', 'warning');
        return;
    }
    
    // Obtener datos del producto seleccionado
    const option = selectProducto.options[selectProducto.selectedIndex];
    const productoId = parseInt(selectProducto.value);
    const productoNombre = option.dataset.nombre;
    const productoPrecio = parseFloat(option.dataset.precio);
    const productoStock = parseInt(option.dataset.stock);
    
    // Validar stock disponible
    if (cantidad > productoStock) {
        showAlert(`Stock insuficiente. Solo hay ${productoStock} unidades disponibles`, 'danger');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const productoExistente = carritoCompra.find(item => item.id === productoId);
    
    if (productoExistente) {
        // Si ya existe, actualizar cantidad
        const nuevaCantidad = productoExistente.cantidad + cantidad;
        if (nuevaCantidad > productoStock) {
            showAlert(`No puede agregar más. Stock disponible: ${productoStock}`, 'danger');
            return;
        }
        productoExistente.cantidad = nuevaCantidad;
    } else {
        // Si no existe, agregarlo al carrito
        carritoCompra.push({
            id: productoId,
            nombre: productoNombre,
            precio: productoPrecio,
            cantidad: cantidad
        });
    }
    
    // Actualizar la visualización del carrito
    actualizarCarritoVista();
    
    // Limpiar campos
    selectProducto.value = '';
    inputCantidad.value = '1';
    
    showAlert('Producto agregado al carrito', 'success');
}

/**
 * Actualiza la visualización del carrito de compras
 * Muestra los productos agregados y el total
 */
function actualizarCarritoVista() {
    const carritoContainer = document.getElementById('carritoCompra');
    const totalElement = document.getElementById('totalCompra');
    
    if (!carritoContainer) return;
    
    // Si el carrito está vacío
    if (carritoCompra.length === 0) {
        carritoContainer.innerHTML = '<p class="text-center" style="color: #666;">No hay productos en el carrito</p>';
        if (totalElement) totalElement.textContent = '$0';
        return;
    }
    
    // Generar HTML del carrito
    let html = '<div class="carrito-items">';
    let total = 0;
    
    carritoCompra.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                    <strong>${item.nombre}</strong><br>
                    <small>$${item.precio.toLocaleString('es-CO')} x ${item.cantidad} = $${subtotal.toLocaleString('es-CO')}</small>
                </div>
                <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    carritoContainer.innerHTML = html;
    
    // Actualizar total
    if (totalElement) {
        totalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    }
}

/**
 * Elimina un producto del carrito
 * @param {number} index - Índice del producto en el array del carrito
 */
function eliminarDelCarrito(index) {
    carritoCompra.splice(index, 1);
    actualizarCarritoVista();
    showAlert('Producto eliminado del carrito', 'info');
}

// ============================================
// 💾 REGISTRAR COMPRA
// ============================================

/**
 * Procesa y registra una nueva compra (venta)
 * Valida datos, obtiene cliente del usuario logueado, envía al servidor y actualiza la vista
 */
async function registrarCompra(event) {
    event.preventDefault();
    
    // Validar que haya productos en el carrito
    if (carritoCompra.length === 0) {
        showAlert('Por favor agregue al menos un producto a su compra', 'warning');
        return;
    }
    
    try {
        // Obtener el ID del cliente asociado al usuario logueado
        const clienteId = await obtenerClienteId();
        
        // Preparar datos para enviar
        const formData = new FormData();
        formData.append('cliente', clienteId);
        formData.append('productos', JSON.stringify(carritoCompra));
        
        // Enviar datos al servidor
        const response = await fetch('php/ventas.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('¡Compra realizada exitosamente!', 'success');
            
            // Limpiar formulario y carrito
            carritoCompra = [];
            actualizarCarritoVista();
            
            // Recargar listas
            loadCompras();
            loadProductos(); // Recargar para actualizar stock
            
        } else {
            showAlert(result.message || 'Error al realizar la compra', 'danger');
        }
        
    } catch (error) {
        showAlert('Error al procesar la compra: ' + error.message, 'danger');
        console.error('Error:', error);
    }
}

// ============================================
// 👁️ VER DETALLES DE COMPRA
// ============================================

/**
 * Muestra los detalles completos de una compra en un modal
 * @param {number} compraId - ID de la compra (venta) a mostrar
 */
async function verDetalleCompra(compraId) {
    try {
        const response = await fetch('php/ventas.php');
        const ventas = await response.json();
        
        const compra = ventas.find(v => v.id == compraId);
        
        if (!compra) {
            showAlert('Compra no encontrada', 'danger');
            return;
        }
        
        // Crear modal de detalles
        mostrarModalFactura(compra);
        
    } catch (error) {
        showAlert('Error al cargar los detalles de la compra', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Muestra un modal con la factura de la compra
 * @param {Object} compra - Objeto con datos de la compra (venta)
 */
function mostrarModalFactura(compra) {
    // Crear el modal si no existe
    let modal = document.getElementById('modalFactura');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalFactura';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Formatear fecha
    const fecha = new Date(compra.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-CO') + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    // Contenido de la factura
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2><i class="fas fa-file-invoice"></i> Factura de Compra #${compra.id}</h2>
                <span class="modal-close" onclick="cerrarModalFactura()">&times;</span>
            </div>
            <div class="modal-body" id="facturaContenido">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: var(--primary-green); margin: 0;">
                        <i class="fas fa-egg"></i> Granja Media Luna
                    </h1>
                    <p style="margin: 5px 0;">Vereda Media Luna, Colombia</p>
                    <p style="margin: 5px 0;">Tel: (300) 123-4567 | info@granjamedialuna.com</p>
                </div>
                
                <hr style="border: 1px solid var(--primary-green); margin: 20px 0;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h3 style="color: var(--primary-green); margin-bottom: 10px;">Información del Cliente</h3>
                        <p><strong>Cliente:</strong> ${compra.cliente_nombre || 'No especificado'}</p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    </div>
                    <div style="text-align: right;">
                        <h3 style="color: var(--primary-green); margin-bottom: 10px;">Detalles de la Compra</h3>
                        <p><strong>Factura #:</strong> ${compra.id}</p>
                        <p><strong>Productos:</strong> ${compra.productos || 'N/A'}</p>
                    </div>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--primary-green); margin-bottom: 15px;">Productos</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        ${compra.productos || 'Sin detalles de productos'}
                    </div>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                
                <div style="text-align: right; font-size: 1.2rem;">
                    <p style="margin: 10px 0;"><strong>Total: </strong> <span style="font-size: 1.5rem; color: var(--primary-green);">$${parseFloat(compra.total || 0).toLocaleString('es-CO')}</span></p>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                
                <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9rem;">
                    <p>¡Gracias por su compra!</p>
                    <p>Esta factura fue generada electrónicamente</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="cerrarModalFactura()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="imprimirFactura()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>
        </div>
    `;
    
    // Mostrar el modal
    modal.style.display = 'flex';
}

/**
 * Cierra el modal de factura
 */
function cerrarModalFactura() {
    const modal = document.getElementById('modalFactura');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Imprime la factura actual
 */
function imprimirFactura() {
    const contenido = document.getElementById('facturaContenido');
    
    if (!contenido) return;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Factura - Granja Media Luna</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1, h2, h3 {
                    color: #2d5a27;
                }
                hr {
                    border: none;
                    border-top: 1px solid #ddd;
                    margin: 20px 0;
                }
                .text-center {
                    text-align: center;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            ${contenido.innerHTML}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
}

// ============================================
// 🚀 INICIALIZACIÓN
// ============================================

/**
 * Inicializa el módulo de compras al cargar la página
 * Carga datos y configura event listeners
 */
document.addEventListener('DOMContentLoaded', function() {
    // Manejar el formulario de compra
    const compraForm = document.getElementById('compraForm');
    if (compraForm) {
        compraForm.addEventListener('submit', registrarCompra);
    }
    
    // Botón para agregar producto al carrito
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', agregarProductoCarrito);
    }
});


