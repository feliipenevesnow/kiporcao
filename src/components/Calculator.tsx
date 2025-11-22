import { useState, useEffect } from 'react';
import '../styles/components/Calculator.css';
import type { Produto } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AdSense from './AdSense';

// Definição dos tipos locais
interface CartItem extends Produto {
    cartId: string;
    quantidade: number;
    variacao?: string;
    precoUnitario: number;
}

interface CalculatorProps {
    produtos: Produto[];
}

export default function Calculator({ produtos }: CalculatorProps) {
    // --- ESTADOS GERAIS ---
    const [isOpen, setIsOpen] = useState(false); // Abre/Fecha o sistema da calculadora
    const [isSelectorOpen, setIsSelectorOpen] = useState(false); // Alterna entre Carrinho (false) e Busca (true)

    // --- ESTADOS DO CARRINHO ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isAdding, setIsAdding] = useState(false); // Trava para evitar cliques duplos

    // --- ESTADOS DA BUSCA/SELEÇÃO ---
    const [selectorSearch, setSelectorSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // --- ESTADOS DE VARIAÇÃO (MODAL DE ESCOLHA) ---
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
    const [showVariationModal, setShowVariationModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    // 1. CARREGAR CARRINHO SALVO
    useEffect(() => {
        const savedCart = localStorage.getItem('cardapio_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Erro ao recuperar carrinho", e);
            }
        }
    }, []);

    // 2. SALVAR CARRINHO AUTOMATICAMENTE
    useEffect(() => {
        localStorage.setItem('cardapio_cart', JSON.stringify(cart));
    }, [cart]);

    // --- FUNÇÕES DO CARRINHO ---

    const addToCart = (produto: Produto, variacao?: string, preco?: number) => {
        if (isAdding) return;
        setIsAdding(true);

        const precoFinal = preco || produto.preco || 0;
        // Cria um ID único combinando ID do produto + Variação (ex: "123-Média")
        const cartId = `${produto.id}-${variacao || 'unico'}`;

        setCart(prev => {
            const existing = prev.find(item => item.cartId === cartId);
            if (existing) {
                // Se já existe igual, só aumenta a quantidade
                return prev.map(item => item.cartId === cartId ? { ...item, quantidade: item.quantidade + 1 } : item);
            }
            // Se não, adiciona novo
            return [...prev, { ...produto, cartId, quantidade: 1, variacao, precoUnitario: precoFinal }];
        });

        // FECHA TUDO QUE FOR DE SELEÇÃO E VOLTA PRO CARRINHO
        setShowVariationModal(false);
        setSelectedProduct(null);
        setIsSelectorOpen(false); // Volta para a tela principal da calculadora
        setSelectorSearch('');

        // Destrava o clique após animação
        setTimeout(() => setIsAdding(false), 300);
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQty = item.quantidade + delta;
                // Se chegar a 0, remove? Aqui mantivemos > 0. Para remover usa o botão X.
                return newQty > 0 ? { ...item, quantidade: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        setShowClearModal(true);
    };

    const confirmClearCart = () => {
        setCart([]);
        setShowClearModal(false);
    };

    // Clique inicial no produto da lista
    const handleProductClick = (produto: Produto) => {
        if (isAdding) return;

        // Se tem variação (Preço Média/Inteira), abre modal de escolha
        if (produto.preco_media || produto.preco_inteira) {
            setSelectedProduct(produto);
            setShowVariationModal(true);
        } else {
            // Se é preço único, adiciona direto
            addToCart(produto);
        }
    };

    // Cálculo do Total
    const total = cart.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);

    // --- LÓGICA DE FILTROS NA BUSCA ---
    const filteredProducts = produtos.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(selectorSearch.toLowerCase());
        const matchCategory = categoryFilter ? p.categoria === categoryFilter : true;
        const isAvailable = p.disponivel !== false; // Só mostra disponíveis
        return matchSearch && matchCategory && isAvailable;
    });

    const categorias = ['Cervejas', 'Refrigerantes', 'Doses', 'Caipirinhas', 'Batidas', 'Porções de Peixe', 'Sashimi', 'Porções Variadas', 'Acompanhamentos', 'Sucos'];

    // --- RENDERIZAÇÃO ---

    // CENÁRIO 1: Calculadora Fechada (Botão Flutuante)
    if (!isOpen) {
        return (
            <button
                className="fab-calculator"
                onClick={() => setIsOpen(true)}
                aria-label="Abrir Calculadora"
            >
                🧮
                {cart.length > 0 && (
                    <span className="fab-badge">
                        {cart.reduce((acc, item) => acc + item.quantidade, 0)}
                    </span>
                )}
            </button>
        );
    }

    // CENÁRIO 2: Modo "Adicionar Itens" (Tela de Busca)
    if (isSelectorOpen) {
        return (
            <div className="selector-overlay" style={{ zIndex: 9999, display: 'flex' }}>
                <div className="selector-modal">
                    {/* Cabeçalho da Busca */}
                    <div className="selector-header">
                        <button
                            onClick={() => setIsSelectorOpen(false)}
                            className="close-btn-small"
                            title="Voltar para o carrinho"
                            style={{ fontSize: '1.2rem', marginRight: '10px', border: '1px solid #555', borderRadius: '50%', width: '32px', height: '32px' }}
                        >
                            ←
                        </button>

                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar produto..."
                            value={selectorSearch}
                            onChange={e => setSelectorSearch(e.target.value)}
                            className="selector-search"
                        />

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="filter-toggle-btn"
                            style={{
                                background: showFilters ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                color: showFilters ? '#fff' : 'var(--text-secondary)'
                            }}
                        >
                            Filtro
                        </button>
                    </div>

                    {/* Painel de Categorias (Expansível) */}
                    <div className={`filter-panel ${showFilters ? 'open' : ''}`}>
                        <div className="category-filters">
                            <button
                                className={`filter-chip ${categoryFilter === null ? 'active' : ''}`}
                                onClick={() => setCategoryFilter(null)}
                            >
                                Todos
                            </button>
                            {categorias.map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista de Resultados */}
                    <div className="selector-list">
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                Nenhum produto encontrado.
                            </div>
                        ) : (
                            filteredProducts.map(produto => {
                                const isSuco = produto.categoria.toLowerCase().includes('suco');
                                const labelMedia = isSuco ? 'Com Água' : 'Média';
                                const labelInteira = isSuco ? 'Com Leite' : 'Inteira';

                                return (
                                    <div
                                        key={produto.id}
                                        className="selector-item"
                                        onClick={() => handleProductClick(produto)}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#fff' }}>{produto.nome}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{produto.categoria}</div>
                                        </div>
                                        <div className="selector-price" style={{ color: 'var(--primary)', fontSize: '0.85rem', textAlign: 'right' }}>
                                            {produto.preco ? (
                                                `R$ ${produto.preco.toFixed(2)}`
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    {produto.preco_media && (
                                                        <span>{labelMedia}: R$ {produto.preco_media.toFixed(2)}</span>
                                                    )}
                                                    {produto.preco_inteira && (
                                                        <span>{labelInteira}: R$ {produto.preco_inteira.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sub-Modal: Variação (Apenas se necessário) */}
                {showVariationModal && selectedProduct && (
                    <div className="variation-overlay" style={{ zIndex: 10000 }}>
                        <div className="variation-modal">
                            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.2rem' }}>
                                {selectedProduct.nome}
                            </h4>

                            <div className="variation-options">
                                {(() => {
                                    const isSuco = selectedProduct.categoria.toLowerCase().includes('suco');
                                    const labelMedia = isSuco ? 'Com Água' : 'Média';
                                    const labelInteira = isSuco ? 'Com Leite' : 'Inteira';

                                    return (
                                        <>
                                            <button onClick={() => addToCart(selectedProduct, labelMedia, selectedProduct.preco_media!)}>
                                                {labelMedia} - <strong style={{ color: 'var(--primary)' }}>R$ {selectedProduct.preco_media?.toFixed(2)}</strong>
                                            </button>
                                            <button onClick={() => addToCart(selectedProduct, labelInteira, selectedProduct.preco_inteira!)}>
                                                {labelInteira} - <strong style={{ color: 'var(--primary)' }}>R$ {selectedProduct.preco_inteira?.toFixed(2)}</strong>
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>

                            <button
                                onClick={() => setShowVariationModal(false)}
                                className="cancel-btn"
                                style={{ marginTop: '15px', background: 'transparent', border: 'none', color: '#aaa', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // CENÁRIO 3: Modo Padrão (Carrinho Aberto)
    return (
        <div className="calculator-overlay" style={{ zIndex: 9999, display: 'flex' }}>
            <div className="calculator-modal">
                <div className="calc-header">
                    <h3>Meu Pedido</h3>
                    <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="clear-cart-btn"
                                title="Limpar Carrinho"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="close-btn" style={{ fontSize: '2rem', lineHeight: '1rem' }}>&times;</button>
                    </div>
                </div>

                <div className="calc-body">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                            <p style={{ fontSize: '3rem', marginBottom: '10px' }}>🛒</p>
                            <p>Seu carrinho está vazio.</p>
                            <p style={{ fontSize: '0.9rem' }}>Adicione itens para calcular o total.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartId} className="cart-item">
                                <div className="cart-item-info">
                                    <span className="cart-item-name" style={{ color: '#fff' }}>
                                        {item.nome}
                                    </span>
                                    {item.variacao && (
                                        <span className="cart-item-var" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)' }}>
                                            {item.variacao}
                                        </span>
                                    )}
                                    <div className="cart-item-price" style={{ marginTop: '4px', color: '#ccc' }}>
                                        R$ {item.precoUnitario.toFixed(2)}
                                    </div>
                                </div>

                                <div className="cart-controls">
                                    <button onClick={() => updateQuantity(item.cartId, -1)} style={{ width: '28px', height: '28px' }}>-</button>
                                    <span style={{ minWidth: '20px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{item.quantidade}</span>
                                    <button onClick={() => updateQuantity(item.cartId, 1)} style={{ width: '28px', height: '28px' }}>+</button>
                                    <button onClick={() => removeFromCart(item.cartId)} className="remove-btn" style={{ marginLeft: '10px' }}>×</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="calc-footer">
                    <div className="total-row">
                        <span>Total Estimado:</span>
                        <span className="total-value">R$ {total.toFixed(2)}</span>
                    </div>
                    <button
                        className="add-more-btn"
                        onClick={() => setIsSelectorOpen(true)}
                    >
                        + Adicionar Itens
                    </button>
                    <div style={{ marginTop: '10px' }}>
                        <AdSense slot="0987654321" style={{ display: 'block', textAlign: 'center' }} />
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={showClearModal}
                title="Limpar Carrinho"
                message="Tem certeza que deseja remover todos os itens do seu carrinho? Esta ação não pode ser desfeita."
                onConfirm={confirmClearCart}
                onCancel={() => setShowClearModal(false)}
                confirmText="Sim, limpar tudo"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
}