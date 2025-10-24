// ============================================
// 🛒 GESTIÓN DE VENTAS - Granja Media Luna
// ============================================
// Este archivo maneja todo el módulo de ventas:
// - Cargar clientes y productos dinámicamente
// - Calcular totales automáticamente
// - Registrar nuevas ventas
// - Mostrar historial de ventas
// ============================================

// 📋 Variables globales
let productosDisponibles = []; // Almacena los productos cargados
let carritoVenta = []; // Almacena los productos agregados a la venta actual

// ============================================
// 🔄 CARGAR DATOS INICIALES
// ============================================

/**
 * Carga todos los clientes desde la base de datos
 * y los muestra en el select del formulario
 */
async function loadClientes() {
    try {
        const response = await fetch('php/clientes.php');
        const clientes = await response.json();
        
        const selectCliente = document.getElementById('cliente');
        
        if (!selectCliente) return;
        
        // Limpiar opciones previas (excepto la primera)
        selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
        
        // Agregar cada cliente como opción
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nombre} - ${cliente.telefono || 'Sin teléfono'}`;
            selectCliente.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showAlert('Error al cargar la lista de clientes', 'danger');
    }
}

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
 * Carga el historial de ventas desde la base de datos
 * y lo muestra en la tabla
 */
async function loadVentas() {
    const tbody = document.querySelector('#ventasTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando ventas...</td></tr>';
    
    try {
        const response = await fetch('php/ventas.php');
        const ventas = await response.json();
        
        tbody.innerHTML = '';
        
        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay ventas registradas</td></tr>';
            return;
        }
        
        // Crear una fila por cada venta
        ventas.forEach(venta => {
            const row = document.createElement('tr');
            
            // Formatear la fecha
            const fecha = new Date(venta.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-CO') + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${venta.id}</td>
                <td>${venta.cliente_nombre || 'Cliente desconocido'}</td>
                <td>${venta.productos || 'Sin productos'}</td>
                <td>${venta.total ? venta.total.split('.')[0] : '0'}</td>
                <td>$${parseFloat(venta.total || 0).toLocaleString('es-CO')}</td>
                <td>${fechaFormateada}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="verDetalleVenta(${venta.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar ventas</td></tr>';
        console.error('Error cargando ventas:', error);
    }
}

// ============================================
// 🛍️ GESTIÓN DEL CARRITO DE VENTA
// ============================================

/**
 * Agrega un producto al carrito de la venta actual
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
    const productoExistente = carritoVenta.find(item => item.id === productoId);
    
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
        carritoVenta.push({
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
    inputCantidad.value = '';
    
    showAlert('Producto agregado al carrito', 'success');
}

/**
 * Actualiza la visualización del carrito de compras
 * Muestra los productos agregados y el total
 */
function actualizarCarritoVista() {
    const carritoContainer = document.getElementById('carritoVenta');
    const totalElement = document.getElementById('totalVenta');
    
    if (!carritoContainer) return;
    
    // Si el carrito está vacío
    if (carritoVenta.length === 0) {
        carritoContainer.innerHTML = '<p class="text-center" style="color: #666;">No hay productos en el carrito</p>';
        if (totalElement) totalElement.textContent = '$0';
        return;
    }
    
    // Generar HTML del carrito
    let html = '<div class="carrito-items">';
    let total = 0;
    
    carritoVenta.forEach((item, index) => {
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
    carritoVenta.splice(index, 1);
    actualizarCarritoVista();
    showAlert('Producto eliminado del carrito', 'info');
}

// ============================================
// 💾 REGISTRAR VENTA
// ============================================

/**
 * Procesa y registra una nueva venta
 * Valida datos, envía al servidor y actualiza la vista
 */
async function registrarVenta(event) {
    event.preventDefault();
    
    const selectCliente = document.getElementById('cliente');
    const clienteId = selectCliente.value;
    
    // Validar que se haya seleccionado un cliente
    if (!clienteId) {
        showAlert('Por favor seleccione un cliente', 'warning');
        return;
    }
    
    // Validar que haya productos en el carrito
    if (carritoVenta.length === 0) {
        showAlert('Por favor agregue al menos un producto a la venta', 'warning');
        return;
    }
    
    // Preparar datos para enviar
    const formData = new FormData();
    formData.append('cliente', clienteId);
    formData.append('productos', JSON.stringify(carritoVenta));
    
    try {
        // Enviar datos al servidor
        const response = await fetch('php/ventas.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Venta registrada exitosamente', 'success');
            
            // Limpiar formulario y carrito
            selectCliente.value = '';
            carritoVenta = [];
            actualizarCarritoVista();
            
            // Recargar listas
            loadVentas();
            loadProductos(); // Recargar para actualizar stock
            
        } else {
            showAlert(result.message || 'Error al registrar la venta', 'danger');
        }
        
    } catch (error) {
        showAlert('Error al procesar la venta', 'danger');
        console.error('Error:', error);
    }
}

// ============================================
// 👁️ VER DETALLES DE VENTA
// ============================================

/**
 * Muestra los detalles completos de una venta en un modal
 * @param {number} ventaId - ID de la venta a mostrar
 */
async function verDetalleVenta(ventaId) {
    try {
        const response = await fetch('php/ventas.php');
        const ventas = await response.json();
        
        const venta = ventas.find(v => v.id == ventaId);
        
        if (!venta) {
            showAlert('Venta no encontrada', 'danger');
            return;
        }
        
        // Crear modal de detalles
        mostrarModalFactura(venta);
        
    } catch (error) {
        showAlert('Error al cargar los detalles de la venta', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Muestra un modal con la factura de la venta
 * @param {Object} venta - Objeto con datos de la venta
 */
function mostrarModalFactura(venta) {
    // Crear el modal si no existe
    let modal = document.getElementById('modalFactura');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalFactura';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Formatear fecha
    const fecha = new Date(venta.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-CO') + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    // Contenido de la factura
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2><i class="fas fa-file-invoice"></i> Factura de Venta #${venta.id}</h2>
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
                        <p><strong>Cliente:</strong> ${venta.cliente_nombre || 'No especificado'}</p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    </div>
                    <div style="text-align: right;">
                        <h3 style="color: var(--primary-green); margin-bottom: 10px;">Detalles de la Venta</h3>
                        <p><strong>Factura #:</strong> ${venta.id}</p>
                        <p><strong>Productos:</strong> ${venta.productos || 'N/A'}</p>
                    </div>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--primary-green); margin-bottom: 15px;">Productos</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        ${venta.productos || 'Sin detalles de productos'}
                    </div>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                
                <div style="text-align: right; font-size: 1.2rem;">
                    <p style="margin: 10px 0;"><strong>Total: </strong> <span style="font-size: 1.5rem; color: var(--primary-green);">$${parseFloat(venta.total || 0).toLocaleString('es-CO')}</span></p>
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
 * Inicializa el módulo de ventas al cargar la página
 * Carga datos y configura event listeners
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de ventas
    if (document.getElementById('ventasTable')) {
        loadClientes();
        loadProductos();
        loadVentas();
    }
    
    // Manejar el formulario de venta
    const ventaForm = document.getElementById('ventaForm');
    if (ventaForm) {
        ventaForm.addEventListener('submit', registrarVenta);
    }
    
    // Botón para agregar producto al carrito
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', agregarProductoCarrito);
    }
});

