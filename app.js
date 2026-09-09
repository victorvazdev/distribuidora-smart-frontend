const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', loadProducts);
document.getElementById('add-form').addEventListener('submit', addProduct);
document.getElementById('update-form').addEventListener('submit', updateProduct);

// --- Integração OpenFoodFacts ---

async function fetchProductData(mode) {
    const barcodeInput = document.getElementById(`${mode}-barcode`);
    const barcode = barcodeInput.value.trim();
    
    if (!barcode) {
        alert('Por favor, insira o código de barras antes de buscar.');
        return;
    }

    const nameInput = document.getElementById(`${mode}-name`);
    const imageInput = document.getElementById(`${mode}-image-url`);
    
    const originalPlaceholder = nameInput.placeholder;
    nameInput.placeholder = "Buscando...";

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status === 1 && data.product) {
                // Preenche o nome
                const productName = data.product.product_name_pt || data.product.product_name;
                if (productName) {
                    nameInput.value = productName;
                } else {
                    alert('Produto encontrado, mas sem nome cadastrado na base.');
                }

                // Preenche a imagem
                if (imageInput) {
                    const productImageUrl = data.product.image_url || data.product.image_front_url;
                    if (productImageUrl) {
                        imageInput.value = productImageUrl;
                    }
                }
            }
        } else if (response.status == 404) {
            alert('Produto não localizado na base do OpenFoodFacts.');
        } else {
            console.warn('Erro na resposta da API.');
            alert('Não foi possível realizar a consulta neste momento.');
        }
    } catch (error) {
        console.error('Erro ao consultar OpenFoodFacts:', error);
    } finally {
        nameInput.placeholder = originalPlaceholder;
    }
}

// --- Rotas GET ---

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        renderTable(data.products || []);
    } catch (error) {
        alert('Erro ao carregar produtos. Verifique se a API está rodando.');
    }
}

async function searchProducts() {
    const term = document.getElementById('search-text').value;
    if (!term) return loadProducts();
    
    const response = await fetch(`${API_URL}/product/search?name=${term}&barcode=${term}`);
    const data = await response.json();
    renderTable(data.products || []);
}

async function searchById() {
    const id = document.getElementById('search-id').value;
    if (!id) return loadProducts();
    
    const response = await fetch(`${API_URL}/product?id=${id}`);
    if (response.ok) {
        const product = await response.json();
        renderTable([product]);
    } else {
        alert('Produto não encontrado pelo ID.');
        renderTable([]);
    }
}

async function searchByBarcode() {
    const barcode = document.getElementById('search-exact-barcode').value;
    if (!barcode) return loadProducts();
    
    const response = await fetch(`${API_URL}/product/barcode?barcode=${barcode}`);
    if (response.ok) {
        const product = await response.json();
        renderTable([product]);
    } else {
        alert('Produto não encontrado pelo Código de Barras exato.');
        renderTable([]);
    }
}

// --- Rotas POST, PUT, DELETE ---

async function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('add-name').value;
    const barcode = document.getElementById('add-barcode').value;
    const imageUrl = document.getElementById('add-image-url').value;
    const quantity = document.getElementById('add-quantity').value;
    const value = document.getElementById('add-value').value;

    if (!name) return alert('Preencha o nome do produto!');
    if (/^[\d\s]+$/.test(name)) return alert('O nome do produto não pode ser composto apenas por números!');
    if (!barcode) return alert('Preencha o código de barras!');
    if (!quantity) return alert('Preencha a quantidade disponível no estoque!');
    if (!value) return alert('Preencha o valor em R$ do produto!');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('barcode', barcode);
    if (imageUrl) formData.append('image_url', imageUrl);
    formData.append('quantity', quantity);
    formData.append('value', value);

    const res = await fetch(`${API_URL}/product`, {
        method: 'POST',
        body: formData
    });

    if (res.ok) {
        document.getElementById('add-form').reset();
        loadProducts();
    } else {
        const err = await res.json();
        alert(err.message || 'Erro ao adicionar produto.');
    }
}

async function updateProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('update-id').value;
    const name = document.getElementById('update-name').value;
    //
    // Alteração de código de barras desativado
    //
    // const barcode = document.getElementById('update-barcode').value;
    //
    const imageUrl = document.getElementById('update-image-url').value;
    const quantity = document.getElementById('update-quantity').value;
    const value = document.getElementById('update-value').value;

    if (!id) return alert('Erro interno: ID do produto não selecionado para atualização.');

    const formData = new FormData();
    formData.append('id', id);
    
    if (name) formData.append('name', name);
    //
    // Alteração de código de barras desativado
    //
    // if (barcode) formData.append('barcode', barcode);
    //
    if (imageUrl) formData.append('image_url', imageUrl);
    if (quantity) formData.append('quantity', quantity);
    if (value) formData.append('value', value);

    const res = await fetch(`${API_URL}/update_product`, {
        method: 'PUT',
        body: formData
    });

    if (res.ok) {
        cancelUpdate();
        loadProducts();
    } else {
        const err = await res.json();
        alert(err.message || 'Erro ao atualizar produto.');
    }
}

async function deleteProduct(id) {
    if (!confirm(`Tem certeza que deseja deletar o produto ID ${id}?`)) return;

    const response = await fetch(`${API_URL}/product?id=${id}`, { method: 'DELETE' });
    const result = await response.json();
    
    if (response.ok) {
        loadProducts();
    } else {
        alert(result.message || 'Erro ao deletar produto.');
    }
}

// --- UI Helpers ---

function renderTable(products) {
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
            <td>${p.value.toFixed(2)}</td>
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

function editProduct(id, name, barcode, quantity, value, imageUrl) {
    document.getElementById('edit-modal').classList.remove('hidden');
    document.getElementById('edit-id-label').innerText = `#${id}`;
    
    document.getElementById('update-id').value = id;
    document.getElementById('update-name').value = name;
    document.getElementById('update-image-url').value = imageUrl;
    document.getElementById('update-barcode').value = barcode;
    document.getElementById('update-quantity').value = quantity;
    document.getElementById('update-value').value = value;
}

function cancelUpdate() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('update-form').reset();
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        cancelUpdate();
    }
});