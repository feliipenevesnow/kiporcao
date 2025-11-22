import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../banco/supabase';
import '../styles/global.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: senha,
            });

            if (error) throw error;

            navigate('/admin');
        } catch (error: any) {
            setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-body)',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                padding: '40px',
                borderRadius: 'var(--radius-md)',
                width: '100%',
                maxWidth: '400px',
                border: 'var(--glass-border)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-display)',
                    marginBottom: '30px',
                    fontSize: '2rem'
                }}>
                    Login Admin
                </h1>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: 'var(--glass-border)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                boxSizing: 'border-box'
                            }}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: 'var(--glass-border)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                boxSizing: 'border-box'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {erro && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger)',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? 'var(--secondary)' : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: 'var(--radius-sm)',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            border: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)'
                        }}
                    >
                        {loading ? 'ENTRANDO...' : 'ENTRAR'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '10px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Voltar ao Cardápio
                </button>
            </div>
        </div>
    );
}
