console.log('✅ Archivo productos.js cargado correctamente');

// 🔍 Filtrar productos por nombre
function filterProducts() {
    console.log('⚡ Función filterProducts() ejecutada');
    
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.error('❌ No se encontró el campo de búsqueda');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    // Debug: mostrar lo que estamos buscando
    console.log('========================================');
    console.log('🔍 Término de búsqueda:', `"${searchTerm}"`);
    console.log('📊 Total de productos:', productCards.length);
    
    productCards.forEach((card, index) => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase().trim() || '';
        
        // Debug: mostrar cada producto
        console.log(`\n📦 Producto ${index + 1}:`);
        console.log('   Nombre:', `"${productName}"`);
        console.log('   Buscando:', `"${searchTerm}"`);
        console.log('   ¿Son iguales?', productName === searchTerm);
        
        // Verificar si coincide con la búsqueda exacta por nombre
        const matchesSearch = searchTerm === '' || productName === searchTerm;
        
        // Mostrar u ocultar la tarjeta
        if (matchesSearch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`\n✅ Productos visibles: ${visibleCount}`);
    console.log('========================================\n');
    
    // Mostrar mensaje si no hay resultados
    const grid = document.getElementById('productsGrid');
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (visibleCount === 0 && productCards.length > 0 && searchTerm !== '') {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message no-products';
            noResultsMsg.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No se encontraron productos con el nombre "${searchInput.value}".</p>
            `;
            grid.appendChild(noResultsMsg);
        } else {
            noResultsMsg.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No se encontraron productos con el nombre "${searchInput.value}".</p>
            `;
        }
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}

// 📦 Cargar productos desde la base de datos
async function loadProducts() {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando productos...</p>
        </div>
    `;

    try {
        const res = await fetch("php/productos_crud.php");
        const productos = await res.json();

        grid.innerHTML = ""; // Limpiamos el grid

        if (productos.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-egg-crack"></i>
                    <p>No hay productos registrados.</p>
                </div>
            `;
            return;
        }

        // Crear una card para cada producto
        productos.forEach(prod => {
            // Clasificar stock
            let stockClass = "stock-high";
            if (prod.stock < 50) stockClass = "stock-low";
            else if (prod.stock < 100) stockClass = "stock-medium";

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-header">
                    <i class="fas fa-egg product-icon"></i>
                    <h3 class="product-name">${prod.nombre}</h3>
                    <p class="product-type">${prod.descripcion}</p>
                </div>
                <div class="product-body">
                    <div class="product-details">
                        <div class="product-detail">
                            <span class="product-detail-label">Precio:</span>
                            <span class="product-detail-value">$${parseFloat(prod.precio).toLocaleString()}</span>
                        </div>
                        <div class="product-detail">
                            <span class="product-detail-label">Stock:</span>
                            <span class="product-detail-value">${prod.stock}</span>
                        </div>
                    </div>
                    <div class="product-stock">
                        <span class="stock-badge ${stockClass}">
                            ${prod.stock > 100 ? "Disponible" : prod.stock > 50 ? "Limitado" : "Bajo stock"}
                        </span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editProduct(${prod.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${prod.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-triangle-exclamation"></i>
                <p>Error al cargar los productos.</p>
            </div>
        `;
        console.error("Error cargando productos:", error);
    }
}

// Función para eliminar producto
async function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            const response = await fetch('php/productos_crud.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${id}`
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('Producto eliminado exitosamente', 'success');
                loadProducts(); // Recargar la lista
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            showAlert('Error al eliminar producto', 'danger');
            console.error('Error:', error);
        }
    }
}

// ============================================
// ✏️ EDITAR PRODUCTO
// ============================================

/**
 * Abre el modal de edición y carga los datos del producto
 * @param {number} id - ID del producto a editar
 */
async function editProduct(id) {
    try {
        // Obtener todos los productos
        const response = await fetch('php/productos_crud.php');
        const productos = await response.json();
        
        // Buscar el producto específico
        const producto = productos.find(p => p.id == id);
        
        if (!producto) {
            showAlert('Producto no encontrado', 'danger');
            return;
        }
        
        // Llenar el formulario del modal con los datos del producto
        document.getElementById('edit_id').value = producto.id;
        document.getElementById('edit_nombre').value = producto.nombre;
        document.getElementById('edit_descripcion').value = producto.descripcion;
        document.getElementById('edit_precio').value = producto.precio;
        document.getElementById('edit_stock').value = producto.stock;
        
        // Mostrar el modal
        document.getElementById('modalEditarProducto').style.display = 'flex';
        
    } catch (error) {
        showAlert('Error al cargar los datos del producto', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Cierra el modal de edición
 */
function cerrarModalEditar() {
    document.getElementById('modalEditarProducto').style.display = 'none';
}

/**
 * Guarda los cambios del producto editado
 * @param {Event} event - Evento del formulario
 */
async function guardarEdicionProducto(event) {
    event.preventDefault();
    
    // Obtener los datos del formulario
    const id = document.getElementById('edit_id').value;
    const nombre = document.getElementById('edit_nombre').value;
    const descripcion = document.getElementById('edit_descripcion').value;
    const precio = document.getElementById('edit_precio').value;
    const stock = document.getElementById('edit_stock').value;
    
    // Validar que los campos no estén vacíos
    if (!nombre || !precio || !stock) {
        showAlert('Por favor complete todos los campos obligatorios', 'warning');
        return;
    }
    
    // Validar que precio y stock sean números positivos
    if (parseFloat(precio) <= 0) {
        showAlert('El precio debe ser mayor a 0', 'warning');
        return;
    }
    
    if (parseInt(stock) < 0) {
        showAlert('El stock no puede ser negativo', 'warning');
        return;
    }
    
    try {
        // Enviar datos al servidor
        const response = await fetch('php/productos_crud.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}&nombre=${encodeURIComponent(nombre)}&descripcion=${encodeURIComponent(descripcion)}&precio=${precio}&stock=${stock}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Producto actualizado exitosamente', 'success');
            cerrarModalEditar();
            loadProducts(); // Recargar la lista de productos
        } else {
            showAlert(result.message || 'Error al actualizar producto', 'danger');
        }
        
    } catch (error) {
        showAlert('Error al procesar la solicitud', 'danger');
        console.error('Error:', error);
    }
}

// 📝 Manejar el envío del formulario de productos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded - Página cargada');
    alert('Página cargada - JavaScript funcionando');
    
    const form = document.getElementById('productoForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evitar el envío tradicional del formulario
            
            // Recopilar los datos del formulario
            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombre').value);
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('precio', document.getElementById('precio').value);
            formData.append('stock', document.getElementById('stock').value);
            
            try {
                const response = await fetch('php/productos_crud.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('Producto agregado exitosamente', 'success');
                    form.reset(); // Limpiar el formulario
                    loadProducts(); // Recargar la lista de productos
                } else {
                    showAlert(result.message || 'Error al agregar producto', 'danger');
                }
            } catch (error) {
                showAlert('Error al procesar la solicitud', 'danger');
                console.error('Error:', error);
            }
        });
    }
    
    // Manejar el envío del formulario de editar producto
    const editForm = document.getElementById('editarProductoForm');
    if (editForm) {
        editForm.addEventListener('submit', guardarEdicionProducto);
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('modalEditarProducto');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModalEditar();
            }
        });
    }
    
    // Agregar eventos de búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    console.log('🔧 Configurando eventos de búsqueda...');
    console.log('   searchInput encontrado:', !!searchInput);
    console.log('   searchButton encontrado:', !!searchButton);
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log('🖱️ Botón de búsqueda clickeado');
            alert('Botón clickeado. Buscando: ' + searchInput.value);
            filterProducts();
        });
        console.log('✅ Evento click agregado al botón');
    } else {
        console.error('❌ No se encontró el botón de búsqueda');
        alert('ERROR: No se encontró el botón de búsqueda');
    }
    
    if (searchInput) {
        // Buscar al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            console.log('⌨️ Tecla presionada:', e.key);
            if (e.key === 'Enter') {
                console.log('↩️ Enter presionado, ejecutando búsqueda');
                filterProducts();
            }
        });
        console.log('✅ Evento keypress agregado al input');
    } else {
        console.error('❌ No se encontró el input de búsqueda');
    }
});
