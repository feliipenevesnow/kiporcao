import type { Produto } from '../types';
import '../styles/components/ProductCard.css';

interface Props {
    produto: Produto;
}

export default function ProductCard({ produto }: Props) {
    const isUnavailable = !produto.disponivel;

    return (
        <div className={`product-card ${isUnavailable ? 'unavailable' : ''}`}>
            <div className="item-info">
                <div className="item-name">
                    {produto.nome}
                    {isUnavailable && (
                        <span className="badge-unavailable">✗ Indisponível</span>
                    )}
                </div>
            </div>

            <div className="price-container">
                {/* Single price */}
                {produto.preco && (
                    <span className="price-single">R$ {produto.preco.toFixed(2)}</span>
                )}

                {/* Dual price (media / inteira) */}
                {/* Dual price (media / inteira) */}
                {produto.preco_media && produto.preco_inteira && (
                    <div className="price-dual">
                        <div>
                            {produto.categoria.toLowerCase().includes('suco') ? 'Com Água' : 'Média'}: <b>R$ {produto.preco_media.toFixed(2)}</b>
                        </div>
                        <div>
                            {produto.categoria.toLowerCase().includes('suco') ? 'Com Leite' : 'Inteira'}: <b>R$ {produto.preco_inteira.toFixed(2)}</b>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
