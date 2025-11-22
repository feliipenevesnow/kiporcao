import { useEffect } from 'react';
import '../styles/components/Toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: type === 'success' ? 'var(--success)' : 'var(--danger)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <span style={{ fontWeight: 'bold' }}>{type === 'success' ? '✓' : '✕'}</span>
            {message}
        </div>
    );
}
