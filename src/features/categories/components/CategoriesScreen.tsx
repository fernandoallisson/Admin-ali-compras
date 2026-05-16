import { useMemo, useState } from 'react';
import { ChevronRight, Edit2, Plus, Power, Trash2, X } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { categoriesService } from '../services/categoriesService';
import { categorySchema } from '../schemas/categorySchema';
import type { Category } from '../types/category';

const PRIMARY = '#122a4c';

const levelLabels: Record<number, string> = {
  1: 'Departamento',
  2: 'Categoria',
  3: 'Subcategoria',
};

function buildTree(categories: Category[]) {
  const byId = new Map(categories.map((category) => [category.id, { ...category, filhos: [] as Category[] }]));
  const roots: Category[] = [];

  byId.forEach((category) => {
    if (category.categoria_pai_id && byId.has(category.categoria_pai_id)) {
      byId.get(category.categoria_pai_id)!.filhos!.push(category);
    } else {
      roots.push(category);
    }
  });

  const sortCategories = (items: Category[]) => {
    items.sort((a, b) => (a.ordem_exibicao ?? 0) - (b.ordem_exibicao ?? 0) || a.nome.localeCompare(b.nome));
    items.forEach((item) => sortCategories(item.filhos ?? []));
  };

  sortCategories(roots);
  return roots;
}

function CategoryForm({
  cat,
  categories,
  onClose,
  onSuccess,
}: {
  cat?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(cat?.nome ?? '');
  const [icon, setIcon] = useState(cat?.emoji ?? '🛒');
  const [status, setStatus] = useState(cat?.ativa === false ? 'Inativo' : 'Ativo');
  const [order, setOrder] = useState(String(cat?.ordem_exibicao ?? 0));
  const [parentId, setParentId] = useState(cat?.categoria_pai_id ?? '');
  const [loading, setLoading] = useState(false);
  const icons = ['🛒','🥛','🥤','🥦','🥩','🍞','🧹','🧴','❄️','🐾','🍎','🧂','🐟','🍷','🧃'];

  const parent = categories.find((category) => category.id === parentId);
  const targetLevel = parent ? (parent.nivel ?? 1) + 1 : 1;
  const parentOptions = categories.filter((category) => category.id !== cat?.id && (category.nivel ?? 1) < 3);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        nome: name,
        slug: categorySchema.buildSlug(name),
        ativa: status === 'Ativo',
        emoji: icon,
        ordem_exibicao: Number(order) || 0,
        categoria_pai_id: parentId || null,
      };

      if (cat?.id) {
        await categoriesService.updateCategory(cat.id, payload);
      } else {
        await categoriesService.createCategory(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving category', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">{cat ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {cat?.caminho && (
          <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600">
            Caminho atual: <span className="font-semibold text-gray-800">{cat.caminho}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Nome *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
              placeholder="Ex: Hortifruti"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Categoria pai</label>
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
              >
                <option value="">Sem pai - Departamento</option>
                {parentOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {'  '.repeat(Math.max((category.nivel ?? 1) - 1, 0))}
                    {category.emoji || '📁'} {category.caminho || category.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Ordem de exibição</label>
              <input
                value={order}
                onChange={e => setOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Será salvo como <strong>{levelLabels[targetLevel] || 'Nível inválido'}</strong> / nível {targetLevel}.
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Emoji</label>
            <div className="grid grid-cols-8 gap-2">
              {icons.map(ic => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className="w-9 h-9 rounded-lg text-xl flex items-center justify-center border-2 transition-colors"
                  style={{ borderColor: icon === ic ? PRIMARY : 'transparent', backgroundColor: icon === ic ? '#eef2f9' : '#f9fafb' }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Ativa</div>
              <div className="text-xs text-gray-400">Visível no app dos clientes</div>
            </div>
            <button
              type="button"
              onClick={() => setStatus(s => s === 'Ativo' ? 'Inativo' : 'Ativo')}
              className="relative inline-flex h-5 w-9 rounded-full transition-colors"
              style={{ backgroundColor: status === 'Ativo' ? PRIMARY : '#d1d5db' }}
            >
              <span
                className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5"
                style={{ transform: `translateX(${status === 'Ativo' ? 18 : 2}px)` }}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading || !name.trim() || targetLevel > 3} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
            {loading ? 'Salvando...' : (cat ? 'Salvar' : 'Criar')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  depth: number;
  onEdit: (category: Category) => void;
  onToggle: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_120px_180px_100px_110px] gap-3 items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
        <div className="min-w-0" style={{ paddingLeft: depth * 22 }}>
          <div className="flex items-center gap-2 min-w-0">
            {depth > 0 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            <span className="text-xl">{category.emoji || '📁'}</span>
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 truncate">{category.nome}</div>
              <div className="text-xs text-gray-400 truncate">{category.caminho || category.nome}</div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block text-xs text-gray-600">{levelLabels[category.nivel ?? 1]}</div>
        <div className="hidden lg:block text-xs text-gray-500 truncate">{category.categoria_pai_nome || '-'}</div>
        <div className="hidden lg:block text-xs text-gray-500">{category.ordem_exibicao ?? 0}</div>

        <div className="flex items-center justify-end gap-1">
          <span
            className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium mr-1"
            style={category.ativa
              ? { backgroundColor: '#f0fdf4', color: '#16a34a' }
              : { backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            {category.ativa ? 'Ativa' : 'Inativa'}
          </span>
          <button onClick={() => onEdit(category)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Editar">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onToggle(category)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title={category.ativa ? 'Desativar' : 'Ativar'}>
            <Power className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(category)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Excluir">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {(category.filhos ?? []).map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

export function CategoriesScreen() {
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const { categories, fetchCategories, loading, toggle } = useCategories();
  const tree = useMemo(() => buildTree(categories), [categories]);

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Excluir "${category.nome}"? Categorias com filhos ou produtos vinculados serão bloqueadas pelo sistema.`)) return;

    try {
      await categoriesService.deleteCategory(category.id);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category', error);
    }
  };

  return (
    <div className="p-5 overflow-y-auto flex-1 h-full">
      {editing !== undefined && (
        <CategoryForm
          cat={editing}
          categories={categories}
          onClose={() => setEditing(undefined)}
          onSuccess={fetchCategories}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-900 font-semibold">Categorias</h2>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categorias cadastradas</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: PRIMARY }}
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" style={{ borderColor: `${PRIMARY}40`, borderTopColor: PRIMARY }}></div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden lg:grid grid-cols-[1fr_120px_180px_100px_110px] gap-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <span>Nome e caminho</span>
            <span>Nível</span>
            <span>Pai</span>
            <span>Ordem</span>
            <span className="text-right">Ações</span>
          </div>
          {tree.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              depth={0}
              onEdit={setEditing}
              onToggle={(cat) => toggle(cat.id, cat.ativa)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
