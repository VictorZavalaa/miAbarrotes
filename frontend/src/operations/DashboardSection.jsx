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

export default function DashboardSection({
    suppliers,
    visits,
    todaySalesSummary,
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
        <section className="operation-card dashboard-section">
            <div className="card-title-row">
                <h2>Dashboard de agenda y pagos</h2>
                <p>Planea visitas de proveedores y el dinero que necesitas por día.</p>
            </div>

            <div className="dashboard-kpis">
                <article className="stat-card">
                    <span>Hoy</span>
                    <strong>{money(totals.today)}</strong>
                </article>
                <article className="stat-card">
                    <span>Mañana</span>
                    <strong>{money(totals.tomorrow)}</strong>
                </article>
                <article className="stat-card">
                    <span>{selectedDate === today ? 'Fecha seleccionada (hoy)' : `Fecha seleccionada (${selectedDate})`}</span>
                    <strong>{money(totals.selected)}</strong>
                </article>
            </div>

            <section className="dashboard-money-card" aria-label="Resumen de dinero de hoy">
                <div className="dashboard-money-head">
                    <h3>Dinero de hoy</h3>
                    <small>Resumen rápido de caja y compromisos del día.</small>
                </div>

                <div className="dashboard-money-grid">
                    <article className="money-stat tone-emerald">
                        <span>Vendido hoy</span>
                        <strong>{money(moneySummary.salesTotal)}</strong>
                    </article>

                    <article className="money-stat tone-blue">
                        <span>Ventas realizadas</span>
                        <strong>{moneySummary.salesCount}</strong>
                        <small>ticket(s)</small>
                    </article>

                    <article className="money-stat tone-violet">
                        <span>Ticket promedio</span>
                        <strong>{money(moneySummary.averageTicket)}</strong>
                    </article>

                    <article className={[
                        'money-stat',
                        moneySummary.projectedBalance >= 0 ? 'tone-emerald-soft' : 'tone-red'
                    ].join(' ')}>
                        <span>Disponible proyectado</span>
                        <strong>{money(moneySummary.projectedBalance)}</strong>
                        <small>{`ventas - pagos de hoy (${money(moneySummary.plannedPaymentsToday)})`}</small>
                    </article>
                </div>

                <div className="dashboard-cash-entry">
                    <div className="dashboard-cash-head">
                        <div>
                            <h4>Caja actual</h4>
                            <small>Ingresa lo que tienes ahora en efectivo y terminal.</small>
                        </div>

                        <div className="dashboard-cash-actions">
                            {cashEditorUnlocked ? (
                                <button type="button" className="secondary small-btn" onClick={lockCashEditor}>
                                    Bloquear edición
                                </button>
                            ) : (
                                <button type="button" className="secondary small-btn" onClick={requestCashEditorAccess}>
                                    Editar montos
                                </button>
                            )}
                        </div>
                    </div>

                    <small className={cashEditorUnlocked ? 'dashboard-cash-lock-note unlocked' : 'dashboard-cash-lock-note'}>
                        {cashAccessMessage}
                    </small>

                    <div className="dashboard-cash-form">
                        <div className="field-with-label">
                            <label className="field-label" htmlFor="cash-on-hand-input">En caja</label>
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
                            <label className="field-label" htmlFor="terminal-on-hand-input">En terminal</label>
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

                    <article className="dashboard-cash-total">
                        <span>Total actual registrado</span>
                        <strong>{money(moneySummary.currentTotal)}</strong>
                        <small>
                            {`Caja ${money(moneySummary.cashAmount)} + Terminal ${money(moneySummary.terminalAmount)}`}
                        </small>
                    </article>

                    <section className="dashboard-cuts-panel" aria-label="Cortes de caja">
                        <div className="dashboard-cuts-head">
                            <h5>Corte de caja</h5>
                            <button type="button" className="secondary small-btn" onClick={handleCashCut}>
                                Realizar corte
                            </button>
                        </div>

                        {cashCuts.length === 0 ? (
                            <small className="dashboard-cuts-empty">Aún no hay cortes registrados.</small>
                        ) : (
                            <div className="dashboard-cuts-list">
                                {cashCuts.slice(0, 5).map((cut) => {
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
                </div>
            </section>

            <div className="dashboard-layout">
                <section className="dashboard-calendar-card">
                    <div className="dashboard-calendar-head">
                        <button type="button" className="secondary small-btn" onClick={() => goToMonth(-1)}>
                            ← Mes anterior
                        </button>
                        <strong>{monthLabel(viewDate)}</strong>
                        <button type="button" className="secondary small-btn" onClick={() => goToMonth(1)}>
                            Mes siguiente →
                        </button>
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
                                    day.dateKey === selectedDate ? 'selected' : ''
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
                                        {day.count} visita(s) · {money(day.total)}
                                    </small>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="dashboard-agenda-card">
                    <h3>Agenda del {selectedDate}</h3>

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
                            placeholder="Nota opcional (ej. pago factura abril)"
                            value={form.notes}
                            onChange={(event) => setForm({ ...form, notes: event.target.value })}
                        />

                        <button type="submit" disabled={saving}>
                            {saving ? 'Guardando...' : 'Agregar a agenda'}
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
                                            {money(visit.expected_amount)} · {visit.status}
                                            {visit.notes ? ` · ${visit.notes}` : ''}
                                        </small>
                                    </div>

                                    <div className="row-actions">
                                        <button
                                            type="button"
                                            className="secondary small-btn"
                                            onClick={() => togglePaidStatus(visit)}
                                        >
                                            {visit.status === 'PAID' ? 'Marcar pendiente' : 'Marcar pagado'}
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
                </section>
            </div>
        </section>
    );
}
