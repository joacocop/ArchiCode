import type {
  ComponenteArquitectura,
  ResultadoOperacion,
} from '../entidades/ComponenteArquitectura';
import type { RepositorioComponentes } from '../puertos/repositorioComponentes';
import { generarId } from '../utilidades/genericos';
import { validarComponenteEnTiempo } from './validarPatron';

export interface DatosComponenteValidado {
  nombre: string;
  tipo: ComponenteArquitectura['tipo'];
  patron: ComponenteArquitectura['patron'];
  dependencias: string[];
  descripcion?: string;
}

export async function agregarComponente(
  datos: DatosComponenteValidado,
  repositorio: RepositorioComponentes
): Promise<ResultadoOperacion<ComponenteArquitectura>> {
  const existentes = await repositorio.obtenerTodos();

  const nombreDuplicado = existentes.some(
    (c) => c.nombre.toLowerCase() === datos.nombre.toLowerCase()
  );
  if (nombreDuplicado) {
    return { exito: false, error: 'Ya existe un componente con ese nombre.' };
  }

  const idsInvalidos = datos.dependencias.filter(
    (depId) => !existentes.some((c) => c.id === depId)
  );
  if (idsInvalidos.length > 0 && datos.dependencias.length > 0) {
    return {
      exito: false,
      error: 'Una o más dependencias no existen en el sistema.',
    };
  }

  const componente: ComponenteArquitectura = {
    id: generarId('cmp'),
    nombre: datos.nombre,
    tipo: datos.tipo,
    patron: datos.patron,
    dependencias: datos.dependencias,
    descripcion: datos.descripcion,
  };

  const erroresTiempo = validarComponenteEnTiempo(componente, existentes);
  if (erroresTiempo.length > 0) {
    return {
      exito: false,
      error: erroresTiempo[0],
      errores: erroresTiempo,
    };
  }

  await repositorio.guardar(componente);
  return { exito: true, datos: componente };
}

export async function eliminarComponente(
  id: string,
  repositorio: RepositorioComponentes
): Promise<ResultadoOperacion<void>> {
  const todos = await repositorio.obtenerTodos();
  const usadoComoDep = todos.some((c) => c.dependencias.includes(id));
  if (usadoComoDep) {
    return {
      exito: false,
      error: 'No se puede eliminar: otros componentes dependen de este.',
    };
  }
  await repositorio.eliminar(id);
  return { exito: true };
}

export async function listarComponentes(
  repositorio: RepositorioComponentes
): Promise<ComponenteArquitectura[]> {
  return repositorio.obtenerTodos();
}
