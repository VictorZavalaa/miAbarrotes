import { useEffect, useMemo, useRef, useState } from 'react';
import { money } from '../utils';
import { toMediaUrl } from '../api';
import { confirmDanger } from '../utils/alerts';

const PRODUCTS_PER_PAGE = 50;
const PRESENTATION_UNITS = ['g', 'kg', 'ml', 'L', 'oz', 'lb'];

const EMPTY_FORM = {
    name: '',
    brand: '',
    category: '',
    sale_mode: 'UNIT',
    base_unit: 'piece',
    presentation_value: '',
    presentation_unit: 'g',
    sale_price: '',
    cost_price: '',
    stock: 0,
    min_stock: 0
};

export default function ProductsSection({
    products,
    form,
    setForm,
    onSubmit,
    onUpdateProduct,
    onDeleteProduct,
    onUploadProductImage,
    onBulkImportProducts
}) {
    const [query, setQuery] = useState('');
    const [scanFeedback, setScanFeedback] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedBrand, setSelectedBrand] = useState('ALL');
    const [isCreateBrandSuggestOpen, setIsCreateBrandSuggestOpen] = useState(false);
    const [isEditBrandSuggestOpen, setIsEditBrandSuggestOpen] = useState(false);
    const [isCreateCategorySuggestOpen, setIsCreateCategorySuggestOpen] = useState(false);
    const [isEditCategorySuggestOpen, setIsEditCategorySuggestOpen] = useState(false);
    const [catalogView, setCatalogView] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [createImageFile, setCreateImageFile] = useState(null);
    const [createImagePreviewUrl, setCreateImagePreviewUrl] = useState('');
    const [isCreateImageModalOpen, setIsCreateImageModalOpen] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [createProductType, setCreateProductType] = useState(form.sale_mode || 'UNIT');
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editProductType, setEditProductType] = useState('UNIT');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreviewUrl, setEditImagePreviewUrl] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState(null);
    const [uploadingProductId, setUploadingProductId] = useState(null);
    const [isBulkScanOpen, setIsBulkScanOpen] = useState(false);
    const [bulkScanCode, setBulkScanCode] = useState('');
    const [bulkItems, setBulkItems] = useState([]);
    const [bulkFeedback, setBulkFeedback] = useState(null);
    const [isBulkSaving, setIsBulkSaving] = useState(false);
    const createImageInputRef = useRef(null);
    const bulkScanInputRef = useRef(null);

    function formatWeightStock(stockValue) {
        const numericStock = Number(stockValue ?? 0);
        if (!Number.isFinite(numericStock)) return '0kg';

        const normalizedStock = Math.max(0, numericStock);
        const formatKg = (value) => {
            if (Number.isInteger(value)) return String(value);
            return value.toLocaleString('es', { maximumFractionDigits: 2 });
        };

        if (normalizedStock < 1000) {
            return `${formatKg(normalizedStock)}kg`;
        }

        const kiloUnits = Math.floor(normalizedStock / 1000);
        const remainder = normalizedStock - kiloUnits * 1000;

        if (remainder === 0) {
            return `${kiloUnits}K`;
        }

        return `${kiloUnits}K ${formatKg(remainder)}kg`;
    }

    function createMissingDraft(barcode = '') {
        return {
            name: '',
            brand: '',
            category: '',
            sale_mode: 'UNIT',
            presentation_value: '',
            presentation_unit: 'g',
            sale_price: '',
            cost_price: '',
            min_stock: 0,
            barcode
        };
    }

    function formatPresentation(value, unit) {
        if (value == null || value === '') return '';
        const numericValue = Number(value);
        const formattedValue = Number.isFinite(numericValue)
            ? (Number.isInteger(numericValue)
                ? String(numericValue)
                : numericValue.toLocaleString('es', { maximumFractionDigits: 3 }))
            : String(value);

        const safeUnit = (unit || '').trim();
        return safeUnit ? `${formattedValue} ${safeUnit}` : formattedValue;
    }

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalUnits = products.reduce((acc, item) => {
            if (item.sale_mode === 'WEIGHT') return acc;
            return acc + Number(item.stock || 0);
        }, 0);
        const lowStock = products.filter(
            (item) => Number(item.min_stock || 0) > 0 && Number(item.stock || 0) <= Number(item.min_stock || 0)
        ).length;

        return { totalProducts, totalUnits, lowStock };
    }, [products]);

    const filteredProducts = useMemo(() => {
        const text = query.trim().toLowerCase();
        const categoryFilter = selectedCategory;
        const brandFilter = selectedBrand;

        return products.filter((product) => {
            const haystack = [
                product.name,
                product.brand,
                product.category,
                product.barcode,
                formatPresentation(product.presentation_value, product.presentation_unit)
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesText = !text || haystack.includes(text);
            const matchesCategory =
                categoryFilter === 'ALL' || (product.category || 'Sin categoría') === categoryFilter;
            const matchesBrand = brandFilter === 'ALL' || (product.brand || 'Sin marca') === brandFilter;

            return matchesText && matchesCategory && matchesBrand;
        });
    }, [products, query, selectedCategory, selectedBrand]);

    const categoryOptions = useMemo(() => {
        const set = new Set(products.map((item) => item.category || 'Sin categoría'));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }, [products]);

    const brandOptions = useMemo(() => {
        const set = new Set(products.map((item) => item.brand || 'Sin marca'));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }, [products]);

    const selectableBrandOptions = useMemo(
        () => brandOptions.filter((brand) => brand && brand !== 'Sin marca'),
        [brandOptions]
    );

    const selectableCategoryOptions = useMemo(
        () => categoryOptions.filter((category) => category && category !== 'Sin categoría'),
        [categoryOptions]
    );

    const createBrandSuggestions = useMemo(() => {
        const text = (form.brand || '').trim().toLowerCase();
        return selectableBrandOptions
            .filter((brand) => !text || brand.toLowerCase().includes(text))
            .slice(0, 8);
    }, [form.brand, selectableBrandOptions]);

    const editBrandSuggestions = useMemo(() => {
        const text = (editForm?.brand || '').trim().toLowerCase();
        return selectableBrandOptions
            .filter((brand) => !text || brand.toLowerCase().includes(text))
            .slice(0, 8);
    }, [editForm?.brand, selectableBrandOptions]);

    const createCategorySuggestions = useMemo(() => {
        const text = (form.category || '').trim().toLowerCase();
        return selectableCategoryOptions
            .filter((category) => !text || category.toLowerCase().includes(text))
            .slice(0, 8);
    }, [form.category, selectableCategoryOptions]);

    const editCategorySuggestions = useMemo(() => {
        const text = (editForm?.category || '').trim().toLowerCase();
        return selectableCategoryOptions
            .filter((category) => !text || category.toLowerCase().includes(text))
            .slice(0, 8);
    }, [editForm?.category, selectableCategoryOptions]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)),
        [filteredProducts.length]
    );

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const visibleRange = useMemo(() => {
        if (filteredProducts.length === 0) {
            return { start: 0, end: 0 };
        }

        const start = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
        const end = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);
        return { start, end };
    }, [filteredProducts.length, currentPage]);

    useEffect(() => {
        if (!createImageFile) {
            setCreateImagePreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(createImageFile);
        setCreateImagePreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [createImageFile]);

    useEffect(() => {
        if (!editImageFile) {
            setEditImagePreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(editImageFile);
        setEditImagePreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [editImageFile]);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, selectedCategory, selectedBrand]);

    useEffect(() => {
        if (!query.trim()) {
            setScanFeedback(null);
        }
    }, [query]);

    useEffect(() => {
        setCreateProductType(form.sale_mode === 'WEIGHT' ? 'WEIGHT' : 'UNIT');
    }, [form.sale_mode]);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    useEffect(() => {
        if (!isBulkScanOpen) return;
        setTimeout(() => {
            bulkScanInputRef.current?.focus();
        }, 0);
    }, [isBulkScanOpen]);

    function openEditModal(product) {
        const detectedType = product.sale_mode === 'WEIGHT' ? 'WEIGHT' : 'UNIT';
        setEditProductType(detectedType);
        setEditingProduct(product);
        setEditImageFile(null);
        setEditForm({
            name: product.name || '',
            brand: product.brand || '',
            barcode: product.barcode || '',
            category: product.category || '',
            sale_mode: detectedType,
            base_unit: detectedType === 'WEIGHT' ? 'kg' : (product.base_unit || 'piece'),
            presentation_value: product.presentation_value ?? '',
            presentation_unit: product.presentation_unit || 'g',
            sale_price: product.sale_price ?? '',
            cost_price: product.cost_price ?? '',
            stock: product.stock ?? 0,
            min_stock: product.min_stock ?? 0,
            is_active: Number(product.is_active ?? 1)
        });
    }

    function closeEditModal() {
        setEditingProduct(null);
        setEditForm(null);
        setEditImageFile(null);
        setEditProductType('UNIT');
    }

    function applyCreateType(type) {
        const nextType = type === 'WEIGHT' ? 'WEIGHT' : 'UNIT';
        setCreateProductType(nextType);
        setForm({
            ...form,
            sale_mode: nextType,
            base_unit: nextType === 'WEIGHT' ? 'kg' : 'piece'
        });
    }

    function applyEditType(type) {
        if (!editForm) return;
        const nextType = type === 'WEIGHT' ? 'WEIGHT' : 'UNIT';
        setEditProductType(nextType);
        setEditForm({
            ...editForm,
            sale_mode: nextType,
            base_unit: nextType === 'WEIGHT' ? 'kg' : 'piece'
        });
    }

    function handleEditImageChange(event) {
        const file = event.target.files?.[0] || null;
        setEditImageFile(file);
    }

    function handleSelectCreateBrand(brand) {
        setForm({ ...form, brand });
        setIsCreateBrandSuggestOpen(false);
    }

    function handleSelectEditBrand(brand) {
        if (!editForm) return;
        setEditForm({ ...editForm, brand });
        setIsEditBrandSuggestOpen(false);
    }

    function handleSelectCreateCategory(category) {
        setForm({ ...form, category });
        setIsCreateCategorySuggestOpen(false);
    }

    function handleSelectEditCategory(category) {
        if (!editForm) return;
        setEditForm({ ...editForm, category });
        setIsEditCategorySuggestOpen(false);
    }

    async function handleSubmitEdit(event) {
        event.preventDefault();

        if (!editingProduct || !editForm) return;

        try {
            setIsSavingEdit(true);
            await onUpdateProduct(editingProduct.id, editForm);

            if (editImageFile) {
                await onUploadProductImage(editingProduct.id, editImageFile);
            }

            closeEditModal();
        } finally {
            setIsSavingEdit(false);
        }
    }

    async function handleDeleteProduct(product) {
        const confirmed = await confirmDanger({
            title: `¿Eliminar "${product.name}"?`,
            text: 'Esta acción no se puede deshacer.',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmed) return;

        try {
            setDeletingProductId(product.id);
            await onDeleteProduct(product.id);
        } finally {
            setDeletingProductId(null);
        }
    }

    function handleCreateImageChange(event) {
        const file = event.target.files?.[0] || null;
        setCreateImageFile(file);
        setIsCreateImageModalOpen(false);
    }

    function handleCreateImageDrop(event) {
        event.preventDefault();
        setIsDragActive(false);

        const file = event.dataTransfer?.files?.[0] || null;
        if (!file) return;
        if (!file.type.startsWith('image/')) return;

        setCreateImageFile(file);
        setIsCreateImageModalOpen(false);
    }

    function handleCreateImageDragOver(event) {
        event.preventDefault();
        if (!isDragActive) setIsDragActive(true);
    }

    function handleCreateImageDragLeave(event) {
        event.preventDefault();
        setIsDragActive(false);
    }

    function clearCreateImageSelection() {
        setCreateImageFile(null);
        if (createImageInputRef.current) {
            createImageInputRef.current.value = '';
        }
    }

    async function handleCreateSubmit(event) {
        event.preventDefault();
        await onSubmit(event, createImageFile);
        setCreateImageFile(null);
        if (createImageInputRef.current) {
            createImageInputRef.current.value = '';
        }
    }

    async function handleUploadImage(product, event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingProductId(product.id);
            await onUploadProductImage(product.id, file);
        } finally {
            setUploadingProductId(null);
            event.target.value = '';
        }
    }

    function handleSearchKeyDown(event) {
        if (event.key !== 'Enter') return;

        const scannedCode = query.trim();
        if (!scannedCode) return;

        const productByBarcode = products.find(
            (item) => (item.barcode || '').trim().toLowerCase() === scannedCode.toLowerCase()
        );

        if (productByBarcode) {
            openEditModal(productByBarcode);
            setScanFeedback({
                type: 'success',
                message: `Código detectado: producto "${productByBarcode.name}" listo para editar.`
            });
        } else {
            setScanFeedback({
                type: 'warning',
                message: 'No se encontró un producto con ese código de barras.'
            });
        }
    }

    function openBulkScanModal() {
        setIsBulkScanOpen(true);
        setBulkFeedback(null);
        setBulkScanCode('');
    }

    function closeBulkScanModal() {
        if (isBulkSaving) return;
        setIsBulkScanOpen(false);
        setBulkScanCode('');
        setBulkFeedback(null);
    }

    function resetBulkSession() {
        setBulkItems([]);
        setBulkScanCode('');
        setBulkFeedback(null);
        setTimeout(() => bulkScanInputRef.current?.focus(), 0);
    }

    function registerBulkScan(code) {
        const scannedCode = (code || '').trim();
        if (!scannedCode) return;

        setBulkItems((prev) => {
            const index = prev.findIndex(
                (entry) => (entry.barcode || '').trim().toLowerCase() === scannedCode.toLowerCase()
            );

            if (index >= 0) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    quantity: Number(updated[index].quantity || 0) + 1
                };
                return updated;
            }

            const matchedProduct = products.find(
                (item) => (item.barcode || '').trim().toLowerCase() === scannedCode.toLowerCase()
            );

            if (matchedProduct) {
                setBulkFeedback({
                    type: 'success',
                    message: `Escaneado: ${matchedProduct.name} (+1)`
                });

                return [
                    ...prev,
                    {
                        barcode: scannedCode,
                        quantity: 1,
                        type: 'existing',
                        product: matchedProduct
                    }
                ];
            }

            setBulkFeedback({
                type: 'warning',
                message: `No existe ${scannedCode}. Completa datos para crearlo.`
            });

            return [
                ...prev,
                {
                    barcode: scannedCode,
                    quantity: 1,
                    type: 'new',
                    draft: createMissingDraft(scannedCode)
                }
            ];
        });

        setBulkScanCode('');
    }

    function handleBulkScanKeyDown(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        registerBulkScan(bulkScanCode);
    }

    function updateBulkQuantity(barcode, quantity) {
        setBulkItems((prev) =>
            prev.map((item) => {
                if (item.barcode !== barcode) return item;
                return {
                    ...item,
                    quantity: Math.max(1, Number(quantity || 1))
                };
            })
        );
    }

    function removeBulkItem(barcode) {
        setBulkItems((prev) => prev.filter((item) => item.barcode !== barcode));
    }

    function updateMissingDraft(barcode, patch) {
        setBulkItems((prev) =>
            prev.map((item) => {
                if (item.barcode !== barcode || item.type !== 'new') return item;
                return {
                    ...item,
                    draft: {
                        ...item.draft,
                        ...patch
                    }
                };
            })
        );
    }

    async function handleBulkFinalize() {
        if (!onBulkImportProducts || bulkItems.length === 0) return;

        const invalidMissingItem = bulkItems.find((item) => {
            if (item.type !== 'new') return false;
            return !(item.draft?.name || '').trim() || Number(item.draft?.sale_price) <= 0;
        });

        if (invalidMissingItem) {
            setBulkFeedback({
                type: 'warning',
                message: `Completa nombre y precio para el código ${invalidMissingItem.barcode}.`
            });
            return;
        }

        try {
            setIsBulkSaving(true);
            await onBulkImportProducts(bulkItems);
            setBulkFeedback({ type: 'success', message: 'Carga masiva aplicada correctamente.' });
            setBulkItems([]);
            setBulkScanCode('');
            setIsBulkScanOpen(false);
        } catch (error) {
            setBulkFeedback({
                type: 'warning',
                message: error?.message || 'No se pudo finalizar la carga masiva.'
            });
        } finally {
            setIsBulkSaving(false);
        }
    }

    const isCreateWeightProduct = createProductType === 'WEIGHT';
    const isEditWeightProduct = editProductType === 'WEIGHT';

    return (
        <section className="operation-card">
            <div className="card-title-row">
                <h2>Productos</h2>
                <p>Alta y consulta de inventario</p>
            </div>

            <div className="stats-grid">
                <article className="stat-card">
                    <span>Total productos</span>
                    <strong>{stats.totalProducts}</strong>
                </article>
                <article className="stat-card">
                    <span>Unidades en inventario</span>
                    <strong>{stats.totalUnits}</strong>
                </article>
                <article className="stat-card">
                    <span>Bajo stock</span>
                    <strong>{stats.lowStock}</strong>
                </article>
            </div>

            <section className="create-product-card">
                <div className="create-product-header">
                    <h3>Crear producto</h3>
                    <p>
                        Captura la información básica, precios e inventario inicial.
                        {isCreateWeightProduct ? ' Modo kileado activo (por kg).' : ' Modo normal activo (por pieza).'}
                    </p>

                    <div className="massive-import-trigger">
                        <button type="button" className="secondary" onClick={openBulkScanModal}>
                            Agregar masivamente por escáner
                        </button>
                    </div>

                    <div className="product-type-toggle" role="group" aria-label="Tipo de creación de producto">
                        <button
                            type="button"
                            className={createProductType === 'UNIT' ? 'secondary small-btn active' : 'secondary small-btn'}
                            onClick={() => applyCreateType('UNIT')}
                        >
                            Normal
                        </button>
                        <button
                            type="button"
                            className={createProductType === 'WEIGHT' ? 'secondary small-btn active' : 'secondary small-btn'}
                            onClick={() => applyCreateType('WEIGHT')}
                        >
                            Kileado
                        </button>
                    </div>
                </div>

                <form className="create-product-form" onSubmit={handleCreateSubmit}>
                    <div className="form-section">
                        <h4>Información general</h4>
                        <div className="form-grid">
                            <div className="field-with-label">
                                <label className="field-label">Nombre del producto</label>
                                <input
                                    placeholder="Nombre"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field-with-label">
                                <label className="field-label">Marca</label>
                                <div className="suggestion-field">
                                    <input
                                        placeholder="Marca"
                                        value={form.brand}
                                        onFocus={() => setIsCreateBrandSuggestOpen(true)}
                                        onBlur={() => setTimeout(() => setIsCreateBrandSuggestOpen(false), 120)}
                                        onChange={(e) => {
                                            setForm({ ...form, brand: e.target.value });
                                            setIsCreateBrandSuggestOpen(true);
                                        }}
                                    />
                                    {isCreateBrandSuggestOpen && createBrandSuggestions.length > 0 && (
                                        <div className="suggestion-list" role="listbox" aria-label="Sugerencias de marca">
                                            {createBrandSuggestions.map((brand) => (
                                                <button
                                                    key={brand}
                                                    type="button"
                                                    className="suggestion-item"
                                                    onMouseDown={() => handleSelectCreateBrand(brand)}
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="field-with-label">
                                <label className="field-label">Categoría</label>
                                <div className="suggestion-field">
                                    <input
                                        placeholder="Categoría"
                                        value={form.category}
                                        onFocus={() => setIsCreateCategorySuggestOpen(true)}
                                        onBlur={() => setTimeout(() => setIsCreateCategorySuggestOpen(false), 120)}
                                        onChange={(e) => {
                                            setForm({ ...form, category: e.target.value });
                                            setIsCreateCategorySuggestOpen(true);
                                        }}
                                    />
                                    {isCreateCategorySuggestOpen && createCategorySuggestions.length > 0 && (
                                        <div className="suggestion-list" role="listbox" aria-label="Sugerencias de categoría">
                                            {createCategorySuggestions.map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    className="suggestion-item"
                                                    onMouseDown={() => handleSelectCreateCategory(category)}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="field-with-label">
                                <label className="field-label">Presentación (opcional)</label>
                                <div className="presentation-inline-fields">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        placeholder="Cantidad"
                                        value={form.presentation_value}
                                        onChange={(e) => setForm({ ...form, presentation_value: e.target.value })}
                                    />
                                    <select
                                        value={form.presentation_unit || 'g'}
                                        onChange={(e) => setForm({ ...form, presentation_unit: e.target.value })}
                                    >
                                        {PRESENTATION_UNITS.map((unit) => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section two-columns">
                        <div>
                            <h4>Precios</h4>
                            <div className="form-grid form-grid--compact">
                                <div className="field-with-label">
                                    <label className="field-label">
                                        {isCreateWeightProduct ? 'Precio de venta por kg' : 'Precio de venta'}
                                    </label>
                                    <input
                                        placeholder={isCreateWeightProduct ? 'Precio por kg' : 'Precio venta'}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.sale_price}
                                        onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field-with-label">
                                    <label className="field-label">{isCreateWeightProduct ? 'Costo por kg' : 'Costo'}</label>
                                    <input
                                        placeholder={isCreateWeightProduct ? 'Costo por kg' : 'Costo'}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.cost_price}
                                        onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4>Inventario</h4>
                            <div className="form-grid form-grid--compact">
                                <div className="field-with-label">
                                    <label className="field-label">
                                        {isCreateWeightProduct ? 'Stock inicial (kg)' : 'Stock inicial'}
                                    </label>
                                    <input
                                        placeholder={isCreateWeightProduct ? 'Stock inicial en kg' : 'Stock inicial'}
                                        type="number"
                                        min="0"
                                        step={isCreateWeightProduct ? '0.001' : '1'}
                                        value={form.stock}
                                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    />
                                </div>
                                <div className="field-with-label">
                                    <label className="field-label">
                                        {isCreateWeightProduct ? 'Stock mínimo (kg)' : 'Stock mínimo'}
                                    </label>
                                    <input
                                        placeholder={isCreateWeightProduct ? 'Stock mínimo en kg' : 'Stock mínimo'}
                                        type="number"
                                        min="0"
                                        step={isCreateWeightProduct ? '0.001' : '1'}
                                        value={form.min_stock}
                                        onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Imagen</h4>
                        <div className="image-section-row">
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setIsCreateImageModalOpen(true)}
                            >
                                {createImageFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                            </button>

                            {createImageFile ? (
                                <>
                                    <span className="image-file-name">{createImageFile.name}</span>
                                    <button
                                        type="button"
                                        className="secondary small-btn"
                                        onClick={clearCreateImageSelection}
                                    >
                                        Quitar
                                    </button>
                                </>
                            ) : (
                                <span className="image-file-name muted">Sin imagen seleccionada</span>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit">Guardar producto</button>
                        <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                                setForm(EMPTY_FORM);
                                setCreateProductType('UNIT');
                                clearCreateImageSelection();
                            }}
                        >
                            Limpiar formulario
                        </button>
                    </div>
                </form>
            </section>

            <div className="product-preview">
                <p className="preview-title">Vista previa</p>
                <p>
                    <strong>{form.name || 'Nuevo producto'}</strong>
                    {form.brand ? ` · ${form.brand}` : ''}
                    {formatPresentation(form.presentation_value, form.presentation_unit)
                        ? ` · ${formatPresentation(form.presentation_value, form.presentation_unit)}`
                        : ''}
                </p>
                <p>
                    Precio: <strong>{money(form.sale_price || 0)}</strong> · Stock inicial:{' '}
                    <strong>{Number(form.stock || 0)}</strong>{isCreateWeightProduct ? ' kg' : ''}
                </p>
                {createImageFile && (
                    <>
                        <p>
                            Imagen lista: <strong>{createImageFile.name}</strong>
                        </p>
                        {createImagePreviewUrl && (
                            <div className="create-image-preview-box">
                                <img
                                    src={createImagePreviewUrl}
                                    alt={`Vista previa de ${createImageFile.name}`}
                                    className="create-image-preview"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="catalog-section">
                <div className="catalog-header">
                    <div className="catalog-header-info">
                        <h3>Catálogo de productos</h3>
                        <p>Consulta, filtra y administra el inventario registrado.</p>
                    </div>

                    <div className="view-toggle" role="group" aria-label="Cambiar vista del catálogo">
                        <button
                            type="button"
                            className={catalogView === 'list' ? 'secondary small-btn active' : 'secondary small-btn'}
                            onClick={() => setCatalogView('list')}
                        >
                            Lista
                        </button>
                        <button
                            type="button"
                            className={catalogView === 'grid' ? 'secondary small-btn active' : 'secondary small-btn'}
                            onClick={() => setCatalogView('grid')}
                        >
                            Rectángulos
                        </button>
                    </div>
                </div>

                <div className="products-toolbar">
                    <div className="search-field-block">
                        <label className="field-label">Buscador / Escáner de código de barras</label>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Busca por nombre, marca, categoría o escanea un código y presiona Enter"
                        />
                        {scanFeedback && (
                            <small className={scanFeedback.type === 'success' ? 'scan-feedback success' : 'scan-feedback'}>
                                {scanFeedback.message}
                            </small>
                        )}
                    </div>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="ALL">Todas las categorías</option>
                        {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                        <option value="ALL">Todas las marcas</option>
                        {brandOptions.map((brand) => (
                            <option key={brand} value={brand}>
                                {brand}
                            </option>
                        ))}
                    </select>
                    <small>
                        {filteredProducts.length} resultado(s) · mostrando {visibleRange.start}-{visibleRange.end}
                    </small>
                </div>

                {catalogView === 'list' ? (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Marca</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="empty-row">
                                            Sin coincidencias para tu búsqueda.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((product) => {
                                        const isLowStock =
                                            Number(product.min_stock || 0) > 0 &&
                                            Number(product.stock || 0) <= Number(product.min_stock || 0);

                                        return (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>
                                                    {product.image_url ? (
                                                        <img
                                                            src={toMediaUrl(product.image_url)}
                                                            alt={product.name}
                                                            className="product-thumb"
                                                        />
                                                    ) : (
                                                        <span className="thumb-placeholder">Sin foto</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="product-name-stack">
                                                        <strong>{product.name}</strong>
                                                        {formatPresentation(product.presentation_value, product.presentation_unit) && (
                                                            <small className="product-presentation">
                                                                {formatPresentation(product.presentation_value, product.presentation_unit)}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{product.brand || '-'}</td>
                                                <td>{product.category || '-'}</td>
                                                <td>
                                                    {money(product.sale_price)}
                                                    {product.sale_mode === 'WEIGHT' ? <small> / kg</small> : null}
                                                </td>
                                                <td>
                                                    <span className={isLowStock ? 'stock-pill low' : 'stock-pill'}>
                                                        {product.sale_mode === 'WEIGHT'
                                                            ? formatWeightStock(product.stock)
                                                            : product.stock}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="row-actions">
                                                        <button
                                                            type="button"
                                                            className="secondary small-btn"
                                                            onClick={() => openEditModal(product)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="danger small-btn"
                                                            onClick={() => handleDeleteProduct(product)}
                                                            disabled={deletingProductId === product.id}
                                                        >
                                                            {deletingProductId === product.id ? 'Eliminando...' : 'Eliminar'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-row catalog-empty">Sin coincidencias para tu búsqueda.</div>
                ) : (
                    <div className="products-grid">
                        {paginatedProducts.map((product) => {
                            const isLowStock =
                                Number(product.min_stock || 0) > 0 &&
                                Number(product.stock || 0) <= Number(product.min_stock || 0);

                            return (
                                <article className="product-card" key={product.id}>
                                    <div className="product-card-head">
                                        {product.image_url ? (
                                            <img
                                                src={toMediaUrl(product.image_url)}
                                                alt={product.name}
                                                className="product-thumb"
                                            />
                                        ) : (
                                            <span className="thumb-placeholder">Sin foto</span>
                                        )}
                                        <span className="product-card-id">#{product.id}</span>
                                    </div>

                                    <div className="product-card-body">
                                        <h4>{product.name}</h4>
                                        {formatPresentation(product.presentation_value, product.presentation_unit) && (
                                            <p className="product-presentation">
                                                {formatPresentation(product.presentation_value, product.presentation_unit)}
                                            </p>
                                        )}
                                        <p>{product.brand || 'Sin marca'}</p>
                                        <p>{product.category || 'Sin categoría'}</p>
                                    </div>

                                    <div className="product-card-foot">
                                        <strong>{money(product.sale_price)}{product.sale_mode === 'WEIGHT' ? ' / kg' : ''}</strong>
                                        <span className={isLowStock ? 'stock-pill low' : 'stock-pill'}>
                                            Stock: {product.sale_mode === 'WEIGHT'
                                                ? formatWeightStock(product.stock)
                                                : product.stock}
                                        </span>
                                    </div>

                                    <div className="row-actions product-card-actions">
                                        <button
                                            type="button"
                                            className="secondary small-btn"
                                            onClick={() => openEditModal(product)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="danger small-btn"
                                            onClick={() => handleDeleteProduct(product)}
                                            disabled={deletingProductId === product.id}
                                        >
                                            {deletingProductId === product.id ? 'Eliminando...' : 'Eliminar'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {filteredProducts.length > 0 && (
                    <div className="products-pagination">
                        <small>
                            Página {currentPage} de {totalPages}
                        </small>
                        <div className="products-pagination-actions">
                            <button
                                type="button"
                                className="secondary small-btn"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                className="secondary small-btn"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {editingProduct && editForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Editar producto">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Editar producto</h3>
                            <button type="button" className="secondary small-btn" onClick={closeEditModal}>
                                Cerrar
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmitEdit}>
                            <div className="product-type-toggle" role="group" aria-label="Tipo de producto en edición">
                                <button
                                    type="button"
                                    className={editProductType === 'UNIT' ? 'secondary small-btn active' : 'secondary small-btn'}
                                    onClick={() => applyEditType('UNIT')}
                                >
                                    Normal
                                </button>
                                <button
                                    type="button"
                                    className={editProductType === 'WEIGHT' ? 'secondary small-btn active' : 'secondary small-btn'}
                                    onClick={() => applyEditType('WEIGHT')}
                                >
                                    Kileado
                                </button>
                            </div>

                            <div className="form-grid">
                                <div className="field-with-label">
                                    <label className="field-label">Nombre del producto</label>
                                    <input
                                        placeholder="Nombre"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">Marca</label>
                                    <div className="suggestion-field">
                                        <input
                                            placeholder="Marca"
                                            value={editForm.brand}
                                            onFocus={() => setIsEditBrandSuggestOpen(true)}
                                            onBlur={() => setTimeout(() => setIsEditBrandSuggestOpen(false), 120)}
                                            onChange={(e) => {
                                                setEditForm({ ...editForm, brand: e.target.value });
                                                setIsEditBrandSuggestOpen(true);
                                            }}
                                        />
                                        {isEditBrandSuggestOpen && editBrandSuggestions.length > 0 && (
                                            <div className="suggestion-list" role="listbox" aria-label="Sugerencias de marca">
                                                {editBrandSuggestions.map((brand) => (
                                                    <button
                                                        key={brand}
                                                        type="button"
                                                        className="suggestion-item"
                                                        onMouseDown={() => handleSelectEditBrand(brand)}
                                                    >
                                                        {brand}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">Código de barras</label>
                                    <input
                                        placeholder="Código de barras"
                                        value={editForm.barcode}
                                        onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                                    />
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">Categoría</label>
                                    <div className="suggestion-field">
                                        <input
                                            placeholder="Categoría"
                                            value={editForm.category}
                                            onFocus={() => setIsEditCategorySuggestOpen(true)}
                                            onBlur={() => setTimeout(() => setIsEditCategorySuggestOpen(false), 120)}
                                            onChange={(e) => {
                                                setEditForm({ ...editForm, category: e.target.value });
                                                setIsEditCategorySuggestOpen(true);
                                            }}
                                        />
                                        {isEditCategorySuggestOpen && editCategorySuggestions.length > 0 && (
                                            <div className="suggestion-list" role="listbox" aria-label="Sugerencias de categoría">
                                                {editCategorySuggestions.map((category) => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        className="suggestion-item"
                                                        onMouseDown={() => handleSelectEditCategory(category)}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">Presentación (opcional)</label>
                                    <div className="presentation-inline-fields">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            placeholder="Cantidad"
                                            value={editForm.presentation_value ?? ''}
                                            onChange={(e) => setEditForm({ ...editForm, presentation_value: e.target.value })}
                                        />
                                        <select
                                            value={editForm.presentation_unit || 'g'}
                                            onChange={(e) => setEditForm({ ...editForm, presentation_unit: e.target.value })}
                                        >
                                            {PRESENTATION_UNITS.map((unit) => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">
                                        {isEditWeightProduct ? 'Precio de venta por kg' : 'Precio de venta'}
                                    </label>
                                    <input
                                        placeholder={isEditWeightProduct ? 'Precio por kg' : 'Precio venta'}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editForm.sale_price}
                                        onChange={(e) => setEditForm({ ...editForm, sale_price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">{isEditWeightProduct ? 'Costo por kg' : 'Costo'}</label>
                                    <input
                                        placeholder={isEditWeightProduct ? 'Costo por kg' : 'Costo'}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editForm.cost_price}
                                        onChange={(e) => setEditForm({ ...editForm, cost_price: e.target.value })}
                                    />
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">{isEditWeightProduct ? 'Stock (kg)' : 'Stock'}</label>
                                    <input
                                        placeholder={isEditWeightProduct ? 'Stock en kg' : 'Stock'}
                                        type="number"
                                        min="0"
                                        step={isEditWeightProduct ? '0.001' : '1'}
                                        value={editForm.stock}
                                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                    />
                                </div>

                                <div className="field-with-label">
                                    <label className="field-label">
                                        {isEditWeightProduct ? 'Stock mínimo (kg)' : 'Stock mínimo'}
                                    </label>
                                    <input
                                        placeholder={isEditWeightProduct ? 'Stock mínimo en kg' : 'Stock mínimo'}
                                        type="number"
                                        min="0"
                                        step={isEditWeightProduct ? '0.001' : '1'}
                                        value={editForm.min_stock}
                                        onChange={(e) => setEditForm({ ...editForm, min_stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="edit-image-panel">
                                <h4>Imagen del producto</h4>

                                <div className="edit-image-row">
                                    {editImagePreviewUrl ? (
                                        <img
                                            src={editImagePreviewUrl}
                                            alt={`Vista previa de ${editImageFile?.name || 'nueva imagen'}`}
                                            className="product-thumb"
                                        />
                                    ) : editingProduct.image_url ? (
                                        <img
                                            src={toMediaUrl(editingProduct.image_url)}
                                            alt={editingProduct.name}
                                            className="product-thumb"
                                        />
                                    ) : (
                                        <span className="thumb-placeholder">Sin foto</span>
                                    )}

                                    <div className="edit-image-actions">
                                        <label className="secondary small-btn upload-btn">
                                            {editImageFile ? 'Cambiar selección' : 'Elegir nueva imagen'}
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={handleEditImageChange}
                                                disabled={isSavingEdit}
                                            />
                                        </label>

                                        {editImageFile ? (
                                            <>
                                                <span className="image-file-name">{editImageFile.name}</span>
                                                <small className="helper-text">Vista previa de la nueva imagen</small>
                                                <button
                                                    type="button"
                                                    className="secondary small-btn"
                                                    disabled={isSavingEdit}
                                                    onClick={() => setEditImageFile(null)}
                                                >
                                                    Quitar
                                                </button>
                                            </>
                                        ) : (
                                            <small className="helper-text">
                                                Si seleccionas una imagen, reemplazará la actual al guardar.
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={isSavingEdit}>
                                    {isSavingEdit ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button
                                    type="button"
                                    className="secondary"
                                    disabled={isSavingEdit}
                                    onClick={closeEditModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBulkScanOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Carga masiva por escáner">
                    <div className="modal-card bulk-scan-modal">
                        <div className="modal-header">
                            <h3>Carga masiva por escáner</h3>
                            <button type="button" className="secondary small-btn" onClick={closeBulkScanModal}>
                                Cerrar
                            </button>
                        </div>

                        <div className="bulk-scan-controls">
                            <label className="field-label">Escanea código y presiona Enter</label>
                            <div className="bulk-scan-input-row">
                                <input
                                    ref={bulkScanInputRef}
                                    value={bulkScanCode}
                                    onChange={(event) => setBulkScanCode(event.target.value)}
                                    onKeyDown={handleBulkScanKeyDown}
                                    placeholder="Escanea aquí..."
                                />
                                <button type="button" className="secondary small-btn" onClick={() => registerBulkScan(bulkScanCode)}>
                                    Agregar
                                </button>
                                <button type="button" className="secondary small-btn" onClick={resetBulkSession}>
                                    Limpiar lista
                                </button>
                            </div>

                            {bulkFeedback && (
                                <small className={bulkFeedback.type === 'success' ? 'scan-feedback success' : 'scan-feedback'}>
                                    {bulkFeedback.message}
                                </small>
                            )}
                        </div>

                        {bulkItems.length === 0 ? (
                            <p className="bulk-empty">Aún no hay productos escaneados.</p>
                        ) : (
                            <div className="bulk-items-list">
                                {bulkItems.map((item) => (
                                    <article key={item.barcode} className="bulk-item-card">
                                        <div className="bulk-item-head">
                                            <div className="bulk-item-head-main">
                                                {item.type === 'existing' ? (
                                                    item.product?.image_url ? (
                                                        <img
                                                            src={toMediaUrl(item.product.image_url)}
                                                            alt={item.product?.name || 'Producto'}
                                                            className="product-thumb"
                                                        />
                                                    ) : (
                                                        <span className="thumb-placeholder">Sin foto</span>
                                                    )
                                                ) : null}

                                                <div>
                                                    <strong>{item.type === 'existing' ? item.product?.name : 'Producto nuevo'}</strong>
                                                    <p>Código: {item.barcode}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="danger small-btn"
                                                onClick={() => removeBulkItem(item.barcode)}
                                                disabled={isBulkSaving}
                                            >
                                                Quitar
                                            </button>
                                        </div>

                                        <div className="bulk-item-body">
                                            {item.type === 'existing' ? (
                                                <>
                                                    <p className="bulk-item-meta">
                                                        Existente · Stock actual {item.product?.stock ?? 0} · Stock nuevo estimado{' '}
                                                        {Number(item.product?.stock || 0) + Number(item.quantity || 0)}
                                                    </p>

                                                    <label className="field-with-label">
                                                        <span className="field-label">Cantidad</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={item.quantity}
                                                            onChange={(event) => updateBulkQuantity(item.barcode, event.target.value)}
                                                            disabled={isBulkSaving}
                                                        />
                                                    </label>
                                                </>
                                            ) : (
                                                <div className="bulk-new-product-fields">
                                                    <label className="field-with-label">
                                                        <span className="field-label">Cantidad</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={item.quantity}
                                                            onChange={(event) => updateBulkQuantity(item.barcode, event.target.value)}
                                                            disabled={isBulkSaving}
                                                        />
                                                    </label>

                                                    <p className="bulk-item-meta warning">No existe en catálogo: se creará al finalizar.</p>

                                                    <div className="form-grid form-grid--compact">
                                                        <div className="field-with-label">
                                                            <label className="field-label">Nombre *</label>
                                                            <input
                                                                value={item.draft?.name || ''}
                                                                onChange={(event) =>
                                                                    updateMissingDraft(item.barcode, { name: event.target.value })
                                                                }
                                                                placeholder="Nombre del producto"
                                                                disabled={isBulkSaving}
                                                            />
                                                        </div>

                                                        <div className="field-with-label">
                                                            <label className="field-label">Precio venta *</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.draft?.sale_price || ''}
                                                                onChange={(event) =>
                                                                    updateMissingDraft(item.barcode, { sale_price: event.target.value })
                                                                }
                                                                placeholder="Precio de venta"
                                                                disabled={isBulkSaving}
                                                            />
                                                        </div>

                                                        <div className="field-with-label">
                                                            <label className="field-label">Marca</label>
                                                            <input
                                                                value={item.draft?.brand || ''}
                                                                onChange={(event) =>
                                                                    updateMissingDraft(item.barcode, { brand: event.target.value })
                                                                }
                                                                placeholder="Marca"
                                                                disabled={isBulkSaving}
                                                            />
                                                        </div>

                                                        <div className="field-with-label">
                                                            <label className="field-label">Categoría</label>
                                                            <input
                                                                value={item.draft?.category || ''}
                                                                onChange={(event) =>
                                                                    updateMissingDraft(item.barcode, { category: event.target.value })
                                                                }
                                                                placeholder="Categoría"
                                                                disabled={isBulkSaving}
                                                            />
                                                        </div>

                                                        <div className="field-with-label">
                                                            <label className="field-label">Presentación</label>
                                                            <div className="presentation-inline-fields">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.001"
                                                                    value={item.draft?.presentation_value || ''}
                                                                    onChange={(event) =>
                                                                        updateMissingDraft(item.barcode, {
                                                                            presentation_value: event.target.value
                                                                        })
                                                                    }
                                                                    placeholder="Cantidad"
                                                                    disabled={isBulkSaving}
                                                                />
                                                                <select
                                                                    value={item.draft?.presentation_unit || 'g'}
                                                                    onChange={(event) =>
                                                                        updateMissingDraft(item.barcode, {
                                                                            presentation_unit: event.target.value
                                                                        })
                                                                    }
                                                                    disabled={isBulkSaving}
                                                                >
                                                                    {PRESENTATION_UNITS.map((unit) => (
                                                                        <option key={unit} value={unit}>{unit}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="field-with-label">
                                                            <label className="field-label">Tipo</label>
                                                            <select
                                                                value={item.draft?.sale_mode || 'UNIT'}
                                                                onChange={(event) =>
                                                                    updateMissingDraft(item.barcode, { sale_mode: event.target.value })
                                                                }
                                                                disabled={isBulkSaving}
                                                            >
                                                                <option value="UNIT">Normal</option>
                                                                <option value="WEIGHT">Kileado</option>
                                                            </select>
                                                        </div>

                                                        <div className="field-with-label">
                                                            <label className="field-label">Costo</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.draft?.cost_price || ''}
                                                                onChange={(event) =>
                                                                    updateMissingDraft(item.barcode, { cost_price: event.target.value })
                                                                }
                                                                placeholder="Costo"
                                                                disabled={isBulkSaving}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" onClick={handleBulkFinalize} disabled={isBulkSaving || bulkItems.length === 0}>
                                {isBulkSaving ? 'Guardando carga masiva...' : 'Finalizar carga masiva'}
                            </button>
                            <button type="button" className="secondary" onClick={closeBulkScanModal} disabled={isBulkSaving}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCreateImageModalOpen && (
                <div
                    className="modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Seleccionar imagen del producto"
                >
                    <div className="modal-card upload-modal-card">
                        <div className="modal-header">
                            <h3>Seleccionar imagen</h3>
                            <button
                                type="button"
                                className="secondary small-btn"
                                onClick={() => {
                                    setIsCreateImageModalOpen(false);
                                    setIsDragActive(false);
                                }}
                            >
                                Cerrar
                            </button>
                        </div>

                        <div
                            className={isDragActive ? 'drop-zone active' : 'drop-zone'}
                            onDrop={handleCreateImageDrop}
                            onDragOver={handleCreateImageDragOver}
                            onDragLeave={handleCreateImageDragLeave}
                        >
                            <p>Arrastra y suelta tu imagen aquí</p>
                            <small>JPG, PNG o WEBP · máximo 2MB</small>

                            <label className="upload-btn drop-zone-btn">
                                Elegir desde mis archivos
                                <input
                                    ref={createImageInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleCreateImageChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}
