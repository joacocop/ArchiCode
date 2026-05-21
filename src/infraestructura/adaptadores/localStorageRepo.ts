import type { ComponenteArquitectura } from '../../core/entidades/ComponenteArquitectura';
import type { RepositorioComponentes } from '../../core/puertos/repositorioComponentes';

const STORAGE_KEY = 'archicode_componentes';

/** Adaptador concreto: persiste en localStorage del navegador */
export class LocalStorageRepo implements RepositorioComponentes {
  async obtenerTodos(): Promise<ComponenteArquitectura[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as ComponenteArquitectura[];
    } catch {
      return [];
    }
  }

  async guardar(componente: ComponenteArquitectura): Promise<void> {
    const todos = await this.obtenerTodos();
    const idx = todos.findIndex((c) => c.id === componente.id);
    if (idx >= 0) {
      todos[idx] = componente;
    } else {
      todos.push(componente);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  async eliminar(id: string): Promise<void> {
    const todos = await this.obtenerTodos();
    const filtrados = todos.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  }

  async obtenerPorId(id: string): Promise<ComponenteArquitectura | null> {
    const todos = await this.obtenerTodos();
    return todos.find((c) => c.id === id) ?? null;
  }
}
