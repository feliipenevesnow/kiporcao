import '../styles/components/Modal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    <button onClick={onCancel} className="btn-cancel">
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`btn-confirm ${isDestructive ? 'destructive' : ''}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
