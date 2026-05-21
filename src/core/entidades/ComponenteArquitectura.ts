/** Tipos de componente en un sistema distribuido */
export type TipoComponente = 'servicio' | 'api' | 'base-datos' | 'ui' | 'cola';

/** Patrones arquitectónicos soportados */
export type PatronArquitectura = 'hexagonal' | 'mvc' | 'microservicio' | 'monolito';

/** Entidad de dominio: componente arquitectónico */
export interface ComponenteArquitectura {
  id: string;
  nombre: string;
  tipo: TipoComponente;
  patron: PatronArquitectura;
  dependencias: string[];
  descripcion?: string;
}

/** Utility type 1: datos para crear sin id generado */
export type ComponenteSinId = Omit<ComponenteArquitectura, 'id'>;

/** Utility type 2: actualización parcial */
export type ComponenteParcial = Partial<ComponenteArquitectura>;

/** Utility type 3: vista pública en listados */
export type ComponenteResumen = Pick<
  ComponenteArquitectura,
  'id' | 'nombre' | 'tipo' | 'patron'
>;

/** Utility type 4: inmutable para reglas de validación */
export type ComponenteReadonly = Readonly<ComponenteArquitectura>;

/** Resultado genérico de operaciones (generic requerido) */
export interface ResultadoOperacion<T> {
  exito: boolean;
  datos?: T;
  error?: string;
  errores?: string[];
}
