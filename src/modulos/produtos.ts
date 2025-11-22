import { supabase } from "../banco/supabase";
import type { Produto } from "../types";

const TABELA = "produtos";

export const buscarProdutos = async (): Promise<Produto[]> => {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .order('categoria', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const gerarNovoId = () => {
  return crypto.randomUUID();
}

export const adicionarProduto = async (produto: Omit<Produto, "id">, idCustomizado?: string) => {
  const novoProduto = {
    ...produto,
    ...(idCustomizado && { id: idCustomizado })
  };

  const { data, error } = await supabase
    .from(TABELA)
    .insert([novoProduto])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const editarProduto = async (id: string, dadosNovos: Partial<Produto>) => {
  const { error } = await supabase
    .from(TABELA)
    .update(dadosNovos)
    .eq('id', id);

  if (error) throw error;
};

export const removerProduto = async (id: string) => {
  const { error } = await supabase
    .from(TABELA)
    .delete()
    .eq('id', id);

  if (error) throw error;
};