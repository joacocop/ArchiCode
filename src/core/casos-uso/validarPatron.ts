import type {
  ComponenteArquitectura,
  ComponenteReadonly,
  PatronArquitectura,
} from '../entidades/ComponenteArquitectura';

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

/** Detecta dependencias circulares en el grafo de componentes */
function detectarCiclo(
  componentes: ComponenteReadonly[],
  inicioId: string,
  visitados: Set<string> = new Set(),
  pila: Set<string> = new Set()
): string[] | null {
  if (pila.has(inicioId)) {
    return [...pila, inicioId];
  }
  if (visitados.has(inicioId)) return null;

  visitados.add(inicioId);
  pila.add(inicioId);

  const comp = componentes.find((c) => c.id === inicioId);
  if (!comp) return null;

  for (const depId of comp.dependencias) {
    const ciclo = detectarCiclo(componentes, depId, visitados, pila);
    if (ciclo) return ciclo;
  }

  pila.delete(inicioId);
  return null;
}

/** Reglas por patrón arquitectónico */
const reglasPorPatron: Record<
  PatronArquitectura,
  (comp: ComponenteArquitectura, todos: ComponenteArquitectura[]) => string[]
> = {
  hexagonal: (comp, todos) => {
    const errores: string[] = [];
    const deps = todos.filter((d) => comp.dependencias.includes(d.id));
    const uiDirecta = deps.some((d) => d.tipo === 'ui' && comp.tipo === 'base-datos');
    if (uiDirecta) {
      errores.push(
        `[${comp.nombre}] Hexagonal: la capa de datos no debe depender directamente de UI.`
      );
    }
    if (comp.tipo === 'ui' && deps.some((d) => d.tipo === 'base-datos')) {
      errores.push(
        `[${comp.nombre}] Hexagonal: UI no debe acceder a base de datos sin capa de aplicación.`
      );
    }
    return errores;
  },
  mvc: (comp, todos) => {
    const errores: string[] = [];
    if (comp.tipo === 'base-datos' && comp.patron !== 'mvc') return errores;
    const deps = todos.filter((d) => comp.dependencias.includes(d.id));
    if (comp.tipo === 'ui' && !deps.some((d) => d.tipo === 'api' || d.tipo === 'servicio')) {
      errores.push(`[${comp.nombre}] MVC: la vista debería depender del controlador (api/servicio).`);
    }
    return errores;
  },
  microservicio: (comp, todos) => {
    const errores: string[] = [];
    const deps = todos.filter((d) => comp.dependencias.includes(d.id));
    if (comp.tipo === 'servicio' && deps.length > 5) {
      errores.push(`[${comp.nombre}] Microservicio: demasiadas dependencias (${deps.length} > 5).`);
    }
    return errores;
  },
  monolito: (comp) => {
    const errores: string[] = [];
    if (comp.dependencias.length > 10) {
      errores.push(`[${comp.nombre}] Monolito: exceso de acoplamiento (${comp.dependencias.length} deps).`);
    }
    return errores;
  },
};

/** Valida el diseño completo: ciclos + reglas de patrón */
export function validarPatron(
  componentes: ComponenteArquitectura[]
): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];
  const readonly = componentes as ComponenteReadonly[];

  for (const comp of componentes) {
    const ciclo = detectarCiclo(readonly, comp.id, new Set(), new Set());
    if (ciclo) {
      const nombres = ciclo
        .map((id) => componentes.find((c) => c.id === id)?.nombre ?? id)
        .join(' → ');
      errores.push(`Dependencia circular detectada: ${nombres}`);
    }

    const regla = reglasPorPatron[comp.patron];
    errores.push(...regla(comp, componentes));

    if (comp.dependencias.includes(comp.id)) {
      errores.push(`[${comp.nombre}] Un componente no puede depender de sí mismo.`);
    }
  }

  const nombres = new Set(componentes.map((c) => c.nombre.toLowerCase()));
  if (nombres.size < componentes.length) {
    advertencias.push('Hay componentes con nombres duplicados (puede confundir al equipo).');
  }

  const unicos = [...new Set(errores)];
  return {
    valido: unicos.length === 0,
    errores: unicos,
    advertencias,
  };
}

/** Validación en tiempo real para un componente antes de guardar */
export function validarComponenteEnTiempo(
  componente: ComponenteArquitectura,
  existentes: ComponenteArquitectura[]
): string[] {
  const simulados = [
    ...existentes.filter((e) => e.id !== componente.id),
    componente,
  ];
  return validarPatron(simulados).errores;
}
