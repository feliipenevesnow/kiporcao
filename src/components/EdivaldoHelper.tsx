import { useState, useEffect } from 'react';
import edivaldoImg from '../assets/edivaldo.png';
import './EdivaldoHelper.css';

interface EdivaldoHelperProps {
    onFinish?: () => void;
}

export default function EdivaldoHelper({ onFinish }: EdivaldoHelperProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [currentBalloon, setCurrentBalloon] = useState(1);
    const [text, setText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    const balloon1Text = "Você está vendo apenas produtos disponíveis! 🍕 Arraste as categorias para filtrar ou veja os indisponíveis! 👆";
    const balloon2Text = "Psiu! Use a calculadora 🧮 para saber quanto deu sua conta! Clique no botão laranja no canto da tela!";

    useEffect(() => {
        const hasShown = localStorage.getItem('welcomeAnimationShown');
        if (hasShown === 'true') {
            return;
        }

        const showTimer = setTimeout(() => {
            setIsVisible(true);
            startTyping(balloon1Text);
        }, 8000);

        return () => clearTimeout(showTimer);
    }, []);

    const startTyping = async (fullText: string) => {
        setText('');
        setIsTypingComplete(false);

        for (let i = 0; i <= fullText.length; i++) {
            setText(fullText.substring(0, i));
            await new Promise(resolve => setTimeout(resolve, 40));
        }
        setIsTypingComplete(true);
    };

    const handleFirstClose = () => {
        setIsTypingComplete(false);
        setText('');

        setTimeout(() => {
            setCurrentBalloon(2);
            startTyping(balloon2Text);
        }, 500);
    };

    const handleSecondClose = () => {
        setIsFadingOut(true);
        localStorage.setItem('welcomeAnimationShown', 'true');

        setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 800);
    };

    if (!isVisible) return null;

    return (
        <div className={`edivaldo-helper ${isFadingOut ? 'fade-out' : ''}`}>
            <img src={edivaldoImg} alt="Edivaldo" className="edivaldo-avatar-large" />
            <div className={`edivaldo-speech-bubble-right ${!isTypingComplete && text === '' ? 'balloon-fade-out' : ''}`}>
                <p>
                    {text}
                    {!isTypingComplete && text !== '' && <span className="typing-cursor">|</span>}
                </p>
                {isTypingComplete && currentBalloon === 1 && (
                    <button onClick={handleFirstClose} className="edivaldo-close-btn">
                        Entendi
                    </button>
                )}
                {isTypingComplete && currentBalloon === 2 && (
                    <button onClick={handleSecondClose} className="edivaldo-close-btn">
                        <span className="calculator-icon">🧮</span> Entendi
                    </button>
                )}
            </div>
        </div>
    );
}
