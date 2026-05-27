import type { ComponenteArquitectura, TipoComponente } from '../../core/entidades/ComponenteArquitectura';
import type { ResultadoValidacion } from '../../core/casos-uso/validarPatron';

const TIPO_LABELS: Record<TipoComponente, string> = {
  servicio: 'Servicio',
  api: 'API',
  'base-datos': 'Base de datos',
  ui: 'UI',
  cola: 'Cola / Mensajería',
};

const PATRON_LABELS: Record<ComponenteArquitectura['patron'], string> = {
  hexagonal: 'Hexagonal',
  mvc: 'MVC',
  microservicio: 'Microservicio',
  monolito: 'Monolito',
};

function badgeClass(tipo: TipoComponente): string {
  const map: Record<TipoComponente, string> = {
    servicio: 'badge-servicio',
    api: 'badge-api',
    'base-datos': 'badge-db',
    ui: 'badge-ui',
    cola: 'badge-cola',
  };
  return `badge ${map[tipo]}`;
}

export function renderShell(): string {
  return `
    <div class="min-h-screen bg-gray-900">
      <header class="border-b border-orange-900 bg-gray-950/90 backdrop-blur-md sticky top-0 z-10">
        <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-700 font-bold text-gray-900">AC</div>
            <div>
              <h1 class="text-xl font-bold tracking-tight text-orange-300">ArchiCode</h1>
              <p class="text-xs text-gray-400">Validador de arquitectura de software</p>
            </div>
          </div>
          <div id="estado-global" class="text-sm text-orange-300"></div>
        </div>
      </header>

          <main class="mx-auto max-w-6xl px-2 py-4 sm:px-4 sm:py-8">
            <div class="grid gap-6 grid-cols-1">
              <section class="space-y-6">
                <div class="rounded-xl border border-gray-800 bg-gray-800/80 p-4 sm:p-6 animate-in">
                  <h2 class="text-base sm:text-lg font-semibold mb-2 text-orange-300">Nuevo componente</h2>
                  <p class="text-xs sm:text-sm text-orange-200 mb-4 sm:mb-5">Tipado fuerte + validación Zod en tiempo real</p>
                  <form id="form-componente" class="space-y-4 sm:space-y-5" novalidate>
                    <div>
                      <label class="block text-xs sm:text-sm font-medium text-orange-200 mb-1" for="nombre">Nombre</label>
                      <input class="input-field text-sm sm:text-base py-2 sm:py-3 min-h-[40px] bg-gray-900 border border-orange-700 text-orange-100 placeholder:text-gray-500 focus:border-orange-400" id="nombre" name="nombre" type="text" placeholder="ej. AuthService" required />
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs sm:text-sm font-medium text-orange-200 mb-1" for="tipo">Tipo</label>
                        <select class="input-field text-sm sm:text-base py-2 sm:py-3 min-h-[40px] bg-gray-900 border border-orange-700 text-orange-100 focus:border-orange-400" id="tipo" name="tipo">
                          <option value="servicio">Servicio</option>
                          <option value="api">API</option>
                          <option value="base-datos">Base de datos</option>
                          <option value="ui">UI</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm font-medium text-orange-200 mb-1" for="patron">Patrón</label>
                        <select class="input-field text-sm sm:text-base py-2 sm:py-3 min-h-[40px] bg-gray-900 border border-orange-700 text-orange-100 focus:border-orange-400" id="patron" name="patron">
                          <option value="hexagonal">Hexagonal</option>
                          <option value="mvc">MVC</option>
                          <option value="microservicio">Microservicio</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm font-medium text-orange-200 mb-1" for="descripcion">Descripción (opcional)</label>
                      <textarea class="input-field text-sm sm:text-base py-2 sm:py-3 min-h-[40px] resize-none bg-gray-900 border border-orange-700 text-orange-100 placeholder:text-gray-500 focus:border-orange-400" id="descripcion" name="descripcion" rows="2" placeholder="Responsabilidad del componente"></textarea>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm font-medium text-orange-200 mb-1">Dependencias</label>
                      <div id="deps-checkboxes" class="max-h-24 sm:max-h-36 overflow-y-auto rounded-lg border border-orange-800 bg-gray-900/70 p-2 sm:p-3 space-y-2 text-xs sm:text-sm text-orange-200">
                        <p class="text-gray-500 italic">Agregá componentes para poder enlazarlos</p>
                      </div>
                    </div>
                    <div id="errores-form" class="hidden rounded-lg border border-red-500/40 bg-red-500/10 p-2 sm:p-3 text-xs sm:text-sm text-red-300"></div>
                    <div id="preview-validacion" class="hidden rounded-lg border p-2 sm:p-3 text-xs sm:text-sm"></div>
                    <button type="submit" class="w-full text-sm sm:text-base py-2 sm:py-3 min-h-[40px] rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition">Agregar componente</button>
                  </form>
                </div>
              </section>

              <section class="space-y-6 sm:space-y-8">
                <div id="panel-validacion" class="rounded-xl border border-gray-800 bg-gray-800/80 p-4 sm:p-6 animate-in"></div>
                <div class="rounded-xl border border-gray-800 bg-gray-800/80 p-4 sm:p-6 animate-in">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
                    <h2 class="text-base sm:text-lg font-semibold text-orange-300">Componentes</h2>
                    <span id="contador" class="text-xs sm:text-sm text-orange-200">0 registrados</span>
                  </div>
                  <div id="lista-componentes" class="space-y-2 sm:space-y-3"></div>
                </div>
              </section>
            </div>
          </main>

      <footer class="border-t border-orange-900 py-6 text-center text-xs text-orange-200 bg-gray-950">
        ArchiCode · TypeScript + Zod + Arquitectura Hexagonal · Persistencia localStorage
      </footer>
    </div>
  `;
}

