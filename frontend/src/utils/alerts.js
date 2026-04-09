import Swal from 'sweetalert2';

const toastConfig = {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true
};

export function successToast(message) {
    return Swal.fire({
        ...toastConfig,
        icon: 'success',
        title: message
    });
}

export function errorToast(message) {
    return Swal.fire({
        ...toastConfig,
        icon: 'error',
        title: message || 'Ocurrió un error'
    });
}

export function warningToast(message) {
    return Swal.fire({
        ...toastConfig,
        icon: 'warning',
        title: message
    });
}

export async function confirmDanger({
    title,
    text,
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar'
}) {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        focusCancel: true
    });

    return result.isConfirmed;
}

export async function promptCashPayment(totalAmount) {
    const safeTotal = Number(totalAmount || 0);

    const result = await Swal.fire({
        title: 'Cobro en efectivo',
        html: `
            <div style="display:grid;gap:10px;text-align:left;">
                <label style="display:grid;gap:4px;">
                    <span>Total a cobrar</span>
                    <input id="swal-total" class="swal2-input" type="number" step="0.01" min="0" value="${safeTotal.toFixed(2)}" disabled />
                </label>
                <label style="display:grid;gap:4px;">
                    <span>¿Cuánto te dieron?</span>
                    <input id="swal-received" class="swal2-input" type="number" step="0.01" min="0" placeholder="Monto recibido" />
                </label>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Registrar venta',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const receivedInput = document.getElementById('swal-received');
            const received = Number(receivedInput?.value || 0);

            if (!Number.isFinite(received) || received <= 0) {
                Swal.showValidationMessage('Ingresa cuánto te dieron.');
                return false;
            }

            if (received < safeTotal) {
                Swal.showValidationMessage('El monto recibido es menor que el total a cobrar.');
                return false;
            }

            return {
                received,
                change: Math.max(0, received - safeTotal)
            };
        }
    });

    if (!result.isConfirmed) return null;
    return result.value;
}

export function showCashChangeAlert({ saleId, totalAmount, receivedAmount, changeAmount }) {
    return Swal.fire({
        icon: 'success',
        title: `Venta registrada #${saleId}`,
        html: `
            <div style="display:grid;gap:8px;text-align:left;font-size:1rem;">
                <div><strong>Total:</strong> $${Number(totalAmount || 0).toFixed(2)}</div>
                <div><strong>Recibido:</strong> $${Number(receivedAmount || 0).toFixed(2)}</div>
                <div style="font-size:1.2rem;"><strong>Cambio:</strong> $${Number(changeAmount || 0).toFixed(2)}</div>
            </div>
        `,
        confirmButtonText: 'Cerrar',
        allowOutsideClick: false,
        allowEscapeKey: true
    });
}
