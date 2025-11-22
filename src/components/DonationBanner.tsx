import { useState } from 'react';
import '../styles/components/DonationBanner.css';

interface DonationBannerProps {
    isModal?: boolean;
    onClose?: () => void;
}

export default function DonationBanner({ isModal = false, onClose }: DonationBannerProps) {
    const [copied, setCopied] = useState(false);
    const pixKey = '471.331.028-03';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(pixKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar PIX:', err);
        }
    };

    const bannerContent = (
        <div className="donation-content">
            <div className="donation-icon">🐾</div>
            <div className="donation-text">
                <h3 className="donation-title">Ajude Nossos Amigos de Quatro Patas! 🐶🐱</h3>
                <p className="donation-message">
                    Cuidamos de <strong>animais de rua</strong> que precisam de ração, água e atendimento veterinário.
                    <br />
                    <strong>Cada doação salva vidas!</strong> Sua generosidade faz a diferença. ❤️
                </p>
            </div>
            <div className="donation-action">
                <div className="pix-info">
                    <span className="pix-label">PIX (CPF)</span>
                    <span className="pix-key">{pixKey}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    aria-label="Copiar chave PIX"
                >
                    {copied ? '✓ Copiado!' : '📋 Copiar PIX'}
                </button>
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className="donation-modal-overlay" onClick={onClose}>
                <div className="donation-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="donation-modal-close" onClick={onClose} aria-label="Fechar">
                        ×
                    </button>
                    <div className="donation-banner">
                        {bannerContent}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="donation-banner">
            {bannerContent}
        </div>
    );
}
