// IBECO version updater. No writes to the financial ledger or localStorage.
(() => {
  const CURRENT_VERSION = '2026.10.31.4';
  const SITE_ROOT = new URL('./', document.currentScript.src);
  const manifestURL = new URL('version.json', SITE_ROOT);
  const previousRender = render;

  function updateArea() {
    return `<section class="panel ibeco-updater">
      <h2>Actualizaciones</h2>
      <p>Versión instalada: <strong>${CURRENT_VERSION}</strong></p>
      <button type="button" class="primary" onclick="ibecoCheckForUpdates()">↻ Actualizar versión</button>
      <p class="hint" id="ibeco-version-status" role="status">Comprobará si hay una versión nueva sin borrar tus registros.</p>
    </section>`;
  }

  render = function () {
    previousRender();
    if (page === 'settings') {
      document.querySelector('#content')?.insertAdjacentHTML('beforeend', updateArea());
    }
    if (page === 'home') {
      const settingsButton = [...document.querySelectorAll('#content button')].find(el => el.textContent.includes('Configuración'));
      if (settingsButton) settingsButton.insertAdjacentHTML('beforebegin', `<button type="button" class="ibeco-update-shortcut" onclick="page='settings';render()">↻ Actualizar versión</button>`);
      else document.querySelector('#content')?.insertAdjacentHTML('beforeend', `<button type="button" class="ibeco-update-shortcut" onclick="page='settings';render()">↻ Actualizar versión</button>`);
    }
  };

  window.ibecoCheckForUpdates = async function () {
    const status = document.getElementById('ibeco-version-status');
    const button = document.querySelector('.ibeco-updater button');
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
        if (status) status.textContent = 'Ya tienes la última versión (' + latest + ').';
        return;
      }
      const cmp = (a,b) => a.split('.').map(Number).reduce((n,v,i) => n || v - Number(b.split('.')[i]),0);
      if (cmp(latest,CURRENT_VERSION) < 0) {
        if (status) status.textContent = 'Esta instalación ya es más reciente que la publicada.';
        return;
      }
      if (status) status.textContent = 'Versión ' + latest + ' disponible. Recargando sin borrar tus datos…';
      const next = new URL('index.html', SITE_ROOT);
      next.searchParams.set('v', latest);
      next.searchParams.set('fresh', String(Date.now()));
      // Same origin and scope: installed iPhone icon and its localStorage remain unchanged.
      window.location.replace(next.href);
    } catch (error) {
      if (status) status.textContent = 'No fue posible comprobar la actualización. Revisa tu conexión e inténtalo de nuevo.';
    } finally {
      if (button) button.disabled = false;
    }
  };

  render();
})();
