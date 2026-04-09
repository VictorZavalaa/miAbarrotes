import { useEffect, useMemo, useState } from 'react';

export default function PageHeader() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('es-MX', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).format(now),
        [now]
    );

    const timeLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now),
        [now]
    );

    return (
        <header className="page-header">
            <div className="header-main">
                <p className="eyebrow">Panel de operación</p>
                <h1>Mi Tienda POS</h1>
                <p>Control de inventario y caja en tiempo real</p>
            </div>

            <div className="header-right">
                <div className="header-clock" aria-label="Fecha y hora actual">
                    <strong>{timeLabel}</strong>
                    <small>{todayLabel}</small>
                </div>

                <div className="header-badge" aria-label="Estado del sistema">
                    <span className="dot" aria-hidden="true" />
                    <div>
                        <strong>Online local</strong>
                        <small>Raspberry + MariaDB</small>
                    </div>
                </div>
            </div>
        </header>
    );
}
