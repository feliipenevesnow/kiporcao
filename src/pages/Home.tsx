import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { buscarProdutos } from '../modulos/produtos';
import type { Produto } from '../types';
import Calculator from '../components/Calculator';
import EdivaldoHelper from '../components/EdivaldoHelper';
import ProductCard from '../components/ProductCard';
import AdSense from '../components/AdSense';
import DonationBanner from '../components/DonationBanner';
import '../styles/global.css';
import '../styles/pages/Home.css';

// Easing function for natural motion
const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [mostrarIndisponiveis, setMostrarIndisponiveis] = useState(false);

  // Scroll Animation States
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [shouldScrollCategories, setShouldScrollCategories] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  // Load products once
  useEffect(() => {
    async function carregar() {
      const dados = await buscarProdutos();
      setProdutos(dados);
      setLoading(false);
    }
    carregar();
  }, []);

  // Hide scroll hint after scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if welcome animation was already shown (for donation modal trigger)
  useEffect(() => {
    const hasShownAnimation = localStorage.getItem('welcomeAnimationShown') === 'true';
    if (hasShownAnimation) {
      // Animation was already shown, trigger modal timer immediately
      setAnimationFinished(true);
    }
  }, []);

  // Donation modal timer - shows after animation and every 1 minute
  useEffect(() => {
    if (!animationFinished) return;

    // Wait 10 seconds after animation finishes, then show modal
    const initialTimeout = setTimeout(() => {
      setShowDonationModal(true);
    }, 10000);

    // Then show every 1 minute
    const intervalId = setInterval(() => {
      setShowDonationModal(true);
    }, 60000); // 60000ms = 1 minute

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [animationFinished]);

  // Custom Smooth Scroll Function
  const smoothScrollTo = (element: HTMLElement, target: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const start = element.scrollLeft;
      const change = target - start;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        if (userInteracted) {
          resolve();
          return;
        }

        const elapsed = currentTime - startTime;
        if (elapsed < duration) {
          const t = easeInOutQuad(elapsed / duration);
          element.scrollLeft = start + change * t;
          animationRef.current = requestAnimationFrame(animateScroll);
        } else {
          element.scrollLeft = target;
          resolve();
        }
      };

      animationRef.current = requestAnimationFrame(animateScroll);
    });
  };

  // Category Scroll Animation Logic
  useEffect(() => {
    if (!shouldScrollCategories || userInteracted || scrollCount >= 3) return;

    const scrollContainer = categoryScrollRef.current;
    if (!scrollContainer) return;

    const performSequence = async () => {
      if (userInteracted) return;

      // Activate spotlight only on first run
      if (scrollCount === 0) {
        setIsSpotlightActive(true);
        // Small delay to let spotlight fade in
        await new Promise(r => setTimeout(r, 500));
      }

      if (userInteracted) {
        setIsSpotlightActive(false);
        return;
      }

      // 1. Scroll to end (Calmly - 2.5s)
      await smoothScrollTo(scrollContainer, scrollContainer.scrollWidth, 2500);

      if (userInteracted) {
        setIsSpotlightActive(false);
        return;
      }

      // 2. Pause (2s)
      await new Promise(r => setTimeout(r, 2000));

      if (userInteracted) {
        setIsSpotlightActive(false);
        return;
      }

      // 3. Scroll back to start (Calmly - 2.5s)
      await smoothScrollTo(scrollContainer, 0, 2500);

      // Deactivate spotlight
      if (scrollCount === 0) {
        setIsSpotlightActive(false);
      }

      // Increment count
      if (!userInteracted) {
        setScrollCount(prev => prev + 1);
      }
    };

    // First run immediately, subsequent runs after 5s
    const delay = scrollCount === 0 ? 100 : 5000;
    const timer = setTimeout(performSequence, delay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [shouldScrollCategories, userInteracted, scrollCount]);

  const handleInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setIsSpotlightActive(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  // Apply filters
  const produtosFiltrados = produtos.filter((produto) => {
    const matchTexto = produto.nome.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchCategoria = filtroCategoria ? produto.categoria === filtroCategoria : true;
    const matchDisponibilidade = mostrarIndisponiveis ? !produto.disponivel : produto.disponivel !== false;
    return matchTexto && matchCategoria && matchDisponibilidade;
  });

  // Group by category
  const produtosPorCategoria = produtosFiltrados.reduce((acc, produto) => {
    const cat = produto.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(produto);
    return acc;
  }, {} as Record<string, Produto[]>);

  const categoriasDisponiveis = [
    'Cervejas',
    'Refrigerantes',
    'Porções de Peixe',
    'Porções Variadas',
    'Sashimi',
    'Acompanhamentos',
    'Sucos',
    'Doses',
    'Caipirinhas',
    'Batidas',
  ];
  const categoriasParaMostrar = categoriasDisponiveis.filter((cat) => produtosPorCategoria[cat]?.length > 0);

  if (loading) return <div className="loading-screen">Carregando cardápio...</div>;

  return (
    <div className="cardapio-container">
      {/* Spotlight Overlay */}
      <div className={`spotlight-overlay ${isSpotlightActive ? 'active' : ''}`} />

      <header className="hero-header">
        <h1 className="brand-title">Ki Porção</h1>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="home-search-input"
          />
        </div>
        {/* Category pills */}
        <div
          className={`category-pills-scroll ${isSpotlightActive ? 'highlighted' : ''}`}
          ref={categoryScrollRef}
          onMouseDown={handleInteraction}
          onTouchStart={handleInteraction}
          onWheel={handleInteraction}
        >
          <button
            className={`pill ${filtroCategoria === null && !mostrarIndisponiveis ? 'active' : ''}`}
            onClick={() => { setFiltroCategoria(null); setMostrarIndisponiveis(false); handleInteraction(); }}
          >
            Disponíveis
          </button>
          {categoriasDisponiveis.map((cat) => (
            <button
              key={cat}
              className={`pill ${filtroCategoria === cat && !mostrarIndisponiveis ? 'active' : ''}`}
              onClick={() => { setFiltroCategoria(cat === filtroCategoria ? null : cat); setMostrarIndisponiveis(false); handleInteraction(); }}
            >
              {cat}
            </button>
          ))}
          <button
            className={`pill ${mostrarIndisponiveis ? 'active' : ''}`}
            style={{ borderColor: mostrarIndisponiveis ? 'var(--danger)' : undefined, color: mostrarIndisponiveis ? 'var(--danger)' : undefined }}
            onClick={() => { setMostrarIndisponiveis(!mostrarIndisponiveis); setFiltroCategoria(null); handleInteraction(); }}
          >
            Indisponíveis
          </button>
        </div>
      </header>

      {showScrollHint && produtos.length > 3 && (
        <div className="scroll-hint-minimal">↓</div>
      )}

      {categoriasParaMostrar.length === 0 ? (
        <div className="no-results">
          <p>Nenhum produto encontrado com esses filtros.</p>
          <button
            onClick={() => { setFiltroTexto(''); setFiltroCategoria(null); setMostrarIndisponiveis(false); }}
            className="clear-filters-btn"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        categoriasParaMostrar.map((categoria, index) => (
          <section
            key={categoria}
            className="category-section"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h2 className="category-title">{categoria}</h2>
            <div className="items-grid">
              {produtosPorCategoria[categoria].map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          </section>
        ))
      )}

      <div style={{ margin: '20px 0' }}>
        <AdSense slot="1234567890" />
      </div>

      <div style={{ marginTop: '50px' }}>
        <DonationBanner />
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
        <Link to="/admin" className="admin-link">
          Acesso Restrito
        </Link>
      </div>
      <EdivaldoHelper onFinish={() => {
        setShouldScrollCategories(true);
        setAnimationFinished(true);
      }} />
      <Calculator produtos={produtos} />

      {/* Donation Modal Popup */}
      {showDonationModal && (
        <DonationBanner isModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
}
