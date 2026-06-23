import { useState } from 'react';

export default function ProfileSection({ currentUser, onChangePassword }) {
    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (form.new_password !== form.confirm_password) {
            await onChangePassword({
                validationError: 'La confirmación no coincide con la contraseña nueva.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onChangePassword({
                current_password: form.current_password,
                new_password: form.new_password
            });
            setForm({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch {
            // El contenedor muestra el mensaje y conservamos los campos para corregirlos.
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="profile-section" aria-labelledby="profile-title">
            <div className="profile-heading">
                <div>
                    <p className="section-kicker">Cuenta activa</p>
                    <h2 id="profile-title">Mi perfil</h2>
                    <p>Consulta tu cuenta y actualiza tu contraseña de acceso.</p>
                </div>
                <span className="profile-avatar" aria-hidden="true">
                    {String(currentUser?.username || 'U').slice(0, 2).toUpperCase()}
                </span>
            </div>

            <div className="profile-grid">
                <article className="profile-card profile-summary-card">
                    <p className="section-kicker">Información del usuario</p>
                    <dl className="profile-details">
                        <div>
                            <dt>Usuario</dt>
                            <dd>{currentUser?.username}</dd>
                        </div>
                        <div>
                            <dt>Tipo de cuenta</dt>
                            <dd>{Number(currentUser?.is_admin) ? 'Administrador' : 'Usuario de caja'}</dd>
                        </div>
                        <div>
                            <dt>Estado</dt>
                            <dd><span className="profile-status">Activo</span></dd>
                        </div>
                    </dl>
                </article>

                <article className="profile-card">
                    <div className="profile-card-head">
                        <div>
                            <p className="section-kicker">Seguridad</p>
                            <h3>Cambiar contraseña</h3>
                        </div>
                        <button
                            type="button"
                            className="secondary small-btn"
                            onClick={() => setShowPasswords((visible) => !visible)}
                        >
                            {showPasswords ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>

                    <form className="profile-password-form" onSubmit={handleSubmit}>
                        <label className="field-with-label">
                            <span className="field-label">Contraseña actual</span>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={form.current_password}
                                onChange={(event) => updateField('current_password', event.target.value)}
                                required
                            />
                        </label>

                        <label className="field-with-label">
                            <span className="field-label">Contraseña nueva</span>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                autoComplete="new-password"
                                minLength={8}
                                value={form.new_password}
                                onChange={(event) => updateField('new_password', event.target.value)}
                                required
                            />
                            <small>Mínimo 8 caracteres.</small>
                        </label>

                        <label className="field-with-label">
                            <span className="field-label">Confirmar contraseña nueva</span>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                autoComplete="new-password"
                                minLength={8}
                                value={form.confirm_password}
                                onChange={(event) => updateField('confirm_password', event.target.value)}
                                required
                            />
                        </label>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Actualizando...' : 'Guardar contraseña'}
                        </button>
                    </form>
                </article>
            </div>
        </section>
    );
}
