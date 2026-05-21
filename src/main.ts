import './styles.css';
import {
  agregarComponente,
  eliminarComponente,
  listarComponentes,
} from './core/casos-uso/agregarComponente';
import { validarPatron, validarComponenteEnTiempo } from './core/casos-uso/validarPatron';
import type { ComponenteArquitectura } from './core/entidades/ComponenteArquitectura';
import { LocalStorageRepo } from './infraestructura/adaptadores/localStorageRepo';
import { validarFormulario } from './infraestructura/validacion/componenteSchema';
import {
  obtenerDatosFormulario,
  renderCheckboxesDependencias,
  renderErroresForm,
  renderEstadoGlobal,
  renderListaComponentes,
  renderPanelValidacion,
  renderPreviewValidacion,
  renderShell,
} from './infraestructura/ui/ui';

const repositorio = new LocalStorageRepo();
let componentesCache: ComponenteArquitectura[] = [];

function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

async function refrescarUI(): Promise<void> {
  componentesCache = await listarComponentes(repositorio);
  const validacion = validarPatron(componentesCache);

  const lista = $('lista-componentes');
  const panel = $('panel-validacion');
  const contador = $('contador');
  const depsBox = $('deps-checkboxes');

  if (lista) lista.innerHTML = renderListaComponentes(componentesCache, componentesCache);
  if (panel) panel.innerHTML = renderPanelValidacion(validacion);
  if (contador) {
    contador.textContent = `${componentesCache.length} registrado${componentesCache.length !== 1 ? 's' : ''}`;
  }
  if (depsBox) depsBox.innerHTML = renderCheckboxesDependencias(componentesCache);

  renderEstadoGlobal(validacion.valido, componentesCache.length);
  enlazarBotonesEliminar();
  enlazarPreviewTiempoReal();
}

function enlazarBotonesEliminar(): void {
  document.querySelectorAll('.btn-eliminar').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLButtonElement).dataset.id;
      if (!id || !confirm('¿Eliminar este componente?')) return;
      const res = await eliminarComponente(id, repositorio);
      if (!res.exito) {
        alert(res.error ?? 'No se pudo eliminar');
        return;
      }
      await refrescarUI();
    });
  });
}

function enlazarPreviewTiempoReal(): void {
  const form = $('form-componente') as HTMLFormElement | null;
  if (!form) return;

  const actualizarPreview = (): void => {
    const datos = obtenerDatosFormulario(form);
    const zod = validarFormulario(datos);
    if (!zod.success) {
      renderPreviewValidacion([]);
      return;
    }

    const borrador: ComponenteArquitectura = {
      id: 'preview-temp',
      nombre: zod.data.nombre,
      tipo: zod.data.tipo,
      patron: zod.data.patron,
      dependencias: zod.data.dependencias,
      descripcion: zod.data.descripcion,
    };

    const errores = validarComponenteEnTiempo(borrador, componentesCache);
    renderPreviewValidacion(errores);
  };

  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', actualizarPreview);
    el.addEventListener('change', actualizarPreview);
  });
}

async function init(): Promise<void> {
  const app = $('app');
  if (!app) return;

  app.innerHTML = renderShell();

  const form = $('form-componente') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    renderErroresForm([]);

    const datosCrudos = obtenerDatosFormulario(form);
    const validacionZod = validarFormulario(datosCrudos);

    if (!validacionZod.success) {
      renderErroresForm(validacionZod.mensajes);
      return;
    }

    const resultado = await agregarComponente(
      {
        nombre: validacionZod.data.nombre,
        tipo: validacionZod.data.tipo,
        patron: validacionZod.data.patron,
        dependencias: validacionZod.data.dependencias,
        descripcion: validacionZod.data.descripcion,
      },
      repositorio
    );

    if (!resultado.exito) {
      renderErroresForm(
        resultado.errores ?? [resultado.error ?? 'Error al guardar']
      );
      return;
    }

    form.reset();
    await refrescarUI();
  });

  await refrescarUI();
}

init().catch(console.error);
