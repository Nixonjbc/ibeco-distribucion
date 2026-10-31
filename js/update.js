// IBECO version updater. No writes to the financial ledger or localStorage.
(() => {
  const CURRENT_VERSION = '2026.10.31.8';
  const SITE_ROOT = new URL('../', document.currentScript.src);
  const manifestURL = new URL('version.json', SITE_ROOT);
  const previousRender = render;
  let availableVersion = null;
  const today = new Date();
  const holiday = today.getMonth() === 11 || (today.getMonth() === 0 && today.getDate() <= 6) || (today.getMonth() === 9 && today.getDate() >= 31) || today.getMonth() === 10;
  document.body.classList.toggle('ibeco-holiday', holiday);

  function updateArea() {
    return `<section class="panel ibeco-updater">
      <h2>Actualizar versión</h2>
      <p>Versión instalada: <strong>${CURRENT_VERSION}</strong></p>
      <button type="button" class="primary" onclick="ibecoCheckForUpdates()">↻ Buscar actualización</button><button type="button" onclick="ibecoForceRefresh()">Recargar versión</button>
      <p class="hint" id="ibeco-version-status" role="status">Comprobará si hay una versión nueva sin borrar tus registros.</p>
    </section>`;
  }

  render = function () {
    previousRender();
    if (page === 'settings') {
      document.querySelector('#content')?.insertAdjacentHTML('beforeend', updateArea());
    }

  };

  window.ibecoCheckForUpdates = async function () {
    const status = document.getElementById('ibeco-version-status');
    const button = document.querySelector('.ibeco-updater button');
    availableVersion = null;
    if (button) button.disabled = true;
    if (status) status.textContent = 'Consultando la última versión…';
    try {
      const url = new URL(manifestURL);
      url.searchParams.set('t', String(Date.now()));
      const response = await fetch(url, {cache: 'no-store'});
      if (!response.ok) throw Error('No se pudo consultar el servidor.');
      const manifest = await response.json();
      const latest = String(manifest.version || '');
      if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(latest)) throw Error('Versión del servidor inválida.');
      if (latest === CURRENT_VERSION) {
        if (status) status.textContent = 'Ya tienes la última versión (' + latest + '). Si no ves los cambios, pulsa Recargar versión.';
        return;
      }
      const cmp = (a,b) => a.split('.').map(Number).reduce((n,v,i) => n || v - Number(b.split('.')[i]),0);
      if (cmp(latest,CURRENT_VERSION) < 0) {
        if (status) status.textContent = 'Esta instalación ya es más reciente que la publicada.';
        return;
      }
      availableVersion = latest;
      if (status) status.textContent = 'Nueva versión ' + latest + ' disponible. Pulsa «Recargar versión» cuando quieras instalarla.';
    } catch (error) {
      if (status) status.textContent = 'No fue posible comprobar la actualización. Revisa tu conexión e inténtalo de nuevo.';
    } finally {
      if (button) button.disabled = false;
    }
  };

  window.ibecoForceRefresh = function () {
    const next = new URL('index.html', SITE_ROOT);
    if (availableVersion) next.searchParams.set('v', availableVersion);
    next.searchParams.set('fresh', String(Date.now()));
    window.location.replace(next.href);
  };

  render();
})();
