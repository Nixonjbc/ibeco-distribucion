// IBECO update center. No financial-data or localStorage writes.
(() => {
  const DISPLAY_VERSION = '26.10.10';
  const BUILD = 2026103110;
  const SITE_ROOT = new URL('../', document.currentScript.src);
  const manifestURL = new URL('version.json', SITE_ROOT);
  const previousRender = render;
  let pendingRelease = null;
  let checking = false;
  const today = new Date();
  const holiday = today.getMonth() === 11 || (today.getMonth() === 0 && today.getDate() <= 6) || (today.getMonth() === 9 && today.getDate() >= 31) || today.getMonth() === 10;
  document.body.classList.toggle('ibeco-holiday', holiday);

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[character]);

  function updateArea() {
    return `<section class="panel ibeco-updater">
      <h2>Actualizaciones de IBECO</h2>
      <p>Versión instalada: <strong>${DISPLAY_VERSION}</strong></p>
      <button type="button" class="primary" id="ibeco-check-button" onclick="ibecoCheckForUpdates()">↻ Buscar actualización</button>
      <p class="hint" id="ibeco-version-status" role="status">Consulta si hay cambios disponibles. No se instalará nada sin tu autorización.</p>
      <div id="ibeco-release-notes" hidden></div>
      <button type="button" class="primary" id="ibeco-install-button" onclick="ibecoInstallUpdate()" hidden disabled>Actualizar ahora</button>
    </section>`;
  }

  render = function () {
    previousRender();
    if (page === 'settings') {
      document.querySelector('#content')?.insertAdjacentHTML('beforeend', updateArea());
    }
  };

  window.ibecoCheckForUpdates = async function () {
    if (checking) return;
    checking = true;
    pendingRelease = null;
    const status = document.getElementById('ibeco-version-status');
    const checkButton = document.getElementById('ibeco-check-button');
    const installButton = document.getElementById('ibeco-install-button');
    const details = document.getElementById('ibeco-release-notes');
    if (checkButton) checkButton.disabled = true;
    if (installButton) { installButton.hidden = true; installButton.disabled = true; }
    if (details) { details.hidden = true; details.replaceChildren(); }
    if (status) status.textContent = 'Buscando actualizaciones…';

    try {
      const url = new URL(manifestURL);
      url.searchParams.set('t', String(Date.now()));
      const response = await fetch(url, {cache: 'no-store'});
      if (!response.ok) throw Error('No se pudo consultar el servidor.');
      const manifest = await response.json();
      const build = Number(manifest.build);
      const displayVersion = String(manifest.displayVersion || '');
      if (!Number.isSafeInteger(build) || !/^\d{2}\.\d{2}\.\d+$/.test(displayVersion)) throw Error('Información de versión inválida.');

      if (build <= BUILD) {
        if (status) status.textContent = build === BUILD ?
          'IBECO está actualizado. Tienes la versión ' + DISPLAY_VERSION + '.' :
          'Esta instalación ya es más reciente que la publicada.';
        return;
      }
      // Never fabricate notes: show only changes provided with this release.
      const changes = Array.isArray(manifest.changes) ? manifest.changes.filter(change => typeof change === 'string' && change.trim()) : [];
      if (!changes.length) {
        if (status) status.textContent = 'Hay una nueva versión, pero el servidor no publicó sus novedades. No se habilita su instalación.';
        return;
      }
      pendingRelease = {build,version:displayVersion};
      if (status) status.textContent = 'Nueva versión ' + displayVersion + ' disponible.';
      if (details) {
        const title = document.createElement('h3');
        title.textContent = 'Qué hay de nuevo';
        details.append(title);
        if (manifest.date) {
          const date = document.createElement('p');
          date.className = 'hint';
          date.textContent = 'Publicada: ' + String(manifest.date);
          details.append(date);
        }
        const list = document.createElement('ul');
        for (const entry of changes) {
          const item = document.createElement('li');
          item.textContent = entry.trim();
          list.append(item);
        }
        details.append(list);
        details.hidden = false;
      }
      if (installButton) { installButton.hidden = false; installButton.disabled = false; }
    } catch (error) {
      if (status) status.textContent = 'No fue posible buscar actualizaciones. Comprueba tu conexión e inténtalo nuevamente.';
    } finally {
      checking = false;
      if (checkButton) checkButton.disabled = false;
    }
  };

  window.ibecoInstallUpdate = function () {
    if (!pendingRelease || pendingRelease.build <= BUILD) return;
    const url = new URL('index.html', SITE_ROOT);
    url.searchParams.set('v', String(pendingRelease.build));
    url.searchParams.set('fresh', String(Date.now()));
    // No extra confirmation: user already reviewed the release notes.
    window.location.replace(url.href);
  };

  render();
})();
