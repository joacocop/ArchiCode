import { z } from 'zod';

const TipoComponenteEnum = z.enum(['servicio', 'api', 'base-datos', 'ui', 'cola']);
const PatronEnum = z.enum(['hexagonal', 'mvc', 'microservicio', 'monolito']);

/** Esquema Zod para datos del formulario (entrada insegura) */
export const ComponenteFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_.]+$/,
      'Solo letras, números, espacios, guiones y puntos'
    ),
  tipo: TipoComponenteEnum,
  patron: PatronEnum,
  dependencias: z
    .array(z.string().min(1))
    .default([])
    .transform((arr) => arr.filter(Boolean)),
  descripcion: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
});

export type ComponenteFormInput = z.input<typeof ComponenteFormSchema>;
export type ComponenteFormOutput = z.output<typeof ComponenteFormSchema>;

export function validarFormulario(
  datosDesconocidos: unknown
): { success: true; data: ComponenteFormOutput } | { success: false; mensajes: string[] } {
  const resultado = ComponenteFormSchema.safeParse(datosDesconocidos);
  if (resultado.success) {
    const data = {
      ...resultado.data,
      descripcion: resultado.data.descripcion || undefined,
      dependencias: resultado.data.dependencias ?? [],
    };
    return { success: true, data };
  }
  const mensajes = resultado.error.errors.map(
    (e) => `${e.path.join('.') || 'formulario'}: ${e.message}`
  );
  return { success: false, mensajes };
}
