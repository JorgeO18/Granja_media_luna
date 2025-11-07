// 📋 Gestión de clientes
async function loadClientes() {
    const tbody = document.querySelector('#clientesTable tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando clientes...</td></tr>';

    try {
        const response = await fetch('php/clientes.php');
        const clientes = await response.json();

        tbody.innerHTML = '';

        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay clientes registrados</td></tr>';
            return;
        }

        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            
            // Verificar si el usuario es admin para mostrar los botones de edición/eliminación
            const isAdmin = window.isAdmin || false;
            const actionButtons = isAdmin ? `
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCliente(${cliente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            ` : '<td>-</td>';
            
            row.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono || 'N/A'}</td>
                <td>${cliente.correo || 'N/A'}</td>
                ${actionButtons}
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar clientes</td></tr>';
        console.error('Error cargando clientes:', error);
    }
}

// Función para agregar cliente
async function addCliente(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('php/clientes.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Cliente agregado exitosamente', 'success');
            event.target.reset();
            loadClientes(); // Recargar la lista
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('Error al agregar cliente', 'danger');
        console.error('Error:', error);
    }
}

// Función para eliminar cliente
async function deleteCliente(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        try {
            const response = await fetch('php/clientes.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${id}`
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('Cliente eliminado exitosamente', 'success');
                loadClientes(); // Recargar la lista
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            showAlert('Error al eliminar cliente', 'danger');
            console.error('Error:', error);
        }
    }
}

// ============================================
// ✏️ EDITAR CLIENTE
// ============================================

/**
 * Abre el modal de edición y carga los datos del cliente
 * @param {number} id - ID del cliente a editar
 */
async function editCliente(id) {
    try {
        // Obtener todos los clientes
        const response = await fetch('php/clientes.php');
        const clientes = await response.json();
        
        // Buscar el cliente específico
        const cliente = clientes.find(c => c.id == id);
        
        if (!cliente) {
            showAlert('Cliente no encontrado', 'danger');
            return;
        }
        
        // Llenar el formulario del modal con los datos del cliente
        document.getElementById('edit_cliente_id').value = cliente.id;
        document.getElementById('edit_cliente_nombre').value = cliente.nombre;
        document.getElementById('edit_cliente_telefono').value = cliente.telefono || '';
        document.getElementById('edit_cliente_correo').value = cliente.correo || '';
        
        // Mostrar el modal
        document.getElementById('modalEditarCliente').style.display = 'flex';
        
    } catch (error) {
        showAlert('Error al cargar los datos del cliente', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Cierra el modal de edición de cliente
 */
function cerrarModalEditarCliente() {
    document.getElementById('modalEditarCliente').style.display = 'none';
}

/**
 * Guarda los cambios del cliente editado
 * @param {Event} event - Evento del formulario
 */
async function guardarEdicionCliente(event) {
    event.preventDefault();
    
    // Obtener los datos del formulario
    const id = document.getElementById('edit_cliente_id').value;
    const nombre = document.getElementById('edit_cliente_nombre').value.trim();
    const telefono = document.getElementById('edit_cliente_telefono').value.trim();
    const correo = document.getElementById('edit_cliente_correo').value.trim();
    
    // Validar que los campos obligatorios no estén vacíos
    if (!nombre || !telefono) {
        showAlert('Por favor complete los campos obligatorios (Nombre y Teléfono)', 'warning');
        return;
    }
    
    try {
        // Enviar datos al servidor
        const response = await fetch('php/clientes.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}&nombre=${encodeURIComponent(nombre)}&telefono=${encodeURIComponent(telefono)}&correo=${encodeURIComponent(correo)}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Cliente actualizado exitosamente', 'success');
            cerrarModalEditarCliente();
            loadClientes(); // Recargar la lista de clientes
        } else {
            showAlert(result.message || 'Error al actualizar cliente', 'danger');
        }
        
    } catch (error) {
        showAlert('Error al procesar la solicitud', 'danger');
        console.error('Error:', error);
    }
}

// Cargar clientes al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('clientesTable')) {
        loadClientes();
    }
    
    // Manejar formulario de cliente
    const clienteForm = document.getElementById('clienteForm');
    if (clienteForm) {
        clienteForm.addEventListener('submit', addCliente);
    }
    
    // Manejar formulario de editar cliente
    const editClienteForm = document.getElementById('editarClienteForm');
    if (editClienteForm) {
        editClienteForm.addEventListener('submit', guardarEdicionCliente);
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('modalEditarCliente');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModalEditarCliente();
            }
        });
    }
});
