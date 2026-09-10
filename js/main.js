import { fetchApi, getOpenFoodFacts } from './api.js';
import { renderTable, toggleModal, populateEditModal, renderPagination } from './ui.js';

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => loadProducts(1));
document.getElementById('add-form').addEventListener('submit', addProduct);
document.getElementById('update-form').addEventListener('submit', updateProduct);
document.getElementById('btn-popular-db').addEventListener('click', populateDatabase);

// --- Controle de Estado Global ---
let currentPage = 1;
let currentSearchTerm = '';
let currentMode = 'list'; // 'list' ou 'search'

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
window.changePage = changePage;
window.populateDatabase = populateDatabase;

// --- Lógica de Negócio ---

async function loadProducts(page = 1) {
    currentMode = 'list';
    currentPage = page;
    try {
        const data = await fetchApi(`/products?page=${page}&limit=10`);
        renderTable(data.products || []);
        renderPagination(data.current_page || 1, data.total_pages || 1);
    } catch (err) {
        alert('Erro ao carregar produtos.');
    }
}

async function searchProducts(page = 1) {
    const term = document.getElementById('search-text').value;
    
    // Se o campo estiver vazio, volta para a listagem normal
    if (!term) return loadProducts();
    
    currentMode = 'search';
    currentSearchTerm = term;
    currentPage = page;

    try {
        const data = await fetchApi(`/product/search?name=${term}&barcode=${term}&page=${page}&limit=10`);
        renderTable(data.products || []);
        renderPagination(data.current_page || 1, data.total_pages || 1);
    } catch (err) {
        alert('Erro ao realizar busca.');
    }
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (currentMode === 'list') {
        loadProducts(newPage);
    } else if (currentMode === 'search') {
        searchProducts(newPage);
    }
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
    formData.append('image_url', document.getElementById('add-image-url').value);
    formData.append('barcode', document.getElementById('add-barcode').value);
    formData.append('quantity', document.getElementById('add-quantity').value);
    formData.append('value', document.getElementById('add-value').value);

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


async function populateDatabase(e) {
    const botao = e.target;
    botao.disabled = true;
    botao.textContent = "Adicionando...";

    const produtosJSON = [
        { name: "Coca Cola Zero Açúcar - 2L", barcode: "7894900701517", value: 12.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/070/1517/front_pt.38.400.jpg"},
        { name: "Coca Cola Zero Açúcar – 350 ml", barcode: "7894900700015", value: 2.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/070/0015/front_pt.53.400.jpg"},
        { name: "AGUA MIN CRYSTAL S/GAS 500ML", barcode: "7894900530001", value: 1.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/053/0001/front_pt.30.400.jpg"},
        { name: "Coca-Cola Zero – 200 mL", barcode: "78933873", value: 1.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/000/007/893/3873/front_pt.23.400.jpg"},
        { name: "Crystal - sem gás", barcode: "7894900530032", value: 2.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/053/0032/front_pt.12.400.jpg"},
        { name: "Energy Ultra – Monster – 473 ml", barcode: "0070847022206", value: 12.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/007/084/702/2206/front_pt.4.400.jpg"},
        { name: "Refrigerante Coca Cola Garrafa 200ml", barcode: "78908901", value: 1.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/000/007/890/8901/front_pt.18.400.jpg"},
        { name: "Isotônico Mix De Frutas Fifa World Cup Qatar 2022 Powerade Squeeze 500ml – 500ml", barcode: "7894900504002", value: 1.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/050/4002/front_pt.22.400.jpg"},
        { name: "H2OH! limão 500ml", barcode: "7892840812423", value: 5.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/284/081/2423/front_pt.23.400.jpg"},
        { name: "Coca cola – 310ml", barcode: "7894900011159", value: 6.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/001/1159/front_en.15.400.jpg"},
        { name: "BEB GAS H2OH LIMONETO 1.5L", barcode: "7892840812874", value: 12.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/284/081/2874/front_fr.5.400.jpg"},
        { name: "Refrigerante Coca Cola Original Garrafa 2l", barcode: "7894900027013", value: 8.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/490/002/7013/front_pt.60.400.jpg"},
        { name: "Refrigerante De Cola Pepsi 2l", barcode: "7892840800000", value: 12.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/284/080/0000/front_pt.3.400.jpg"},
        { name: "H2O Limoneto", barcode: "7892840812850", value: 4.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/284/081/2850/front_pt.25.400.jpg"},
        { name: "guaraná antártica zero Wandinha", barcode: "7891991000727", value: 3.99, quantity: 12, image_url: "https://images.openfoodfacts.org/images/products/789/199/100/0727/front_pt.42.400.jpg"}
    ];

    let sucessos = 0;
    let falhas = 0;

    // Loop sequencial 
    for (const produto of produtosJSON) {
        try {
            // Converte os dados do array para FormData antes de enviar
            const formData = new FormData();
            formData.append('name', produto.name);
            formData.append('barcode', produto.barcode);
            formData.append('value', produto.value);
            formData.append('quantity', produto.quantity);
            formData.append('image_url', produto.image_url);

            // Utiliza o mesmo fetchApi que a função addProduct já usa
            await fetchApi('/product', { method: 'POST', body: formData });
            sucessos++;
            
        } catch (error) {
            falhas++;
            console.error(`Falha ao adicionar ${produto.name}:`, error);
        }
    }

    if (falhas > 0) {
        alert(`Processo concluído! Sucessos: ${sucessos} | Falhas: ${falhas}`);
    }
    
    // Restaura o botão e atualiza a tabela dinamicamente usando sua função nativa
    botao.disabled = false;
    botao.textContent = "Popular Banco de Dados";
    
    loadProducts(); // Atualiza os dados na tela!
}
