const API_URL = 'http://localhost:8000';

export async function fetchApi(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    if (!res.ok) throw await res.json().catch(() => ({ message: 'Erro de rede' }));
    return res.json();
}

export async function getOpenFoodFacts(barcode) {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!res.ok) throw new Error(res.status === 404 ? 'not_found' : 'error');
    return res.json();
}