export function renderListaComponentes(
  componentes: ComponenteArquitectura[],
  todos: ComponenteArquitectura[]
): string {
  if (componentes.length === 0) {
    return `
      <div class="rounded-lg border border-dashed border-slate-600 py-12 text-center text-slate-500">
        <p>No hay componentes aún.</p>
        <p class="text-sm mt-1">Creá el primero con el formulario.</p>
      </div>
    `;
  }

  return componentes
    .map((c) => {
      const depNombres = c.dependencias
        .map((id) => todos.find((t) => t.id === id)?.nombre ?? id)
        .join(', ');
      return `
        <article class="rounded-lg border border-slate-700 bg-slate-800/40 p-4 flex flex-wrap gap-3 justify-between items-start animate-in" data-id="${c.id}">
          <div class="flex-1 min-w-[200px]">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="font-semibold">${escapeHtml(c.nombre)}</h3>
              <span class="${badgeClass(c.tipo)}">${TIPO_LABELS[c.tipo]}</span>
              <span class="badge bg-slate-600/40 text-slate-300">${PATRON_LABELS[c.patron]}</span>
            </div>
            ${c.descripcion ? `<p class="text-sm text-slate-400">${escapeHtml(c.descripcion)}</p>` : ''}
            <p class="text-xs text-slate-500 mt-2 mono">ID: ${c.id}</p>
            ${
              c.dependencias.length
                ? `<p class="text-xs text-slate-400 mt-1">Depende de: <span class="text-sky-300">${escapeHtml(depNombres)}</span></p>`
                : '<p class="text-xs text-slate-500 mt-1">Sin dependencias</p>'
            }
          </div>
          <button type="button" class="btn-ghost text-red-400 hover:text-red-300 hover:border-red-500/50 btn-eliminar" data-id="${c.id}">
            Eliminar
          </button>
        </article>
      `;
    })
    .join('');
}

export function renderCheckboxesDependencias(
  componentes: ComponenteArquitectura[],
  seleccionados: string[] = []
): string {
  if (componentes.length === 0) {
    return '<p class="text-slate-500 italic">Agregá componentes para poder enlazarlos</p>';
  }
  return componentes
    .map(
      (c) => `
      <label class="flex items-center gap-2 cursor-pointer hover:text-slate-200">
        <input type="checkbox" name="dependencias" value="${c.id}" class="rounded border-slate-600 text-sky-500 focus:ring-sky-500" ${
          seleccionados.includes(c.id) ? 'checked' : ''
        } />
        <span>${escapeHtml(c.nombre)} <span class="text-slate-500">(${TIPO_LABELS[c.tipo]})</span></span>
      </label>
    `
    )
    .join('');
}

export function renderPanelValidacion(resultado: ResultadoValidacion): string {
  const icono = resultado.valido ? '✓' : '✕';
  const titulo = resultado.valido
    ? 'Arquitectura válida'
    : 'Se detectaron violaciones';

  return `
    <div class="flex items-start gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        resultado.valido ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      } text-lg font-bold">${icono}</div>
      <div class="flex-1">
        <h2 class="text-lg font-semibold">${titulo}</h2>
        <p class="text-sm text-slate-400 mt-0.5">Validación de patrones y dependencias circulares</p>
        ${
          resultado.errores.length
            ? `<ul class="mt-3 space-y-1.5 text-sm text-red-300">${resultado.errores
                .map((e) => `<li class="flex gap-2"><span>•</span><span>${escapeHtml(e)}</span></li>`)
                .join('')}</ul>`
            : '<p class="mt-2 text-sm text-emerald-300">No hay errores de arquitectura.</p>'
        }
        ${
          resultado.advertencias.length
            ? `<ul class="mt-3 space-y-1 text-sm text-amber-300/90">${resultado.advertencias
                .map((a) => `<li>⚠ ${escapeHtml(a)}</li>`)
                .join('')}</ul>`
            : ''
        }
      </div>
    </div>
  `;
}

export function renderErroresForm(mensajes: string[]): void {
  const el = document.getElementById('errores-form');
  if (!el) return;
  if (mensajes.length === 0) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }
  el.classList.remove('hidden');
  el.innerHTML = `<ul class="space-y-1">${mensajes.map((m) => `<li>• ${escapeHtml(m)}</li>`).join('')}</ul>`;
}

export function renderPreviewValidacion(errores: string[]): void {
  const el = document.getElementById('preview-validacion');
  if (!el) return;
  if (errores.length === 0) {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  el.className =
    'rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200';
  el.innerHTML = `<strong class="block mb-1">Vista previa — posibles problemas:</strong><ul class="space-y-0.5">${errores
    .slice(0, 3)
    .map((e) => `<li>• ${escapeHtml(e)}</li>`)
    .join('')}</ul>`;
}

export function renderEstadoGlobal(valido: boolean, total: number): void {
  const el = document.getElementById('estado-global');
  if (!el) return;
  el.innerHTML = valido
    ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400"><span class="h-2 w-2 rounded-full bg-emerald-400"></span>${total} componentes · OK</span>`
    : `<span class="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-red-400"><span class="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>Revisar arquitectura</span>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function obtenerDatosFormulario(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const deps = form.querySelectorAll<HTMLInputElement>('input[name="dependencias"]:checked');
  return {
    nombre: fd.get('nombre')?.toString() ?? '',
    tipo: fd.get('tipo')?.toString() ?? 'servicio',
    patron: fd.get('patron')?.toString() ?? 'hexagonal',
    descripcion: fd.get('descripcion')?.toString() ?? '',
    dependencias: Array.from(deps).map((d) => d.value),
  };
}
