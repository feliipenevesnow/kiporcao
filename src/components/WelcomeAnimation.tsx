import { useState, useEffect } from 'react';
import './WelcomeAnimation.css';
import edivaldoImg from '../assets/edivaldo.png';

export default function WelcomeAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [text, setText] = useState('');
    const fullText = "Eai JHOW! Beleza? Seja bem-vindo(a) ao Ki Porção.";
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Verifica se a animação já foi exibida
        const alreadyShown = localStorage.getItem('welcomeAnimationShown');

        if (alreadyShown === 'true') {
            setHasShown(true);
            return;
        }

        // Inicia a animação
        const showAnimation = async () => {
            // Mostra o overlay
            setIsVisible(true);

            // Aguarda as animações CSS de entrada (2.5s)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Efeito Typewriter
            for (let i = 0; i <= fullText.length; i++) {
                setText(fullText.substring(0, i));
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Aguarda leitura da mensagem (3s)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Inicia fade out
            setIsVisible(false);

            // Aguarda transição e marca como vista
            await new Promise(resolve => setTimeout(resolve, 500));
            localStorage.setItem('welcomeAnimationShown', 'true');
            setHasShown(true);
        };

        showAnimation();
    }, []);

    if (hasShown) return null;

    return (
        <div className={`welcome-overlay ${isVisible ? 'visible' : ''}`}>
            <h1 className="welcome-brand">Ki Porção</h1>
            <div className="welcome-content">
                <img
                    src={edivaldoImg}
                    alt="Boas-vindas"
                    className="welcome-character"
                />
                <div className="speech-bubble">
                    <p>{text}<span className="cursor">|</span></p>
                </div>
            </div>
        </div>
    );
}
