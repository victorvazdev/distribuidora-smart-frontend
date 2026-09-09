import { fetchApi, getOpenFoodFacts } from './api.js';
import { renderTable, toggleModal, populateEditModal } from './ui.js';

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', loadProducts);
document.getElementById('add-form').addEventListener('submit', addProduct);
document.getElementById('update-form').addEventListener('submit', updateProduct);

// Fecha modal clicando fora
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) toggleModal(false);
});

// --- Exposição de funções para os botões do HTML ---
window.loadProducts = loadProducts;
window.searchProducts = searchProducts;
window.searchById = searchById;
window.searchByBarcode = searchByBarcode;
window.deleteProduct = deleteProduct;
window.fetchProductData = fetchProductData;
window.editProduct = populateEditModal;
window.cancelUpdate = () => toggleModal(false);

// --- Lógica de Negócio ---

async function loadProducts() {
    try {
        const data = await fetchApi('/products');
        renderTable(data.products || []);
    } catch (err) {
        alert('Erro ao carregar produtos.');
    }
}

async function searchProducts() {
    const term = document.getElementById('search-text').value;
    if (!term) return loadProducts();
    const data = await fetchApi(`/product/search?name=${term}&barcode=${term}`);
    renderTable(data.products || []);
}

async function searchById() {
    const id = document.getElementById('search-id').value;
    if (!id) return loadProducts();
    try {
        const product = await fetchApi(`/product?id=${id}`);
        renderTable([product]);
    } catch {
        alert('Produto não encontrado pelo ID.');
        renderTable([]);
    }
}

async function searchByBarcode() {
    const barcode = document.getElementById('search-exact-barcode').value;
    if (!barcode) return loadProducts();
    try {
        const product = await fetchApi(`/product/barcode?barcode=${barcode}`);
        renderTable([product]);
    } catch {
        alert('Produto não encontrado.');
        renderTable([]);
    }
}

async function addProduct(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('add-name').value);
    formData.append('barcode', document.getElementById('add-barcode').value);
    formData.append('quantity', document.getElementById('add-quantity').value);
    formData.append('value', document.getElementById('add-value').value);
    
    const imageUrl = document.getElementById('add-image-url').value;
    if (imageUrl) formData.append('image_url', imageUrl);

    try {
        await fetchApi('/product', { method: 'POST', body: formData });
        document.getElementById('add-form').reset();
        loadProducts();
    } catch (err) {
        alert(err.message || 'Erro ao adicionar.');
    }
}

async function updateProduct(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', document.getElementById('update-id').value);
    
    const name = document.getElementById('update-name').value;
    const imageUrl = document.getElementById('update-image-url').value;
    const quantity = document.getElementById('update-quantity').value;
    const value = document.getElementById('update-value').value;

    if (name) formData.append('name', name);
    // Se o campo da imageUrl estiver vazio, é porque a imagem foi retirada.
    formData.append('image_url', imageUrl);
    if (quantity) formData.append('quantity', quantity);
    if (value) formData.append('value', value);

    try {
        await fetchApi('/update_product', { method: 'PUT', body: formData });
        toggleModal(false);
        loadProducts();
    } catch (err) {
        alert(err.message || 'Erro ao atualizar.');
    }
}

async function deleteProduct(id) {
    if (!confirm(`Tem certeza que deseja deletar o ID ${id}?`)) return;
    try {
        await fetchApi(`/product?id=${id}`, { method: 'DELETE' });
        loadProducts();
    } catch (err) {
        alert(err.message || 'Erro ao deletar.');
    }
}

async function fetchProductData(mode) {
    const barcode = document.getElementById(`${mode}-barcode`).value.trim();
    if (!barcode) return alert('Insira o código de barras primeiro.');

    const nameInput = document.getElementById(`${mode}-name`);
    const imageInput = document.getElementById(`${mode}-image-url`);
    const originalPlaceholder = nameInput.placeholder;
    nameInput.placeholder = "Buscando...";

    try {
        const data = await getOpenFoodFacts(barcode);
        if (data.status === 1 && data.product) {
            nameInput.value = data.product.product_name_pt || data.product.product_name || nameInput.value;
            if (imageInput) {
                imageInput.value = data.product.image_url || data.product.image_front_url || imageInput.value;
            }
        }
    } catch (error) {
        console.error(`${error}: Produto não encontrado.`);
        if (error.message == 'not_found') {
            alert('Produto não localizado na base pública.');
        } else {
            alert('Erro de comunicação com o OpenFoodFacts.');
        }
    } finally {
        nameInput.placeholder = originalPlaceholder;
    }
}