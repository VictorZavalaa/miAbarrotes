const VISIT_DAY_OPTIONS = [
    { value: 'MON', label: 'Lun' },
    { value: 'TUE', label: 'Mar' },
    { value: 'WED', label: 'Mié' },
    { value: 'THU', label: 'Jue' },
    { value: 'FRI', label: 'Vie' },
    { value: 'SAT', label: 'Sáb' },
    { value: 'SUN', label: 'Dom' }
];

const VISIT_DAY_LABELS = VISIT_DAY_OPTIONS.reduce((acc, item) => {
    acc[item.value] = item.label;
    return acc;
}, {});

function normalizeDays(rawDays) {
    if (!Array.isArray(rawDays)) return [];
    return rawDays
        .map((day) => String(day || '').trim().toUpperCase())
        .filter((day) => VISIT_DAY_LABELS[day]);
}

function formatVisitSchedule(supplier) {
    const days = normalizeDays(supplier?.visit_days);
    if (days.length === 0) return 'Sin días definidos';

    const daysLabel = days.map((day) => VISIT_DAY_LABELS[day]).join(', ');
    const frequency = String(supplier?.visit_frequency || 'WEEKLY').toUpperCase() === 'BIWEEKLY'
        ? 'cada 15 días'
        : 'cada semana';

    return `${daysLabel} · ${frequency}`;
}

export default function PurchasesSection({
    suppliers,
    supplierForm,
    setSupplierForm,
    onSubmitSupplier
}) {
    const selectedVisitDays = normalizeDays(supplierForm.visit_days);

    function toggleVisitDay(day) {
        const normalizedDay = String(day || '').toUpperCase();
        const alreadySelected = selectedVisitDays.includes(normalizedDay);

        const nextDays = alreadySelected
            ? selectedVisitDays.filter((item) => item !== normalizedDay)
            : [...selectedVisitDays, normalizedDay];

        setSupplierForm({
            ...supplierForm,
            visit_days: nextDays
        });
    }

    return (
        <section className="operation-card">
            <div className="card-title-row">
                <h2>Recepción de proveedor</h2>
                <p>Gestión de alta de nuevos proveedores</p>
            </div>

            <div className="operation-columns">
                <form className="form-grid" onSubmit={onSubmitSupplier}>
                    <h3>Nuevo proveedor</h3>
                    <input
                        placeholder="Nombre proveedor"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Contacto"
                        value={supplierForm.contact_name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })}
                    />
                    <input
                        placeholder="Teléfono"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    />

                    <div className="field-with-label">
                        <span className="field-label">Días de visita</span>
                        <div className="visit-days-selector" role="group" aria-label="Días de visita del proveedor">
                            {VISIT_DAY_OPTIONS.map((day) => {
                                const isSelected = selectedVisitDays.includes(day.value);
                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        className={isSelected ? 'secondary small-btn active' : 'secondary small-btn'}
                                        aria-pressed={isSelected}
                                        onClick={() => toggleVisitDay(day.value)}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                        <small className="visit-days-selected">
                            {selectedVisitDays.length > 0
                                ? `Seleccionados: ${selectedVisitDays.map((day) => VISIT_DAY_LABELS[day]).join(', ')}`
                                : 'Sin días seleccionados'}
                        </small>
                    </div>

                    <div className="field-with-label">
                        <span className="field-label">Frecuencia de visita</span>
                        <select
                            value={supplierForm.visit_frequency || 'WEEKLY'}
                            onChange={(e) => setSupplierForm({ ...supplierForm, visit_frequency: e.target.value })}
                        >
                            <option value="WEEKLY">Cada semana</option>
                            <option value="BIWEEKLY">Cada 15 días</option>
                        </select>
                    </div>

                    <button type="submit">Guardar proveedor</button>
                </form>

                <section className="suppliers-list-panel" aria-label="Listado de proveedores">
                    <h3>Proveedores registrados</h3>

                    {suppliers.length === 0 ? (
                        <p className="suppliers-list-empty">Aún no hay proveedores registrados.</p>
                    ) : (
                        <div className="suppliers-list">
                            {suppliers.map((supplier) => (
                                <article className="supplier-item" key={supplier.id}>
                                    <strong>{supplier.name}</strong>
                                    <small>
                                        {supplier.contact_name || 'Sin contacto'}
                                        {supplier.phone ? ` · ${supplier.phone}` : ''}
                                    </small>
                                    <small className="supplier-visit-schedule">Visita: {formatVisitSchedule(supplier)}</small>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}
