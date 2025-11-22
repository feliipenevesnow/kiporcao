export interface Produto {
  id?: string;
  nome: string;
  categoria: string;
  descricao?: string;
  preco?: number;
  preco_media?: number;
  preco_inteira?: number;
  disponivel: boolean;
}