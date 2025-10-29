// TEST SIMPLE - Búsqueda de productos
alert('productos_test.js cargado!');

function buscarProductos() {
    alert('Función buscarProductos ejecutada');
    
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        alert('ERROR: No se encontró searchInput');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    alert('Buscando: "' + searchTerm + '"');
    
    const productCards = document.querySelectorAll('.product-card');
    alert('Total productos encontrados: ' + productCards.length);
    
    let visibleCount = 0;
    
    productCards.forEach(function(card) {
        const productName = card.querySelector('.product-name');
        if (!productName) {
            alert('ERROR: No se encontró .product-name en una tarjeta');
            return;
        }
        
        const nombre = productName.textContent.toLowerCase().trim();
        
        if (searchTerm === '' || nombre === searchTerm) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    alert('Productos visibles: ' + visibleCount);
}

// Agregar evento cuando cargue el DOM
window.addEventListener('load', function() {
    alert('Window load event - Configurando búsqueda');
    
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (searchButton) {
        searchButton.onclick = buscarProductos;
        alert('Evento onclick agregado al botón');
    } else {
        alert('ERROR: No se encontró searchButton');
    }
    
    if (searchInput) {
        searchInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                buscarProductos();
            }
        };
        alert('Evento onkeypress agregado al input');
    } else {
        alert('ERROR: No se encontró searchInput');
    }
});

