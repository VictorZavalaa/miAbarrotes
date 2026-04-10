import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import PageHeader from './components/PageHeader';
import TopBar from './components/TopBar';
import DashboardSection from './operations/DashboardSection';
import ProductsSection from './operations/ProductsSection';
import SalesSection from './operations/SalesSection';
import PurchasesSection from './operations/PurchasesSection';
import { money } from './utils';
import { errorToast, promptCashPayment, showCashChangeAlert, successToast, warningToast } from './utils/alerts';

const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📅', hint: 'Agenda y pagos próximos' },
    { id: 'products', label: 'Productos', icon: '📦', hint: 'Catálogo e inventario' },
    { id: 'sales', label: 'Venta rápida', icon: '💳', hint: 'Caja y tickets' },
    { id: 'purchases', label: 'Recepción proveedor', icon: '🚚', hint: 'Entradas de mercancía' }
];

const CASH_TRACKER_KEY = 'dashboard-cash-tracker';

const EMPTY_SUPPLIER_FORM = {
    name: '',
    contact_name: '',
    phone: '',
    visit_days: [],
    visit_frequency: 'WEEKLY'
};

function toPositiveNumber(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
}

export default function App() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('ui-theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierVisits, setSupplierVisits] = useState([]);
    const [todaySalesSummary, setTodaySalesSummary] = useState({ total: 0, sales_count: 0 });
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const raw = localStorage.getItem('session-user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [status, setStatus] = useState('Cargando datos...');
    const [error, setError] = useState('');
    const [lastRefreshAt, setLastRefreshAt] = useState(null);

    const [productForm, setProductForm] = useState({
        name: '',
        brand: '',
        barcode: '',
        category: '',
        sale_mode: 'UNIT',
        base_unit: 'piece',
        presentation_value: '',
        presentation_unit: 'g',
        sale_price: '',
        cost_price: '',
        stock: 0,
        min_stock: 0
    });

    const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER_FORM);

    const [saleForm, setSaleForm] = useState({
        payment_method: 'CASH',
        items: []
    });

    async function loadAll() {
        setError('');
        setStatus('Cargando catálogo...');

        try {
            const [productsResponse, suppliersResponse, visitsResponse, salesSummaryResponse] = await Promise.all([
                api.getProducts(),
                api.getSuppliers(),
                api.getSupplierVisits(),
                api.getTodaySalesSummary()
            ]);

            setProducts(productsResponse.data || []);
            setSuppliers(suppliersResponse.data || []);
            setSupplierVisits(visitsResponse.data || []);
            setTodaySalesSummary(salesSummaryResponse.data || { total: 0, sales_count: 0 });
            setStatus('Datos actualizados.');
            setLastRefreshAt(new Date());
        } catch (err) {
            setError(err.message);
            setStatus('Error al cargar. Revisa backend o DB.');
            errorToast(err.message || 'No se pudo cargar el catálogo.');
        }
    }

    function applySaleToCashTracker(paymentMethod, totalAmount) {
        const safeTotal = toPositiveNumber(totalAmount);
        if (safeTotal <= 0) return;

        const method = String(paymentMethod || '').toUpperCase();
        const goesToCash = method === 'CASH';
        const goesToTerminal = method === 'CARD' || method === 'TRANSFER';

        if (!goesToCash && !goesToTerminal) return;

        let current = { cash: '', terminal: '' };
        try {
            const raw = localStorage.getItem(CASH_TRACKER_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                current = {
                    cash: parsed?.cash ?? '',
                    terminal: parsed?.terminal ?? ''
                };
            }
        } catch {
            current = { cash: '', terminal: '' };
        }

        const currentCash = toPositiveNumber(current.cash);
        const currentTerminal = toPositiveNumber(current.terminal);

        const nextCash = goesToCash ? currentCash + safeTotal : currentCash;
        const nextTerminal = goesToTerminal ? currentTerminal + safeTotal : currentTerminal;

        localStorage.setItem(
            CASH_TRACKER_KEY,
            JSON.stringify({
                cash: String(nextCash),
                terminal: String(nextTerminal)
            })
        );
    }

    useEffect(() => {
        if (!currentUser) {
            setStatus('Inicia sesión para entrar al sistema.');
            return;
        }

        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(() => {
        document.body.dataset.theme = theme;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('ui-theme', theme);
    }, [theme]);

    const dashboardMetrics = useMemo(() => {
        const lowStock = products.filter(
            (item) => Number(item.min_stock || 0) > 0 && Number(item.stock || 0) <= Number(item.min_stock || 0)
        ).length;

        const activeProducts = products.filter((item) => Number(item.is_active ?? 1) === 1).length;

        return {
            products: products.length,
            activeProducts,
            suppliers: suppliers.length,
            lowStock
        };
    }, [products, suppliers]);

    function handleToggleTheme() {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    }

    async function handleLoginUser() {
        const username = String(loginUsername || '').trim();
        const password = String(loginPassword || '');
        if (!username || !password) {
            warningToast('Escribe usuario y contraseña para continuar.');
            return;
        }

        try {
            const response = await api.loginUser(username, password);
            const user = response.data;
            setCurrentUser(user);
            localStorage.setItem('session-user', JSON.stringify(user));
            setStatus(`Sesión iniciada como ${user.username}.`);
            successToast(`Bienvenido ${user.username}`);
            setLoginPassword('');
        } catch (error) {
            setError(error.message);
            errorToast(error.message || 'No se pudo iniciar sesión.');
        }
    }

    function handleSwitchUser() {
        setCurrentUser(null);
        localStorage.removeItem('session-user');
        setLoginUsername('');
        setLoginPassword('');
        setStatus('Selecciona un usuario para continuar.');
    }

    async function submitProduct(_event, imageFile = null) {
        setError('');

        try {
            const createResult = await api.createProduct({
                ...productForm,
                presentation_value:
                    productForm.presentation_value === '' || productForm.presentation_value == null
                        ? null
                        : Number(productForm.presentation_value),
                presentation_unit:
                    productForm.presentation_value === '' || productForm.presentation_value == null
                        ? null
                        : productForm.presentation_unit,
                sale_price: Number(productForm.sale_price),
                cost_price: productForm.cost_price ? Number(productForm.cost_price) : null,
                stock: Number(productForm.stock),
                min_stock: Number(productForm.min_stock)
            });

            if (imageFile && createResult?.id) {
                await api.uploadProductImage(createResult.id, imageFile);
            }

            setProductForm({
                name: '',
                brand: '',
                barcode: '',
                category: '',
                sale_mode: 'UNIT',
                base_unit: 'piece',
                presentation_value: '',
                presentation_unit: 'g',
                sale_price: '',
                cost_price: '',
                stock: 0,
                min_stock: 0
            });

            await loadAll();
            setStatus(
                imageFile
                    ? 'Producto agregado con imagen.'
                    : 'Producto agregado.'
            );
            successToast(
                imageFile
                    ? 'Producto agregado con imagen.'
                    : 'Producto agregado.'
            );
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo agregar el producto.');
            throw err;
        }
    }

    async function submitProductEdit(productId, editedForm) {
        setError('');

        try {
            await api.updateProduct(productId, {
                ...editedForm,
                presentation_value:
                    editedForm.presentation_value === '' || editedForm.presentation_value == null
                        ? null
                        : Number(editedForm.presentation_value),
                presentation_unit:
                    editedForm.presentation_value === '' || editedForm.presentation_value == null
                        ? null
                        : editedForm.presentation_unit,
                sale_price: Number(editedForm.sale_price),
                cost_price: editedForm.cost_price ? Number(editedForm.cost_price) : null,
                stock: Number(editedForm.stock),
                min_stock: Number(editedForm.min_stock),
                is_active: Number(editedForm.is_active ?? 1)
            });

            await loadAll();
            setStatus(`Producto #${productId} actualizado.`);
            successToast(`Producto #${productId} actualizado.`);
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo actualizar el producto.');
            throw err;
        }
    }

    async function submitProductDelete(productId) {
        setError('');

        try {
            await api.deleteProduct(productId);
            await loadAll();
            setStatus(`Producto #${productId} eliminado.`);
            successToast(`Producto #${productId} eliminado.`);
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo eliminar el producto.');
            throw err;
        }
    }

    async function submitProductImage(productId, file) {
        setError('');

        try {
            await api.uploadProductImage(productId, file);
            await loadAll();
            setStatus(`Imagen actualizada para producto #${productId}.`);
            successToast(`Imagen actualizada para producto #${productId}.`);
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo actualizar la imagen.');
            throw err;
        }
    }

    async function submitBulkProducts(entries) {
        setError('');

        try {
            if (!Array.isArray(entries) || entries.length === 0) {
                setError('No hay productos escaneados para procesar.');
                warningToast('No hay productos escaneados para procesar.');
                return;
            }

            let createdCount = 0;
            let updatedCount = 0;

            for (const entry of entries) {
                const quantity = Number(entry.quantity || 0);
                if (quantity <= 0) continue;

                if (entry.type === 'existing') {
                    const product = entry.product;
                    if (!product?.id) continue;

                    await api.updateProduct(product.id, {
                        name: product.name,
                        brand: product.brand || '',
                        barcode: product.barcode || '',
                        category: product.category || '',
                        sale_mode: product.sale_mode === 'WEIGHT' ? 'WEIGHT' : 'UNIT',
                        base_unit: product.sale_mode === 'WEIGHT' ? 'kg' : (product.base_unit || 'piece'),
                        presentation_value:
                            product.presentation_value === '' || product.presentation_value == null
                                ? null
                                : Number(product.presentation_value),
                        presentation_unit:
                            product.presentation_value === '' || product.presentation_value == null
                                ? null
                                : product.presentation_unit,
                        sale_price: Number(product.sale_price || 0),
                        cost_price: product.cost_price == null || product.cost_price === ''
                            ? null
                            : Number(product.cost_price),
                        stock: Number(product.stock || 0) + quantity,
                        min_stock: Number(product.min_stock || 0),
                        is_active: Number(product.is_active ?? 1)
                    });
                    updatedCount += 1;
                    continue;
                }

                if (entry.type === 'new') {
                    const draft = entry.draft || {};
                    await api.createProduct({
                        name: (draft.name || '').trim(),
                        brand: (draft.brand || '').trim(),
                        barcode: (entry.barcode || '').trim(),
                        category: (draft.category || '').trim(),
                        sale_mode: draft.sale_mode === 'WEIGHT' ? 'WEIGHT' : 'UNIT',
                        base_unit: draft.sale_mode === 'WEIGHT' ? 'kg' : 'piece',
                        presentation_value:
                            draft.presentation_value === '' || draft.presentation_value == null
                                ? null
                                : Number(draft.presentation_value),
                        presentation_unit:
                            draft.presentation_value === '' || draft.presentation_value == null
                                ? null
                                : draft.presentation_unit,
                        sale_price: Number(draft.sale_price || 0),
                        cost_price: draft.cost_price === '' || draft.cost_price == null
                            ? null
                            : Number(draft.cost_price),
                        stock: quantity,
                        min_stock: Number(draft.min_stock || 0)
                    });
                    createdCount += 1;
                }
            }

            await loadAll();
            setStatus(`Carga masiva completada: ${updatedCount} actualizados · ${createdCount} creados.`);
            successToast(`Carga masiva completada: ${updatedCount} actualizados · ${createdCount} creados.`);
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo completar la carga masiva.');
            throw err;
        }
    }

    async function submitSupplier(event) {
        event.preventDefault();
        setError('');

        try {
            await api.createSupplier(supplierForm);
            setSupplierForm(EMPTY_SUPPLIER_FORM);
            await loadAll();
            setStatus('Proveedor agregado.');
            successToast('Proveedor agregado.');
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo agregar el proveedor.');
        }
    }

    async function submitSale(event) {
        event.preventDefault();
        setError('');

        try {
            const normalizedItems = Array.isArray(saleForm.items)
                ? saleForm.items
                    .filter((item) => Number(item.quantity || 0) > 0)
                    .map((item) => ({
                        product_id: Number(item.product_id),
                        quantity: Number(item.quantity),
                        unit_price: Number(item.unit_price || 0)
                    }))
                : [];

            const saleItems = normalizedItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            if (saleItems.length === 0) {
                setError('Agrega al menos un producto al carrito para registrar la venta.');
                return;
            }

            const estimatedTotal = normalizedItems.reduce(
                (acc, item) => acc + Number(item.unit_price || 0) * Number(item.quantity || 0),
                0
            );

            let cashPayment = null;
            if (saleForm.payment_method === 'CASH') {
                cashPayment = await promptCashPayment(estimatedTotal);
                if (!cashPayment) {
                    setStatus('Venta cancelada antes de registrar.');
                    return;
                }
            }

            const payload = {
                payment_method: saleForm.payment_method,
                items: saleItems,
                user_id: currentUser?.id || null
            };

            const response = await api.createSale(payload);
            applySaleToCashTracker(saleForm.payment_method, response.total);
            await loadAll();
            setSaleForm((prev) => ({ ...prev, items: [] }));
            if (cashPayment) {
                const changeAmount = Math.max(0, Number(cashPayment.received || 0) - Number(response.total || 0));
                setStatus(
                    `Venta registrada. Folio #${response.sale_id}, total ${money(response.total)} · Recibido ${money(cashPayment.received)} · Cambio ${money(changeAmount)}`
                );
                await showCashChangeAlert({
                    saleId: response.sale_id,
                    totalAmount: response.total,
                    receivedAmount: cashPayment.received,
                    changeAmount
                });
            } else {
                setStatus(`Venta registrada. Folio #${response.sale_id}, total ${money(response.total)}`);
                successToast(`Venta registrada. Folio #${response.sale_id}`);
            }
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo registrar la venta.');
        }
    }

    async function createSupplierVisit(payload) {
        setError('');
        try {
            await api.createSupplierVisit(payload);
            await loadAll();
            setStatus('Visita de proveedor registrada en agenda.');
            successToast('Visita de proveedor registrada en agenda.');
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo registrar la visita.');
            throw err;
        }
    }

    async function updateSupplierVisit(visitId, payload) {
        setError('');
        try {
            await api.updateSupplierVisit(visitId, payload);
            await loadAll();
            setStatus('Agenda actualizada.');
            successToast('Agenda actualizada.');
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo actualizar la agenda.');
            throw err;
        }
    }

    async function deleteSupplierVisit(visitId) {
        setError('');
        try {
            await api.deleteSupplierVisit(visitId);
            await loadAll();
            setStatus('Visita eliminada de agenda.');
            successToast('Visita eliminada de agenda.');
        } catch (err) {
            setError(err.message);
            errorToast(err.message || 'No se pudo eliminar la visita.');
            throw err;
        }
    }

    return (
        <div className="app-page">
            <header className="app-frame app-frame-top" aria-hidden="true" />

            <div className="app-shell">
                <PageHeader />

                {!currentUser ? (
                    <section className="login-page-section" aria-label="Acceso al sistema">
                        <article className="login-page-card">
                            <div className="login-page-head">
                                <p className="eyebrow">Acceso seguro</p>
                                <h2>Iniciar sesión</h2>
                                <p>Ingresa tu usuario y contraseña para entrar al sistema de caja.</p>
                            </div>

                            <div className="form-grid login-form-grid">
                                <div className="field-with-label">
                                    <label className="field-label">Usuario</label>
                                    <input
                                        value={loginUsername}
                                        onChange={(event) => setLoginUsername(event.target.value)}
                                        placeholder="Escribe tu usuario"
                                        autoFocus
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                handleLoginUser();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="field-with-label">
                                    <label className="field-label">Contraseña</label>
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(event) => setLoginPassword(event.target.value)}
                                        placeholder="Escribe tu contraseña"
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                handleLoginUser();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="login-page-actions">
                                <button type="button" onClick={handleLoginUser}>Entrar</button>
                            </div>
                        </article>
                    </section>
                ) : (
                    <>
                        <nav className="tabs" aria-label="Secciones operativas">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={activeTab === tab.id ? 'tab active' : 'tab'}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                >
                                    <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                                    <span>
                                        <strong>{tab.label}</strong>
                                        <small>{tab.hint}</small>
                                    </span>
                                </button>
                            ))}
                        </nav>

                        <TopBar
                            status={status}
                            onRefresh={() => currentUser && loadAll()}
                            lastRefreshAt={lastRefreshAt}
                            theme={theme}
                            onToggleTheme={handleToggleTheme}
                            currentUser={currentUser}
                            onSwitchUser={handleSwitchUser}
                        />

                        <section className="kpi-strip" aria-label="Indicadores de operación">
                            <article className="kpi-card tone-blue">
                                <span>Productos</span>
                                <strong>{dashboardMetrics.products}</strong>
                                <small>{dashboardMetrics.activeProducts} activos</small>
                            </article>
                            <article className="kpi-card tone-violet">
                                <span>Proveedores</span>
                                <strong>{dashboardMetrics.suppliers}</strong>
                                <small>Catálogo de abastecimiento</small>
                            </article>
                            <article className="kpi-card tone-amber">
                                <span>Bajo stock</span>
                                <strong>{dashboardMetrics.lowStock}</strong>
                                <small>Revisar reposición</small>
                            </article>
                        </section>

                        {error && <p className="error">{error}</p>}

                        {activeTab === 'dashboard' && (
                            <DashboardSection
                                suppliers={suppliers}
                                visits={supplierVisits}
                                todaySalesSummary={todaySalesSummary}
                                onCreateVisit={createSupplierVisit}
                                onUpdateVisit={updateSupplierVisit}
                                onDeleteVisit={deleteSupplierVisit}
                            />
                        )}

                        {activeTab === 'products' && (
                            <ProductsSection
                                products={products}
                                form={productForm}
                                setForm={setProductForm}
                                onSubmit={submitProduct}
                                onUpdateProduct={submitProductEdit}
                                onDeleteProduct={submitProductDelete}
                                onUploadProductImage={submitProductImage}
                                onBulkImportProducts={submitBulkProducts}
                            />
                        )}

                        {activeTab === 'sales' && (
                            <SalesSection
                                products={products}
                                form={saleForm}
                                setForm={setSaleForm}
                                onSubmit={submitSale}
                            />
                        )}

                        {activeTab === 'purchases' && (
                            <PurchasesSection
                                suppliers={suppliers}
                                supplierForm={supplierForm}
                                setSupplierForm={setSupplierForm}
                                onSubmitSupplier={submitSupplier}
                            />
                        )}
                    </>
                )}
            </div>

            <footer className="app-frame app-frame-bottom" aria-hidden="true" />
        </div>
    );
}
