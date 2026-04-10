const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getApiOrigin(apiUrl) {
    try {
        return new URL(apiUrl, window.location.origin).origin;
    } catch {
        return apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    }
}

const API_ORIGIN = getApiOrigin(API_URL);

async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
        throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
}

export const api = {
    getHealth: () => request('/health'),
    loginUser: (username, password) =>
        request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),
    getProducts: () => request('/products'),
    createProduct: (payload) =>
        request('/products', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    updateProduct: (id, payload) =>
        request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    deleteProduct: (id) =>
        request(`/products/${id}`, {
            method: 'DELETE'
        }),
    uploadProductImage: async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/products/${id}/image`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
            throw new Error(data.message || `Error ${response.status}`);
        }

        return data;
    },
    getSuppliers: () => request('/suppliers'),
    createSupplier: (payload) =>
        request('/suppliers', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    createSale: (payload) =>
        request('/sales', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    getTodaySalesSummary: () => request('/sales/today-summary'),
    createPurchase: (payload) =>
        request('/purchases', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    getSupplierVisits: (params = {}) => {
        const query = new URLSearchParams();
        if (params.from) query.set('from', params.from);
        if (params.to) query.set('to', params.to);
        const suffix = query.toString() ? `?${query.toString()}` : '';
        return request(`/supplier-visits${suffix}`);
    },
    createSupplierVisit: (payload) =>
        request('/supplier-visits', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    updateSupplierVisit: (id, payload) =>
        request(`/supplier-visits/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    deleteSupplierVisit: (id) =>
        request(`/supplier-visits/${id}`, {
            method: 'DELETE'
        })
};

export function toMediaUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

    let normalizedPath = `${imagePath}`.trim().replace(/\\+/g, '/');

    // Soporta cuando sólo se guardó el nombre del archivo
    if (!normalizedPath.includes('/') && /\.(png|jpg|jpeg|webp|gif|avif|svg)$/i.test(normalizedPath)) {
        normalizedPath = `/media/products/${normalizedPath}`;
    }

    // Soporta rutas guardadas como "media/products/x.jpg" o "/media/products/x.jpg"
    if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`;
    }

    // Si por error quedó una ruta absoluta del sistema, intentamos mapearla a /media
    const mediaSegment = '/media/';
    const mediaIndex = normalizedPath.lastIndexOf(mediaSegment);
    if (mediaIndex > 0) {
        normalizedPath = normalizedPath.slice(mediaIndex);
    }

    return `${API_ORIGIN}${normalizedPath}`;
}
