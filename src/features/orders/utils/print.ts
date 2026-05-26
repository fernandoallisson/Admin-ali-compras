import { statusLabels } from '@/features/orders/constants';
import { formatBrasiliaDate } from '@/shared/lib/dateTime';
import {
  getOrderItemName,
  getOrderItemQuantity,
  getOrderItemTotal,
  getOrderAddress,
  getOrderNeighborhood,
  getOrderPaymentMethod,
  getOrderStreetAddress,
  isDeliveryOrder,
} from '@/features/orders/utils/orderUtils';

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatMoney = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return (Number.isFinite(number) ? number : 0).toFixed(2).replace(".", ",");
};

export const printComanda = (
  order: any,
  orderItems: any[] = [],
  targetWindow?: Window | null,
) => {
  const subtotal = orderItems.reduce(
    (value, item) => value + getOrderItemTotal(item),
    0,
  );
  const delivery = isDeliveryOrder(order) ? order.taxa_entrega || 6.99 : 0;
  const total = order.total ?? order.valor_total ?? 0;
  const orderDate = order.realizado_em || order.criado_em || order.created_at || new Date();
  const orderNumber = escapeHtml(order.numero_pedido || order.id);
  const isDelivery = isDeliveryOrder(order);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Comanda ${orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; padding: 16px; font-size: 12px; color: #000; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .large { font-size: 15px; }
    .divider-solid { border-top: 1px solid #000; margin: 8px 0; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .row-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-bottom: 3px; }
    .obs { font-size: 10px; color: #555; margin: 0 0 5px 16px; font-style: italic; }
    p { margin-bottom: 4px; }
    .tag { display: inline-block; border: 1px solid #000; padding: 1px 6px; font-size: 11px; margin: 2px 0; }
  </style>
</head>
<body>
  <div class="center">
    <p class="large bold">SÃO JORGE SUPER</p>
    <p style="font-size:10px">CNPJ: 00.000.000/0001-00</p>
    <p style="font-size:10px">Rua São Jorge, 100 – Centro</p>
    <p style="font-size:10px">Tel: (11) 3000-0000</p>
  </div>
  <div class="divider-solid"></div>
  <div class="center">
    <p class="bold large">COMANDA DE PEDIDO</p>
    <p>Pedido: <span class="bold">${orderNumber}</span></p>
    <p>Data: ${escapeHtml(formatBrasiliaDate(orderDate, { dateStyle: "short", timeStyle: "medium" }))}</p>
    <span class="tag">${escapeHtml((order.tipo_pedido || order.type || "").toUpperCase())}</span>
  </div>
  <div class="divider"></div>
  <p><span class="bold">Cliente:</span> ${escapeHtml(order.cliente?.nome || order.customer || "Não informado")}</p>
  <p><span class="bold">Telefone:</span> ${escapeHtml(order.cliente?.telefone || order.phone || "Não informado")}</p>
  ${order.cpf_na_nota ? `<p><span class="bold">CPF na nota:</span> ${escapeHtml(order.cpf_na_nota_cpf || "Informado")}</p>` : ""}
  ${isDelivery ? `<p><span class="bold">Endereço:</span> ${escapeHtml(getOrderAddress(order))}</p><p><span class="bold">Bairro:</span> ${escapeHtml(getOrderNeighborhood(order))}</p>` : ""}
  <div class="divider"></div>
  <p class="bold" style="margin-bottom:6px">ITENS DO PEDIDO:</p>
  ${(Array.isArray(orderItems) ? orderItems : [])
    .map(
      (i) => `
    <div class="row">
      <span>${escapeHtml(getOrderItemQuantity(i))}x ${escapeHtml(getOrderItemName(i))}</span>
      <span>R$ ${formatMoney(getOrderItemTotal(i))}</span>
    </div>
    ${i.observacoes || i.obs ? `<p class="obs">Obs: ${escapeHtml(i.observacoes || i.obs)}</p>` : ""}
  `,
    )
    .join("")}
  <div class="divider"></div>
  <div class="row"><span>Subtotal</span><span>R$ ${formatMoney(orderItems.length > 0 ? subtotal : order.subtotal)}</span></div>
  ${isDelivery ? `<div class="row"><span>Taxa de entrega</span><span>R$ ${formatMoney(delivery)}</span></div>` : '<div class="row"><span>Retirada na loja</span><span>Grátis</span></div>'}
  <div class="row"><span>Desconto</span><span>R$ ${formatMoney(order.desconto)}</span></div>
  <div class="divider-solid"></div>
  <div class="row-total"><span>TOTAL A PAGAR</span><span>R$ ${formatMoney(total)}</span></div>
  <div class="divider"></div>
  <p><span class="bold">Pagamento:</span> ${escapeHtml(getOrderPaymentMethod(order, order.pagamento))}</p>
  <div class="divider-solid"></div>
  <div class="center" style="margin-top: 8px;">
    <p>Obrigado pela preferência!</p>
    <p class="bold" style="margin-top:4px">São Jorge Super</p>
    <p style="font-size:10px;margin-top:2px">www.saojorgesuper.com.br</p>
  </div>
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body>
</html>`;

  const win = targetWindow || window.open("", "_blank", "width=420,height=650");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

export const printBairroRoute = (bairro: string, bairroOrders: any[]) => {
  const total = bairroOrders.reduce(
    (a, o) => a + parseFloat(o.valor_total || o.total || 0),
    0,
  );
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Rota – ${bairro}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; padding: 16px; font-size: 12px; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .divider-solid { border-top: 1px solid #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    p { margin-bottom: 4px; }
    .order-block { border: 1px dashed #555; padding: 8px; margin-bottom: 8px; }
    .num { display: inline-block; width: 18px; height: 18px; border: 1px solid #000; text-align: center; line-height: 18px; margin-right: 4px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="center">
    <p class="bold" style="font-size:15px">SÃO JORGE SUPER</p>
    <p style="font-size:10px">FOLHA DE ROTA</p>
  </div>
  <div class="divider-solid"></div>
  <div class="center">
    <p class="bold" style="font-size:13px">BAIRRO: ${bairro.toUpperCase()}</p>
    <p>Data: ${formatBrasiliaDate(new Date(), { dateStyle: "short", timeStyle: "short" })}</p>
    <p>${bairroOrders.length} pedido${bairroOrders.length !== 1 ? "s" : ""} · R$ ${total.toFixed(2).replace(".", ",")}</p>
  </div>
  <div class="divider"></div>
  ${bairroOrders
    .map(
      (o, i) => `
    <div class="order-block">
      <p><span class="num">${i + 1}</span> <span class="bold">${o.numero_pedido || o.id}</span> – ${statusLabels[o.status] || o.status}</p>
      <p class="bold" style="margin-top:4px">${o.cliente?.nome || o.customer || "Não informado"}</p>
      <p>${o.cliente?.telefone || o.phone || "Não informado"}</p>
      <p>${getOrderStreetAddress(o)}</p>
      <div class="divider"></div>
      <div class="row"><span>Total</span><span class="bold">R$ ${parseFloat(
        o.valor_total || o.total || 0,
      )
        .toFixed(2)
        .replace(".", ",")}</span></div>
      <div class="row"><span>Pagamento</span><span>${getOrderPaymentMethod(o, o.pagamento)}</span></div>
    </div>
  `,
    )
    .join("")}
  <div class="divider-solid"></div>
  <div class="row bold"><span>TOTAL DA ROTA</span><span>R$ ${total.toFixed(2).replace(".", ",")}</span></div>
  <div style="margin-top:12px">
    <p>Entregador: _______________________</p>
    <p style="margin-top:8px">Saída: ______ Retorno: ______</p>
  </div>
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=420,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};
