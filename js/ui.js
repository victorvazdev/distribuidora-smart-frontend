export function renderTable(products) {
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        const imageTag = p.image_url 
            ? `<img src="${p.image_url}" class="product-thumb" alt="${p.name}">` 
            : `<div class="product-thumb" title="Sem imagem"></div>`;
        
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${imageTag}</td>
            <td>${p.name}</td>
            <td>${p.barcode}</td>
            <td>${p.quantity}</td>
            <td>R$ ${p.value.toFixed(2)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-warning" onclick="editProduct(${p.id}, '${p.name}', '${p.barcode}', ${p.quantity}, ${p.value}, '${p.image_url || ''}')">Editar</button>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})">Deletar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function toggleModal(show) {
    const modal = document.getElementById('edit-modal');
    show ? modal.classList.remove('hidden') : modal.classList.add('hidden');
    if (!show) document.getElementById('update-form').reset();
}

export function populateEditModal(id, name, barcode, quantity, value, imageUrl) {
    document.getElementById('edit-id-label').innerText = `#${id}`;
    document.getElementById('update-id').value = id;
    document.getElementById('update-name').value = name;
    document.getElementById('update-image-url').value = imageUrl;
    document.getElementById('update-barcode').value = barcode;
    document.getElementById('update-quantity').value = quantity;
    document.getElementById('update-value').value = value;
    toggleModal(true);
}