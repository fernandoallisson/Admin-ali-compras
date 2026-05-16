export type Category = {
  id: string;
  nome: string;
  slug: string;
  ordem_exibicao?: number;
  ativa: boolean;
  emoji?: string | null;
  categoria_pai_id?: string | null;
  categoria_pai_nome?: string | null;
  nivel?: number;
  caminho?: string;
  filhos?: Category[];
};

export type CategoryPayload = {
  nome: string;
  slug?: string;
  ativa: boolean;
  emoji?: string | null;
  ordem_exibicao?: number;
  categoria_pai_id?: string | null;
};
