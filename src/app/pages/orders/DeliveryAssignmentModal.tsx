import { CheckCircle2, Loader2, X } from "lucide-react";
import { PRIMARY } from "./constants";
import { getCourierVehicleLabel, getDeliveryLabel, getOrderAddress, getOrderNeighborhood } from "./utils";

type DeliveryAssignmentModalProps = {
  orders: any[];
  confirmStep: boolean;
  couriers: any[];
  routeDriverId: string;
  openRoutes: any[];
  selectedRouteId: string;
  loadingOpenRoutes: boolean;
  confirmingRoute: boolean;
  onClose: () => void;
  onDriverChange: (driverId: string) => void;
  onSelectRoute: (routeId: string) => void;
  onConfirmStepChange: (confirm: boolean) => void;
  onConfirm: () => void;
};

export function DeliveryAssignmentModal({
  orders,
  confirmStep,
  couriers,
  routeDriverId,
  openRoutes,
  selectedRouteId,
  loadingOpenRoutes,
  confirmingRoute,
  onClose,
  onDriverChange,
  onSelectRoute,
  onConfirmStepChange,
  onConfirm,
}: DeliveryAssignmentModalProps) {
  const selectedRoute = openRoutes.find((route) => route.id === selectedRouteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800">
              {confirmStep ? "Confirmar atualização da entrega" : "Adicionar pedidos à entrega"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {orders.length} pedido{orders.length !== 1 ? "s" : ""} não atribuído
              {orders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!confirmStep ? (
            <>
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Novos pedidos
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-lg px-3 py-2">
                      <div className="text-sm font-semibold text-gray-800">
                        {order.numero_pedido || order.id}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {order.cliente?.nome || order.customer || "Cliente"}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {getOrderNeighborhood(order)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Selecionar Entregador
                </label>
                {couriers.length === 0 ? (
                  <p className="text-sm text-red-500">Nenhum entregador disponível.</p>
                ) : (
                  <select
                    value={routeDriverId}
                    onChange={(event) => onDriverChange(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": PRIMARY } as any}
                  >
                    {couriers.map((courier: any) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.nome || courier.name} — {getCourierVehicleLabel(courier)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Entregas abertas deste entregador
                </label>
                {loadingOpenRoutes ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando entregas...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {openRoutes.map((route) => (
                      <button
                        key={route.id}
                        onClick={() => onSelectRoute(route.id)}
                        className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedRouteId === route.id ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-sm text-gray-800">
                              {route.routeName || `Entrega ${route.id.slice(0, 8)}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getDeliveryLabel(route)} · {(route.neighborhoods || []).join(", ") || "Sem bairro"}
                            </div>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                            {route.totalStops || 0} pedidos
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-500">
                          <span>{route.pendingCount || 0} pendentes</span>
                          <span>{route.deliveredCount || 0} concluídos</span>
                          {route.totalDistanceKm && <span>{route.totalDistanceKm} km</span>}
                          {route.totalDurationText && <span>{route.totalDurationText}</span>}
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => onSelectRoute("__new__")}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedRouteId === "__new__" ? "border-blue-300 bg-blue-50" : "border-dashed border-gray-300 hover:bg-gray-50"}`}
                    >
                      <div className="font-semibold text-sm text-gray-800">Criar nova entrega</div>
                      <div className="text-xs text-gray-500">
                        Ação explícita do balcão. A rota ainda não será otimizada.
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onConfirmStepChange(true)}
                  disabled={!routeDriverId || !selectedRouteId}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Entrega destino
                  </p>
                  {selectedRouteId === "__new__" ? (
                    <div>
                      <div className="font-semibold text-gray-800">Nova entrega</div>
                      <div className="text-xs text-gray-500">Será criada sem rota otimizada.</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-gray-800">
                        {selectedRoute?.routeName || "Entrega selecionada"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedRoute?.totalStops || 0} pedidos atuais · {selectedRoute?.pendingCount || 0} pendentes
                      </div>
                      <div className="text-xs text-gray-500">
                        {(selectedRoute?.neighborhoods || []).join(", ") || "Sem bairro"}
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Após confirmação
                  </p>
                  <div className="text-sm text-gray-700">
                    Total de pedidos: <strong>{(selectedRoute?.totalStops || 0) + orders.length}</strong>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Bairros:{" "}
                    {Array.from(
                      new Set([
                        ...(selectedRoute?.neighborhoods || []),
                        ...orders.map(getOrderNeighborhood),
                      ]),
                    ).join(", ")}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Pedidos adicionados
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-start justify-between gap-3 rounded-lg bg-white border border-gray-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {order.numero_pedido || order.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.cliente?.nome || order.customer || "Cliente"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {getOrderAddress(order)} · {getOrderNeighborhood(order)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onConfirmStepChange(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={confirmingRoute}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {confirmingRoute ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirmar
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
