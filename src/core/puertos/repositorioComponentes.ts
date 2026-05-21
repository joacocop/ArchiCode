import type { ComponenteArquitectura } from '../entidades/ComponenteArquitectura';

/** Puerto (interfaz): abstrae el almacenamiento de componentes */
export interface RepositorioComponentes {
  obtenerTodos(): Promise<ComponenteArquitectura[]>;
  guardar(componente: ComponenteArquitectura): Promise<void>;
  eliminar(id: string): Promise<void>;
  obtenerPorId(id: string): Promise<ComponenteArquitectura | null>;
}
