export default function TopBar({ status, deployTag, onRefresh, lastRefreshAt, theme, onToggleTheme, currentUser, onSwitchUser }) {
    const formattedTime = lastRefreshAt
        ? new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(lastRefreshAt)
        : '--:--';

    return (
        <section className="top-bar">
            <div className="top-bar-meta">
                <span className="status-chip">{status}</span>
                <small>Última actualización: {formattedTime}</small>
            </div>
            <div className="top-bar-actions">
                {deployTag ? (
                    <span className="status-chip deploy-chip" title="Marca de despliegue activa en backend">
                        🚀 {deployTag}
                    </span>
                ) : null}
                {currentUser ? (
                    <span className="status-chip user-chip">
                        👤 {currentUser.username} · {Number(currentUser.is_admin) ? 'Admin' : 'Usuario'}
                    </span>
                ) : null}
                {onSwitchUser ? (
                    <button type="button" className="secondary small-btn" onClick={onSwitchUser}>
                        Cambiar usuario
                    </button>
                ) : null}
                <button type="button" className="secondary small-btn" onClick={onToggleTheme}>
                    {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
                </button>
                <button type="button" className="secondary" onClick={onRefresh}>
                    Sincronizar catálogo
                </button>
            </div>
        </section>
    );
}
