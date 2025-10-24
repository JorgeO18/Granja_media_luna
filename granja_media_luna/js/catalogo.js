// ============================================
// 📦 CATÁLOGO PÚBLICO DE PRODUCTOS
// ============================================
// Vista de solo lectura para usuarios sin login
// ============================================

/**
 * Carga productos desde la base de datos (solo lectura)
 */
async function loadCatalog() {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando catálogo...</p>
        </div>
    `;

    try {
        const res = await fetch("php/productos_crud.php");
        const productos = await res.json();

        grid.innerHTML = "";

        if (productos.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-egg-crack"></i>
                    <p>No hay productos disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        // Crear una card para cada producto (SIN botones de editar/eliminar)
        productos.forEach(prod => {
            // Clasificar stock
            let stockClass = "stock-high";
            let stockText = "Disponible";
            
            if (prod.stock < 50) {
                stockClass = "stock-low";
                stockText = "Bajo stock";
            } else if (prod.stock < 100) {
                stockClass = "stock-medium";
                stockText = "Limitado";
            }

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
                            <span class="product-detail-value">$${parseFloat(prod.precio).toLocaleString('es-CO')}</span>
                        </div>
                        <div class="product-detail">
                            <span class="product-detail-label">Disponibilidad:</span>
                            <span class="product-detail-value">${stockText}</span>
                        </div>
                    </div>
                    <div class="product-stock">
                        <span class="stock-badge ${stockClass}">
                            ${stockText}
                        </span>
                    </div>
                    <div class="product-actions" style="justify-content: center;">
                        <a href="https://wa.me/573001234567?text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(prod.nombre)}" 
                           target="_blank" 
                           class="btn btn-primary" 
                           style="width: 100%;">
                            <i class="fab fa-whatsapp"></i> Consultar Disponibilidad
                        </a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-triangle-exclamation"></i>
                <p>Error al cargar el catálogo.</p>
            </div>
        `;
        console.error("Error cargando catálogo:", error);
    }
}

/**
 * Filtra productos en el catálogo
 */
function filterProductsCatalog() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const typeValue = typeFilter ? typeFilter.value.toLowerCase() : '';
    
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productType = card.querySelector('.product-type').textContent.toLowerCase();
        
        const matchesSearch = productName.includes(searchTerm) || productType.includes(searchTerm);
        const matchesType = typeValue === '' || productType.includes(typeValue);
        
        if (matchesSearch && matchesType) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}



