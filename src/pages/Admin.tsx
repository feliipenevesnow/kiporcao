import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Produto } from '../types';
import { adicionarProduto, buscarProdutos, editarProduto, removerProduto, gerarNovoId } from '../modulos/produtos';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../banco/supabase';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/global.css';
import '../styles/pages/Admin.css';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Cervejas');
  const [tipoPreco, setTipoPreco] = useState<'unico' | 'duplo'>('unico');
  const [preco, setPreco] = useState('');
  const [valor1, setValor1] = useState('');
  const [valor2, setValor2] = useState('');
  const [disponivel, setDisponivel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const carregarDados = async () => {
    setLoading(true);
    const lista = await buscarProdutos();
    lista.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setProdutos(lista);
    setLoading(false);
  };

  useEffect(() => {
    if (user) carregarDados();
  }, [user]);

  const limparFormulario = () => {
    setNome('');
    setCategoria('Cervejas');
    setTipoPreco('unico');
    setPreco('');
    setValor1('');
    setValor2('');
    setDisponivel(true);
    setIdEditando(null);
    setIsSaving(false);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEditar = (produto: Produto) => {
    setIdEditando(produto.id || null);
    setNome(produto.nome);
    setCategoria(produto.categoria);
    setDisponivel(produto.disponivel !== false);
    if (produto.preco_media !== null && produto.preco_inteira !== null) {
      setTipoPreco('duplo');
      setValor1(produto.preco_media ? String(produto.preco_media) : '');
      setValor2(produto.preco_inteira ? String(produto.preco_inteira) : '');
      setPreco('');
    } else {
      setTipoPreco('unico');
      setPreco(produto.preco ? String(produto.preco) : '');
      setValor1('');
      setValor2('');
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    limparFormulario();
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair', error);
      showToast('Erro ao sair', 'error');
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const dadosBase = { nome, categoria, disponivel };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const produtoParaSalvar: any = { ...dadosBase };
    if (tipoPreco === 'unico') {
      produtoParaSalvar.preco = Number(preco);
      produtoParaSalvar.preco_media = null;
      produtoParaSalvar.preco_inteira = null;
    } else {
      produtoParaSalvar.preco = null;
      produtoParaSalvar.preco_media = Number(valor1);
      produtoParaSalvar.preco_inteira = Number(valor2);
    }

    try {
      if (idEditando) {
        await editarProduto(idEditando, produtoParaSalvar);
        setProdutos(prev => prev.map(p => (p.id === idEditando ? { ...produtoParaSalvar, id: idEditando } : p)));
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        const novoId = gerarNovoId();
        await adicionarProduto(produtoParaSalvar, novoId);
        setProdutos(prev => [...prev, { ...produtoParaSalvar, id: novoId }]);
        showToast('Produto criado com sucesso!', 'success');
      }
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showToast('Erro ao salvar. Verifique sua conexão.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const solicitarExclusao = (id: string) => {
    setModalConfirmacao({ isOpen: true, id });
  };

  const confirmarExclusao = async () => {
    if (!modalConfirmacao.id) return;
    const id = modalConfirmacao.id;
    setModalConfirmacao({ isOpen: false, id: null });
    const backup = [...produtos];
    setProdutos(prev => prev.filter(p => p.id !== id));
    try {
      await removerProduto(id);
      showToast('Produto removido com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      showToast('Erro ao excluir no servidor.', 'error');
      setProdutos(backup);
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || p.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const getLabels = () => {
    if (categoria === 'Sucos') {
      return { tipo: 'Água / Leite', label1: 'Preço Água (R$)', label2: 'Preço Leite (R$)' };
    }
    if (['Porções de Peixe', 'Porções Variadas', 'Acompanhamentos', 'Sashimi'].includes(categoria)) {
      return { tipo: 'Média / Inteira', label1: 'Preço Média (R$)', label2: 'Preço Inteira (R$)' };
    }
    return { tipo: 'Duplo', label1: 'Valor 1', label2: 'Valor 2' };
  };
  const labels = getLabels();

  if (authLoading || !user) return <div className="loading-screen">Verificando acesso...</div>;

  return (
    <div className="cardapio-container">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Painel Admin</h1>
          <Link to="/" className="admin-back-link">← Voltar ao Cardápio</Link>
        </div>
        <div className="admin-stats">
          <span style={{ color: 'var(--text-secondary)' }}>{produtos.length} itens</span>
          <button onClick={handleLogout} className="btn-logout">SAIR</button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="admin-actions">
        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="admin-search"
        />
        <button onClick={abrirModalNovo} className="btn-new">+ NOVO</button>
      </div>

      {/* PRODUCT LIST */}
      <div className="items-grid">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>Nenhum produto encontrado.</p>
        ) : (
          produtosFiltrados.map(produto => (
            <div key={produto.id} className="admin-product-item">
              <div className="admin-product-info">
                <div className="admin-product-name">
                  {produto.nome}
                  <span className={`status-dot ${produto.disponivel !== false ? 'active' : 'inactive'}`} title={produto.disponivel !== false ? 'Disponível' : 'Indisponível'}></span>
                </div>
                <div className="admin-product-cat">{produto.categoria}</div>
              </div>

              <div className="admin-product-price">
                {produto.preco ? (
                  <span className="admin-price-val">R$ {produto.preco.toFixed(2)}</span>
                ) : (
                  <div className="admin-price-dual">
                    <div>
                      <span>{produto.categoria === 'Sucos' ? 'Água:' : 'Média:'}</span>
                      <b>R$ {produto.preco_media?.toFixed(2)}</b>
                    </div>
                    <div>
                      <span>{produto.categoria === 'Sucos' ? 'Leite:' : 'Inteira:'}</span>
                      <b>R$ {produto.preco_inteira?.toFixed(2)}</b>
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-item-actions">
                <button onClick={() => abrirModalEditar(produto)} className="btn-icon" title="Editar">
                  ✎
                </button>
                <button onClick={() => solicitarExclusao(produto.id!)} className="btn-icon delete" title="Excluir">
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM MODAL */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>{idEditando ? 'Editar' : 'Novo'} Produto</h2>
              <button onClick={fecharModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label className="form-label">Nome do Produto</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="form-input" placeholder="Ex: Sashimi de Salmão" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select value={categoria} onChange={e => { const nova = e.target.value; setCategoria(nova); if (!['Sucos', 'Porções de Peixe', 'Porções Variadas', 'Acompanhamentos', 'Sashimi'].includes(nova)) setTipoPreco('unico'); }} className="form-input">
                  <option value="Cervejas">Cervejas</option>
                  <option value="Refrigerantes">Refrigerantes</option>
                  <option value="Doses">Doses</option>
                  <option value="Caipirinhas">Caipirinhas</option>
                  <option value="Batidas">Batidas</option>
                  <option value="Porções de Peixe">Porções de Peixe</option>
                  <option value="Sashimi">Sashimi</option>
                  <option value="Porções Variadas">Porções Variadas</option>
                  <option value="Acompanhamentos">Acompanhamentos</option>
                  <option value="Sucos">Sucos</option>
                </select>
              </div>

              <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={disponivel} onChange={e => setDisponivel(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Produto Disponível</span>
                </label>
              </div>

              {['Sucos', 'Porções de Peixe', 'Porções Variadas', 'Acompanhamentos', 'Sashimi'].includes(categoria) && (
                <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label className="form-label">Tipo de Preço</label>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={tipoPreco === 'unico'} onChange={() => setTipoPreco('unico')} /> Único
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={tipoPreco === 'duplo'} onChange={() => setTipoPreco('duplo')} /> {labels.tipo}
                    </label>
                  </div>
                </div>
              )}

              {tipoPreco === 'unico' ? (
                <div className="form-group">
                  <label className="form-label">Valor (R$)</label>
                  <input type="number" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" className="form-input" />
                </div>
              ) : (
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">{labels.label1}</label>
                    <input type="number" value={valor1} onChange={e => setValor1(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-col">
                    <label className="form-label">{labels.label2}</label>
                    <input type="number" value={valor2} onChange={e => setValor2(e.target.value)} className="form-input" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={isSaving} className="btn-save">
                {isSaving ? 'SALVANDO...' : 'SALVAR PRODUTO'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmationModal
        isOpen={modalConfirmacao.isOpen}
        title="Excluir Produto"
        message="Tem certeza que deseja remover este item? Esta ação não pode ser desfeita."
        onConfirm={confirmarExclusao}
        onCancel={() => setModalConfirmacao({ isOpen: false, id: null })}
        confirmText="Sim, Excluir"
        isDestructive={true}
      />
    </div>
  );
}
