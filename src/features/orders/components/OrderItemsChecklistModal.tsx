import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Package, X } from "lucide-react";
import {
  getOrderItemChecklistId,
  getOrderItemName,
  getOrderItemQuantity,
} from "@/features/orders/utils/orderUtils";

type Props = {
  order: any;
  items: any[];
  loading: boolean;
  error: string;
  onClose: () => void;
};

const getStorageKey = (orderId: string) => `order-product-checklist:${orderId}`;

export function OrderItemsChecklistModal({
  order,
  items,
  loading,
  error,
  onClose,
}: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const storageKey = getStorageKey(String(order.id));

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setChecked(stored ? JSON.parse(stored) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  const productKeys = useMemo(
    () => items.map((item, index) => getOrderItemChecklistId(item, index)),
    [items],
  );
  const checkedCount = productKeys.filter((key) => checked[key]).length;

  const persist = (next: Record<string, boolean>) => {
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // The checklist remains usable for this session if storage is blocked.
    }
  };

  const toggleItem = (key: string) => {
    persist({ ...checked, [key]: !checked[key] });
  };

  const clearChecks = () => {
    persist({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Package className="h-4 w-4 text-[#122a4c]" />
              Produtos do pedido
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Pedido {order.numero_pedido || order.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
            <span className="text-sm text-gray-600">
              {checkedCount} de {items.length} separado
              {checkedCount !== 1 ? "s" : ""}
            </span>
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={clearChecks}
                className="text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                Limpar marcações
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="py-8 text-center text-sm text-gray-500">
              Carregando produtos...
            </p>
          )}
          {!loading && error && (
            <p className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              Nenhum produto encontrado para este pedido.
            </p>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, index) => {
                const key = getOrderItemChecklistId(item, index);
                const isChecked = Boolean(checked[key]);

                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      isChecked
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(key)}
                      className="mt-0.5 h-4 w-4 accent-green-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-medium ${
                          isChecked
                            ? "text-green-800 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {getOrderItemQuantity(item)}x {getOrderItemName(item)}
                      </div>
                      {(item.observacoes || item.obs) && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          Obs.: {item.observacoes || item.obs}
                        </p>
                      )}
                    </div>
                    {isChecked && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
