import { useEffect, useMemo, useState } from 'react';
import { money } from '../utils';

const CASH_TRACKER_KEY = 'dashboard-cash-tracker';
const CASH_CUTS_KEY = 'dashboard-cash-cuts';
const CASH_EDITOR_PASSWORD = '4321';

function parseMoneyInput(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
}

function toDateOnly(date) {
    const parsed = date instanceof Date ? date : new Date(date);
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function shiftDays(dateString, days) {
    const current = new Date(`${dateString}T00:00:00`);
    current.setDate(current.getDate() + days);
    return toDateOnly(current);
}

function monthLabel(dateValue) {
    return new Intl.DateTimeFormat('es-MX', {
        month: 'long',
        year: 'numeric'
    }).format(dateValue);
}

function formatDateLabel(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        day: '2-digit',
        month: 'short'
    }).format(date);
}

function getStatusLabel(status) {
    if (status === 'PAID') return 'Pagado';
    if (status === 'CANCELLED') return 'Cancelado';
    return 'Pendiente';
}

export default function DashboardSection({
    suppliers,
    visits,
    todaySalesSummary,
    catalogMetrics,
    onCreateVisit,
    onUpdateVisit,
    onDeleteVisit
}) {
    const today = toDateOnly(new Date());
    const [selectedDate, setSelectedDate] = useState(today);
    const [viewDate, setViewDate] = useState(new Date(`${today}T00:00:00`));
    const [form, setForm] = useState({
        supplier_id: '',
        visit_date: today,
        expected_amount: '',
        notes: ''
    });
    const [cashAmountInput, setCashAmountInput] = useState('');
    const [terminalAmountInput, setTerminalAmountInput] = useState('');
    const [cashEditorUnlocked, setCashEditorUnlocked] = useState(false);
    const [cashAccessMessage, setCashAccessMessage] = useState('Bloqueado: necesitas contraseña para editar.');
    const [cashTrackerHydrated, setCashTrackerHydrated] = useState(false);
    const [cashCutsHydrated, setCashCutsHydrated] = useState(false);
    const [cashCuts, setCashCuts] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CASH_TRACKER_KEY);
            if (!raw) return;

            const saved = JSON.parse(raw);
            setCashAmountInput(String(saved?.cash ?? ''));
            setTerminalAmountInput(String(saved?.terminal ?? ''));
        } catch {
            // Si falla el parseo, simplemente se ignora y se inicia vacío.
        } finally {
            setCashTrackerHydrated(true);
        }
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CASH_CUTS_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;

            const normalized = parsed
                .map((item) => ({
                    id: Number(item?.id || Date.now()),
                    createdAt: String(item?.createdAt || ''),
                    cash: parseMoneyInput(item?.cash),
                    terminal: parseMoneyInput(item?.terminal),
                    total: parseMoneyInput(item?.total)
                }))
                .filter((item) => item.createdAt);

            setCashCuts(normalized);
        } catch {
            setCashCuts([]);
        } finally {
            setCashCutsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!cashTrackerHydrated) return;

        const payload = {
            cash: cashAmountInput,
            terminal: terminalAmountInput
        };
        localStorage.setItem(CASH_TRACKER_KEY, JSON.stringify(payload));
    }, [cashAmountInput, terminalAmountInput, cashTrackerHydrated]);

    useEffect(() => {
        if (!cashCutsHydrated) return;
        localStorage.setItem(CASH_CUTS_KEY, JSON.stringify(cashCuts));
    }, [cashCuts, cashCutsHydrated]);

    const visitsByDate = useMemo(() => {
        return visits.reduce((acc, visit) => {
            const key = visit.visit_date;
            if (!acc[key]) acc[key] = [];
            acc[key].push(visit);
            return acc;
        }, {});
    }, [visits]);

    const selectedDateVisits = visitsByDate[selectedDate] || [];
    const tomorrow = shiftDays(today, 1);
    const selectedDateLabel = formatDateLabel(selectedDate);

    const totals = useMemo(() => {
        const sumByDate = (dateKey) =>
            (visitsByDate[dateKey] || []).reduce((acc, visit) => {
                if (visit.status === 'CANCELLED') return acc;
                return acc + Number(visit.expected_amount || 0);
            }, 0);

        return {
            today: sumByDate(today),
            tomorrow: sumByDate(tomorrow),
            selected: sumByDate(selectedDate)
        };
    }, [visitsByDate, today, tomorrow, selectedDate]);

    const moneySummary = useMemo(() => {
        const salesTotal = Number(todaySalesSummary?.total || 0);
        const salesCount = Number(todaySalesSummary?.sales_count || 0);
        const averageTicket = salesCount > 0 ? salesTotal / salesCount : 0;
        const plannedPaymentsToday = Number(totals.today || 0);
        const projectedBalance = salesTotal - plannedPaymentsToday;
        const cashAmount = parseMoneyInput(cashAmountInput);
        const terminalAmount = parseMoneyInput(terminalAmountInput);
        const currentTotal = cashAmount + terminalAmount;

        return {
            salesTotal,
            salesCount,
            averageTicket,
            plannedPaymentsToday,
            projectedBalance,
            cashAmount,
            terminalAmount,
            currentTotal
        };
    }, [todaySalesSummary, totals.today, cashAmountInput, terminalAmountInput]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - startOffset);

        return Array.from({ length: 42 }).map((_, index) => {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + index);
            const dateKey = toDateOnly(day);
            const dayVisits = visitsByDate[dateKey] || [];
            const total = dayVisits.reduce((acc, visit) => {
                if (visit.status === 'CANCELLED') return acc;
                return acc + Number(visit.expected_amount || 0);
            }, 0);

            return {
                date: day,
                dateKey,
                inCurrentMonth: day.getMonth() === viewDate.getMonth(),
                count: dayVisits.length,
                total
            };
        });
    }, [viewDate, visitsByDate]);

    const upcomingVisits = useMemo(() => {
        return visits
            .filter((visit) => visit.status !== 'CANCELLED' && visit.visit_date >= today)
            .sort((a, b) => {
                if (a.visit_date === b.visit_date) {
                    return String(a.supplier_name || '').localeCompare(String(b.supplier_name || ''), 'es');
                }

                return a.visit_date.localeCompare(b.visit_date);
            })
            .slice(0, 5);
    }, [visits, today]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!form.supplier_id || !form.visit_date || !form.expected_amount) return;

        setSaving(true);
        try {
            await onCreateVisit({
                supplier_id: Number(form.supplier_id),
                visit_date: form.visit_date,
                expected_amount: Number(form.expected_amount),
                notes: form.notes || null
            });

            setSelectedDate(form.visit_date);
            setViewDate(new Date(`${form.visit_date}T00:00:00`));
            setForm((prev) => ({ ...prev, expected_amount: '', notes: '' }));
        } finally {
            setSaving(false);
        }
    }

    async function togglePaidStatus(visit) {
        const nextStatus = visit.status === 'PAID' ? 'PENDING' : 'PAID';
        await onUpdateVisit(visit.id, { status: nextStatus });
    }

    function goToMonth(offset) {
        const next = new Date(viewDate);
        next.setMonth(next.getMonth() + offset);
        setViewDate(next);
    }

    function requestCashEditorAccess() {
        const providedPassword = window.prompt('Ingresa contraseña para editar caja/terminal');
        if (providedPassword === null) return;

        if (providedPassword.trim() === CASH_EDITOR_PASSWORD) {
            setCashEditorUnlocked(true);
            setCashAccessMessage('Edición habilitada. Recuerda bloquear al terminar.');
            return;
        }

        setCashEditorUnlocked(false);
        setCashAccessMessage('Contraseña incorrecta. Edición bloqueada.');
    }

    function lockCashEditor() {
        setCashEditorUnlocked(false);
        setCashAccessMessage('Bloqueado: necesitas contraseña para editar.');
    }

    function handleCashCut() {
        if (!cashEditorUnlocked) {
            setCashAccessMessage('Desbloquea la edición con contraseña para hacer corte de caja.');
            return;
        }

        const cashAmount = parseMoneyInput(cashAmountInput);
        const terminalAmount = parseMoneyInput(terminalAmountInput);
        const totalAmount = cashAmount + terminalAmount;

        if (totalAmount <= 0) {
            setCashAccessMessage('No hay monto para cortar.');
            return;
        }

        const confirmed = window.confirm(
            `¿Registrar corte por ${money(totalAmount)}?\nCaja: ${money(cashAmount)}\nTerminal: ${money(terminalAmount)}`
        );
        if (!confirmed) return;

        const now = new Date();
        const newCut = {
            id: now.getTime(),
            createdAt: now.toISOString(),
            cash: cashAmount,
            terminal: terminalAmount,
            total: totalAmount
        };

        setCashCuts((prev) => [newCut, ...prev].slice(0, 30));
        setCashAmountInput('0');
        setTerminalAmountInput('0');
        setCashEditorUnlocked(false);
        setCashAccessMessage('Corte de caja registrado y montos reiniciados.');
    }

    return (
        <section className="dashboard-home">
            <div className="dashboard-home-head">
                <div>
                    <span className="section-kicker">Inicio operativo</span>
                    <h2>Resumen de hoy</h2>
                    <p>Ventas, caja, inventario y pagos de proveedor en una sola vista.</p>
                </div>

                <div className="dashboard-date-chip">
                    <span>{selectedDate === today ? 'Hoy' : 'Fecha activa'}</span>
                    <strong>{selectedDateLabel}</strong>
                </div>
            </div>

            <section className="dashboard-command-grid" aria-label="Resumen operativo">
                <article className="dashboard-primary-metric">
                    <span>Vendido hoy</span>
                    <strong>{money(moneySummary.salesTotal)}</strong>
                    <small>
                        {moneySummary.salesCount} venta(s) · Ticket promedio {money(moneySummary.averageTicket)}
                    </small>
                </article>

                <article className={moneySummary.projectedBalance >= 0 ? 'dashboard-balance-card positive' : 'dashboard-balance-card negative'}>
                    <span>Saldo después de pagos</span>
                    <strong>{money(moneySummary.projectedBalance)}</strong>
                    <small>Pagos de hoy: {money(moneySummary.plannedPaymentsToday)}</small>
                </article>

                <article className="dashboard-mini-card">
                    <span>Pagos hoy</span>
                    <strong>{money(totals.today)}</strong>
                    <small>Mañana: {money(totals.tomorrow)}</small>
                </article>

                <article className="dashboard-mini-card warning">
                    <span>Bajo stock</span>
                    <strong>{Number(catalogMetrics?.lowStock || 0)}</strong>
                    <small>{Number(catalogMetrics?.activeProducts || 0)} productos activos</small>
                </article>
            </section>

            <section className="dashboard-cash-panel" aria-label="Caja actual">
                <div className="dashboard-cash-summary">
                    <div>
                        <span className="section-kicker">Caja actual</span>
                        <strong>{money(moneySummary.currentTotal)}</strong>
                        <small>{`Efectivo ${money(moneySummary.cashAmount)} · Terminal ${money(moneySummary.terminalAmount)}`}</small>
                    </div>

                    <div className="dashboard-cash-actions">
                        {cashEditorUnlocked ? (
                            <button type="button" className="secondary small-btn" onClick={lockCashEditor}>
                                Bloquear
                            </button>
                        ) : (
                            <button type="button" className="secondary small-btn" onClick={requestCashEditorAccess}>
                                Editar
                            </button>
                        )}
                        <button type="button" className="secondary small-btn" onClick={handleCashCut}>
                            Corte
                        </button>
                    </div>
                </div>

                <small className={cashEditorUnlocked ? 'dashboard-cash-lock-note unlocked' : 'dashboard-cash-lock-note'}>
                    {cashAccessMessage}
                </small>

                <div className="dashboard-cash-form">
                    <div className="field-with-label">
                        <label className="field-label" htmlFor="cash-on-hand-input">Efectivo en caja</label>
                        <input
                            id="cash-on-hand-input"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={cashAmountInput}
                            onChange={(event) => setCashAmountInput(event.target.value)}
                            disabled={!cashEditorUnlocked}
                        />
                    </div>

                    <div className="field-with-label">
                        <label className="field-label" htmlFor="terminal-on-hand-input">Terminal</label>
                        <input
                            id="terminal-on-hand-input"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={terminalAmountInput}
                            onChange={(event) => setTerminalAmountInput(event.target.value)}
                            disabled={!cashEditorUnlocked}
                        />
                    </div>
                </div>

                {cashCuts.length > 0 && (
                    <div className="dashboard-cuts-list compact">
                        {cashCuts.slice(0, 3).map((cut) => {
                            const cutDate = new Date(cut.createdAt);
                            const dateLabel = Number.isNaN(cutDate.getTime())
                                ? cut.createdAt
                                : cutDate.toLocaleString('es-MX', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                });

                            return (
                                <article key={cut.id} className="dashboard-cut-item">
                                    <div>
                                        <strong>{money(cut.total)}</strong>
                                        <small>{dateLabel}</small>
                                    </div>
                                    <small>{`Caja ${money(cut.cash)} · Terminal ${money(cut.terminal)}`}</small>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <div className="dashboard-layout">
                <section className="dashboard-calendar-card">
                    <div className="dashboard-calendar-head">
                        <div>
                            <span className="section-kicker">Calendario</span>
                            <strong>{monthLabel(viewDate)}</strong>
                        </div>
                        <div className="calendar-nav-actions">
                            <button type="button" className="secondary small-btn" onClick={() => goToMonth(-1)}>
                                Anterior
                            </button>
                            <button type="button" className="secondary small-btn" onClick={() => goToMonth(1)}>
                                Siguiente
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-weekdays">
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mié</span>
                        <span>Jue</span>
                        <span>Vie</span>
                        <span>Sáb</span>
                        <span>Dom</span>
                    </div>

                    <div className="dashboard-calendar-grid">
                        {calendarDays.map((day) => (
                            <button
                                key={day.dateKey}
                                type="button"
                                className={[
                                    'calendar-day',
                                    day.inCurrentMonth ? '' : 'outside',
                                    day.dateKey === selectedDate ? 'selected' : '',
                                    day.dateKey === today ? 'today' : '',
                                    day.count > 0 ? 'has-visits' : ''
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() => {
                                    setSelectedDate(day.dateKey);
                                    setForm((prev) => ({ ...prev, visit_date: day.dateKey }));
                                }}
                            >
                                <span className="calendar-day-number">{day.date.getDate()}</span>
                                {day.count > 0 && (
                                    <small>
                                        {day.count} · {money(day.total)}
                                    </small>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="dashboard-agenda-card">
                    <div className="agenda-head">
                        <div>
                            <span className="section-kicker">Agenda</span>
                            <h3>{selectedDateLabel}</h3>
                        </div>
                        <strong>{money(totals.selected)}</strong>
                    </div>

                    <form className="dashboard-form" onSubmit={handleSubmit}>
                        <select
                            value={form.supplier_id}
                            onChange={(event) => setForm({ ...form, supplier_id: event.target.value })}
                            required
                        >
                            <option value="">Proveedor</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={form.visit_date}
                            onChange={(event) => {
                                setForm({ ...form, visit_date: event.target.value });
                                setSelectedDate(event.target.value);
                                setViewDate(new Date(`${event.target.value}T00:00:00`));
                            }}
                            required
                        />

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Monto esperado"
                            value={form.expected_amount}
                            onChange={(event) => setForm({ ...form, expected_amount: event.target.value })}
                            required
                        />

                        <input
                            placeholder="Nota opcional"
                            value={form.notes}
                            onChange={(event) => setForm({ ...form, notes: event.target.value })}
                        />

                        <button type="submit" disabled={saving}>
                            {saving ? 'Guardando...' : 'Agregar pago'}
                        </button>
                    </form>

                    <div className="dashboard-visits-list">
                        {selectedDateVisits.length === 0 ? (
                            <div className="empty-row">Sin visitas registradas para esta fecha.</div>
                        ) : (
                            selectedDateVisits.map((visit) => (
                                <article className="dashboard-visit-item" key={visit.id}>
                                    <div>
                                        <strong>{visit.supplier_name}</strong>
                                        <small>
                                            {money(visit.expected_amount)}
                                            {visit.notes ? ` · ${visit.notes}` : ''}
                                        </small>
                                    </div>

                                    <span className={`visit-status ${String(visit.status || 'PENDING').toLowerCase()}`}>
                                        {getStatusLabel(visit.status)}
                                    </span>

                                    <div className="row-actions">
                                        <button
                                            type="button"
                                            className="secondary small-btn"
                                            onClick={() => togglePaidStatus(visit)}
                                        >
                                            {visit.status === 'PAID' ? 'Pendiente' : 'Pagado'}
                                        </button>
                                        <button
                                            type="button"
                                            className="danger small-btn"
                                            onClick={() => onDeleteVisit(visit.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    <section className="upcoming-panel" aria-label="Próximos pagos">
                        <div className="upcoming-head">
                            <span className="section-kicker">Próximos pagos</span>
                            <strong>{upcomingVisits.length}</strong>
                        </div>

                        {upcomingVisits.length === 0 ? (
                            <small className="dashboard-cuts-empty">No hay pagos próximos registrados.</small>
                        ) : (
                            <div className="upcoming-list">
                                {upcomingVisits.map((visit) => (
                                    <article key={visit.id} className="upcoming-item">
                                        <div>
                                            <strong>{visit.supplier_name}</strong>
                                            <small>{formatDateLabel(visit.visit_date)}</small>
                                        </div>
                                        <span>{money(visit.expected_amount)}</span>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </section>
            </div>
        </section>
    );
}
