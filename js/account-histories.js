// Independent, read-only history screens for the supplier debt and the cash wallet.
// Financial calculations and saved data remain in the existing Engine and state.
const ibecoPreviousRender = render;

function ibecoAccountEntries(kind) {
  const types = kind === 'debt'
    ? new Set(['receive', 'payment', 'supplierReturn'])
    : new Set(['collection', 'payment', 'expense']);
  return state.entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => types.has(entry.type))
    .sort((a, b) => a.entry.date.localeCompare(b.entry.date) || a.index - b.index);
}

function ibecoAccountDelta(kind, entry) {
  if (entry.void) return 0;
  if (kind === 'debt') return entry.type === 'receive' ? entry.amount : -entry.amount;
  return entry.type === 'collection' ? entry.amount : -entry.amount;
}

function ibecoAccountDetail(entry) {
  if (entry.type === 'collection') {
    const name = state.clients.find(c => c.id === entry.client)?.name || 'Cliente';
    return name + (entry.note ? ' · ' + entry.note : '');
  }
  const goods = (entry.lines || []).map(line => {
    const name = state.products.find(p => p.id === line.product)?.name || 'Producto';
    return line.qty + ' cartones de ' + name;
  }).join(' · ');
  return goods || entry.note || (entry.type === 'expense' ? 'Gasto personal' : 'IBECO');
}

function ibecoShowAccount(kind) {
  page = kind === 'debt' ? 'ibecoDebtHistory' : 'ibecoCashHistory';
  render();
  window.scrollTo?.(0, 0);
}

function ibecoAccountPage(kind) {
  const isDebt = kind === 'debt';
  const title = isDebt ? 'Deuda con IBECO' : 'Dinero disponible';
  const entries = ibecoAccountEntries(kind);
  let running = 0;
  const rows = entries.map(({ entry }) => {
    const delta = ibecoAccountDelta(kind, entry);
    running += delta;
    const incoming = delta > 0;
    const outgoing = delta < 0;
    return `<button type="button" class="ibeco-history-entry" onclick="receipt('${entry.id}')" aria-label="Ver comprobante ${esc(names[entry.type])} del ${esc(entry.date)}">
      <span class="ibeco-history-when">${esc(entry.date)}</span>
      <span class="ibeco-history-what"><strong>${esc(names[entry.type])}${entry.void ? ' · ANULADO' : ''}</strong><small>${esc(ibecoAccountDetail(entry))}</small></span>
      <span class="ibeco-history-in">${incoming ? '+' + money(delta) : '—'}</span>
      <span class="ibeco-history-out">${outgoing ? '−' + money(-delta) : '—'}</span>
      <strong class="ibeco-history-balance">${money(running)}</strong>
    </button>`;
  }).join('');
  const current = E.totals(state);
  const total = isDebt ? current.debt : current.cash;
  $('#title').textContent = title;
  $('#content').innerHTML = `<button type="button" class="ibeco-back" onclick="page='supplier';render()">‹ Volver a IBECO</button>
    <section class="ibeco-history-summary ${isDebt ? 'ibeco-debt' : 'ibeco-cash'}">
      <small>${isDebt ? 'SALDO PENDIENTE CON IBECO' : 'EFECTIVO DISPONIBLE'}</small>
      <div class="ibeco-history-total">${money(total)}</div>
      <p>${isDebt ? 'Recepciones, pagos y devoluciones al proveedor' : 'Abonos de clientes, pagos a IBECO y gastos personales'}</p>
    </section>
    <section class="panel ibeco-history-panel">
      <h2>${isDebt ? 'Historial de deuda' : 'Historial de cartera'}</h2>
      <p class="hint">Toca cualquier movimiento para abrir su comprobante. Los anulados permanecen visibles sin alterar el saldo.</p>
      <div class="ibeco-history-scroll" role="region" aria-label="${title} — movimientos" tabindex="0">
        <div class="ibeco-history-head"><span>Fecha</span><span>Movimiento / detalle</span><span>Entrada</span><span>Salida</span><span>Saldo</span></div>
        ${rows || '<div class="empty">Todavía no hay movimientos en este historial.</div>'}
      </div>
    </section>`;
  // Highlight IBECO navigation for both dedicated ledger screens.
  $('#nav').querySelectorAll('button').forEach(b => {
    const isSupplier = b.textContent.trim().toLowerCase().includes('ibeco');
    b.classList.toggle('active', isSupplier);
  });
}

render = function () {
  ibecoPreviousRender();
  if (page === 'supplier') {
    const summaryCards = document.querySelectorAll('#content .account-card');
    summaryCards.forEach((card, index) => {
      const kind = index === 0 ? 'debt' : 'cash';
      card.classList.add('ibeco-history-link');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', kind === 'debt' ? 'Ver historial de deuda con IBECO' : 'Ver historial de dinero disponible');
      card.onclick = () => ibecoShowAccount(kind);
      card.onkeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ibecoShowAccount(kind);
        }
      };
      card.insertAdjacentHTML('beforeend', '<span class="ibeco-card-chevron" aria-hidden="true">›</span>');
    });
    // The two balances now open full ledger screens instead of an infinitely long dashboard list.
    [...document.querySelectorAll('#content > .panel')].forEach(panel => {
      if (panel.querySelector('h2')?.textContent.includes('Historial de mi cuenta')) panel.remove();
    });
  } else if (page === 'ibecoDebtHistory' || page === 'ibecoCashHistory') {
    ibecoAccountPage(page === 'ibecoDebtHistory' ? 'debt' : 'cash');
  }
};
render();
