import { useEffect, useMemo, useRef, useState } from 'react';
import { toMediaUrl } from '../api';
import { money } from '../utils';

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

export default function SalesSection({ products, form, setForm, onSubmit }) {
    const [query, setQuery] = useState('');
    const [feedback, setFeedback] = useState('');
    const [feedbackType, setFeedbackType] = useState('success');
    const [highlightedProductId, setHighlightedProductId] = useState(null);
    const searchInputRef = useRef(null);
    const lastScanRef = useRef({ barcode: '', at: 0 });

    useEffect(() => {
        const focusSearch = () => {
            searchInputRef.current?.focus();
        };

        const isEditableElement = (element) => {
            if (!element) return false;
            const tag = (element.tagName || '').toLowerCase();
            return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable;
        };

        const timer = setTimeout(focusSearch, 50);

        const handleWindowFocus = () => {
            if (!isEditableElement(document.activeElement)) {
                focusSearch();
            }
        };

        window.addEventListener('focus', handleWindowFocus);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, []);

    useEffect(() => {
        setForm((prev) => {
            if (Array.isArray(prev.items)) return prev;
            return { ...prev, items: [] };
        });
    }, [setForm]);

    const cartItems = Array.isArray(form.items) ? form.items : [];

    const suggestions = useMemo(() => {
        const term = normalize(query);
        if (!term) return [];

        return products
            .filter((product) => {
                if (Number(product.is_active ?? 1) !== 1) return false;

                const fields = [product.name, product.brand, product.category, product.barcode]
                    .map((value) => normalize(value));

                return fields.some((field) => field.includes(term));
            })
            .slice(0, 8);
    }, [products, query]);

    const cartTotal = useMemo(
        () => cartItems.reduce((acc, item) => acc + Number(item.unit_price || 0) * Number(item.quantity || 0), 0),
        [cartItems]
    );

    useEffect(() => {
        if (!highlightedProductId) return;

        const timer = setTimeout(() => setHighlightedProductId(null), 850);
        return () => clearTimeout(timer);
    }, [highlightedProductId]);

    useEffect(() => {
        const scanned = normalize(query);
        if (!scanned) return;

        const byBarcode = products.find((product) => normalize(product.barcode) === scanned);
        if (!byBarcode) return;

        addProductToCart(byBarcode, 1);
        setHighlightedProductId(Number(byBarcode.id));
        playScanSuccessTone();
        setFeedbackType('success');
        setFeedback(`Escaneado y agregado: ${byBarcode.name}`);
        setQuery('');

        requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });
    }, [query, products]);

    function playScanSuccessTone() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            const context = new AudioContextClass();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            gainNode.gain.setValueAtTime(0.001, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.14);

            oscillator.start();
            oscillator.stop(context.currentTime + 0.14);
        } catch {
            // No-op if the browser blocks audio context.
        }
    }

    function addProductToCart(product, quantity = 1) {
        const safeStock = Number(product.stock || 0);

        setForm((prev) => {
            const prevItems = Array.isArray(prev.items) ? prev.items : [];
            const existingIndex = prevItems.findIndex((item) => Number(item.product_id) === Number(product.id));

            if (existingIndex >= 0) {
                const updatedItems = [...prevItems];
                const currentQty = Number(updatedItems[existingIndex].quantity || 0);
                const nextQty = currentQty + Number(quantity || 1);
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    image_url: updatedItems[existingIndex].image_url || product.image_url || '',
                    quantity: safeStock > 0 ? Math.min(nextQty, safeStock) : nextQty
                };
                return { ...prev, items: updatedItems };
            }

            return {
                ...prev,
                items: [
                    ...prevItems,
                    {
                        product_id: Number(product.id),
                        name: product.name,
                        barcode: product.barcode || '',
                        image_url: product.image_url || '',
                        quantity: safeStock > 0 ? Math.min(Number(quantity || 1), safeStock) : Number(quantity || 1),
                        unit_price: Number(product.sale_price || 0),
                        stock: safeStock
                    }
                ]
            };
        });

        lastScanRef.current = {
            barcode: normalize(product.barcode),
            at: Date.now()
        };
    }

    function isDuplicateRecentScan(product) {
        const barcode = normalize(product?.barcode);
        if (!barcode) return false;

        const elapsed = Date.now() - Number(lastScanRef.current.at || 0);
        return lastScanRef.current.barcode === barcode && elapsed < 700;
    }

    function handleSelectSuggestion(product) {
        addProductToCart(product, 1);
        setFeedbackType('success');
        setFeedback(`Agregado: ${product.name}`);
        setQuery('');
    }

    function handleSearchKeyDown(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();

        const scanned = normalize(query);
        if (!scanned) return;

        const byBarcode = products.find((product) => normalize(product.barcode) === scanned);
        if (byBarcode) {
            if (isDuplicateRecentScan(byBarcode)) {
                setQuery('');
                return;
            }

            addProductToCart(byBarcode, 1);
            setHighlightedProductId(Number(byBarcode.id));
            playScanSuccessTone();
            setFeedbackType('success');
            setFeedback(`Escaneado y agregado: ${byBarcode.name}`);
            setQuery('');
            return;
        }

        if (suggestions.length === 1) {
            handleSelectSuggestion(suggestions[0]);
            return;
        }

        setFeedbackType('warning');
        setFeedback('No se encontró código exacto. Elige una sugerencia.');
    }

    function handleQuantityShortcut(productId, key) {
        const item = cartItems.find((cartItem) => Number(cartItem.product_id) === Number(productId));
        if (!item) return;

        const currentQuantity = Number(item.quantity || 1);
        const maxStock = Number(item.stock || 0);

        const increaseKeys = ['+', '=', 'Add', 'ArrowUp'];
        const decreaseKeys = ['-', '_', 'Subtract', 'ArrowDown'];

        if (increaseKeys.includes(key)) {
            const nextQty = maxStock > 0 ? Math.min(currentQuantity + 1, maxStock) : currentQuantity + 1;
            updateItemQuantity(productId, nextQty);
        }

        if (decreaseKeys.includes(key)) {
            const nextQty = Math.max(1, currentQuantity - 1);
            updateItemQuantity(productId, nextQty);
        }
    }

    function updateItemQuantity(productId, nextQuantity) {
        setForm((prev) => {
            const prevItems = Array.isArray(prev.items) ? prev.items : [];
            const updatedItems = prevItems
                .map((item) => {
                    if (Number(item.product_id) !== Number(productId)) return item;

                    const parsedQty = Math.max(1, Number(nextQuantity || 1));
                    const maxStock = Number(item.stock || 0);

                    return {
                        ...item,
                        quantity: maxStock > 0 ? Math.min(parsedQty, maxStock) : parsedQty
                    };
                });

            return { ...prev, items: updatedItems };
        });
    }

    function removeItem(productId) {
        setForm((prev) => {
            const prevItems = Array.isArray(prev.items) ? prev.items : [];
            return {
                ...prev,
                items: prevItems.filter((item) => Number(item.product_id) !== Number(productId))
            };
        });
    }

    function clearCart() {
        setForm((prev) => ({ ...prev, items: [] }));
        setFeedbackType('success');
        setFeedback('Carrito vaciado.');
    }

    function incrementItem(productId) {
        const item = cartItems.find((cartItem) => Number(cartItem.product_id) === Number(productId));
        if (!item) return;

        const nextQty = Number(item.quantity || 1) + 1;
        updateItemQuantity(productId, nextQty);
    }

    function decrementItem(productId) {
        const item = cartItems.find((cartItem) => Number(cartItem.product_id) === Number(productId));
        if (!item) return;

        const nextQty = Math.max(1, Number(item.quantity || 1) - 1);
        updateItemQuantity(productId, nextQty);
    }

    return (
        <section className="operation-card">
            <div className="card-title-row">
                <h2>Venta rápida</h2>
                <p>Carrito con búsqueda y escaneo</p>
            </div>

            <form className="sales-form" onSubmit={onSubmit}>
                <div className="form-grid form-grid--compact">
                    <div className="field-with-label suggestion-field">
                        <label className="field-label">Buscar producto o escanear código</label>
                        <input
                            ref={searchInputRef}
                            autoFocus
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                if (feedback) {
                                    setFeedback('');
                                    setFeedbackType('success');
                                }
                            }}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Escribe nombre/marca o escanea (se agrega automático por código)"
                        />

                        {query.trim() && suggestions.length > 0 && (
                            <div className="suggestion-list" role="listbox" aria-label="Sugerencias de productos">
                                {suggestions.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        className="suggestion-item"
                                        onMouseDown={() => handleSelectSuggestion(product)}
                                    >
                                        {product.name} · {money(product.sale_price)} · Stock: {product.stock}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="field-with-label">
                        <label className="field-label">Método de pago</label>
                        <select
                            value={form.payment_method}
                            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                        >
                            <option value="CASH">Efectivo</option>
                            <option value="CARD">Tarjeta</option>
                            <option value="TRANSFER">Transferencia</option>
                        </select>
                    </div>
                </div>

                {feedback && (
                    <small className={feedbackType === 'success' ? 'scan-feedback success' : 'scan-feedback'}>
                        {feedback}
                    </small>
                )}

                <div className="sales-cart-box">
                    <div className="sales-cart-header">
                        <strong>Carrito ({cartItems.length})</strong>
                        <div className="sales-cart-header-actions">
                            <strong>Total: {money(cartTotal)}</strong>
                            <button
                                type="button"
                                className="secondary small-btn"
                                onClick={clearCart}
                                disabled={cartItems.length === 0}
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </div>

                    <small className="sales-shortcuts-help">Atajos cantidad: + / - (también ↑ y ↓)</small>

                    {cartItems.length === 0 ? (
                        <div className="empty-row">Aún no hay productos en el carrito.</div>
                    ) : (
                        <div className="sales-cart-list">
                            {cartItems.map((item) => (
                                <article
                                    className={
                                        Number(highlightedProductId) === Number(item.product_id)
                                            ? 'sales-cart-item is-highlighted'
                                            : 'sales-cart-item'
                                    }
                                    key={item.product_id}
                                >
                                    <div className="sales-cart-product">
                                        {item.image_url ? (
                                            <img
                                                src={toMediaUrl(item.image_url)}
                                                alt={item.name}
                                                className="product-thumb sales-cart-thumb"
                                            />
                                        ) : (
                                            <span className="thumb-placeholder sales-cart-thumb-placeholder">Sin foto</span>
                                        )}

                                        <div>
                                            <strong>{item.name}</strong>
                                            <small>
                                                {item.barcode ? `Cod: ${item.barcode} · ` : ''}
                                                Precio: {money(item.unit_price)}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="sales-cart-actions">
                                        <div className="quantity-stepper" role="group" aria-label={`Cantidad de ${item.name}`}>
                                            <button
                                                type="button"
                                                className="secondary small-btn quantity-btn"
                                                onClick={() => decrementItem(item.product_id)}
                                                disabled={Number(item.quantity || 1) <= 1}
                                                aria-label={`Disminuir cantidad de ${item.name}`}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(event) => updateItemQuantity(item.product_id, event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (['+', '=', 'Add', '-', '_', 'Subtract', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                                                        event.preventDefault();
                                                        handleQuantityShortcut(item.product_id, event.key);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="secondary small-btn quantity-btn"
                                                onClick={() => incrementItem(item.product_id)}
                                                disabled={Number(item.stock || 0) > 0 && Number(item.quantity || 0) >= Number(item.stock || 0)}
                                                aria-label={`Aumentar cantidad de ${item.name}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span>{money(Number(item.unit_price || 0) * Number(item.quantity || 0))}</span>
                                        <button
                                            type="button"
                                            className="danger small-btn"
                                            onClick={() => removeItem(item.product_id)}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={cartItems.length === 0}>
                        Registrar venta
                    </button>
                </div>
            </form>
        </section>
    );
}
