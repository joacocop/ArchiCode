/**
 * Generic: genera un identificador único con prefijo tipado.
 * Reutilizable para cualquier entidad que tenga campo `id`.
 */
export function generarId<T extends string = string>(prefijo: T): `${T}-${string}` {
  const sufijo = crypto.randomUUID().slice(0, 8);
  return `${prefijo}-${sufijo}` as `${T}-${string}`;
}

/**
 * Generic: mapea un array preservando el tipo de retorno de la función.
 */
export function mapearEntidades<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}
