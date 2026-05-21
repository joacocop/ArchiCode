# Informe Técnico - ArchiCode

## Integrantes

- [Nombre Apellido] (rol: frontend/arquitectura)
- [Nombre Apellido] (rol: validaciones/integración)

> Completar con los datos de tu grupo antes de entregar.

## Link a producción

https://[tu-proyecto].vercel.app

> Desplegar con `npm run build` y subir a Vercel/Netlify. Pegar URL real aquí.

## Capturas de pantalla

<!-- Insertar imágenes en carpeta /docs o enlazar desde el repo -->

1. Vista principal con formulario y listado
2. Panel de validación con errores de arquitectura
3. Vista móvil (responsive)

## Explicación de la arquitectura

ArchiCode sigue **arquitectura hexagonal** (puertos y adaptadores):

| Capa | Responsabilidad | No depende de |
|------|-----------------|---------------|
| `src/core/entidades` | Tipos e interfaces de dominio | UI, localStorage, Zod |
| `src/core/puertos` | Contratos (`RepositorioComponentes`) | Implementaciones concretas |
| `src/core/casos-uso` | Lógica de negocio (`agregarComponente`, `validarPatron`) | Detalles de persistencia |
| `src/infraestructura/adaptadores` | `LocalStorageRepo` implementa el puerto | — |
| `src/infraestructura/validacion` | Esquemas Zod para datos del formulario | — |
| `src/infraestructura/ui` | DOM, eventos, renderizado | No contiene reglas de negocio |

**Puertos definidos:** `RepositorioComponentes` (obtener, guardar, eliminar).

**Adaptadores:** `LocalStorageRepo` — podría reemplazarse por `ApiRepo` o `IndexedDBRepo` sin modificar los casos de uso.

## Código destacado

### Utility types (`ComponenteArquitectura.ts`)

```typescript
export type ComponenteSinId = Omit<ComponenteArquitectura, 'id'>;
export type ComponenteParcial = Partial<ComponenteArquitectura>;
export type ComponenteResumen = Pick<ComponenteArquitectura, 'id' | 'nombre' | 'tipo' | 'patron'>;
export type ComponenteReadonly = Readonly<ComponenteArquitectura>;
```

### Generic (`genericos.ts`)

```typescript
export function generarId<T extends string = string>(prefijo: T): `${T}-${string}` {
  const sufijo = crypto.randomUUID().slice(0, 8);
  return `${prefijo}-${sufijo}` as `${T}-${string}`;
}
```

### Esquema Zod (`componenteSchema.ts`)

```typescript
export const ComponenteFormSchema = z.object({
  nombre: z.string().min(2).max(80),
  tipo: z.enum(['servicio', 'api', 'base-datos', 'ui', 'cola']),
  patron: z.enum(['hexagonal', 'mvc', 'microservicio', 'monolito']),
  dependencias: z.array(z.string().min(1)).default([]),
});
```

### Adaptador localStorage (`localStorageRepo.ts`)

```typescript
export class LocalStorageRepo implements RepositorioComponentes {
  async guardar(componente: ComponenteArquitectura): Promise<void> {
    const todos = await this.obtenerTodos();
    // ...
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}
```

## Dificultades y soluciones

| Dificultad | Solución |
|------------|----------|
| Validación en tiempo real sin guardar | Caso de uso `validarComponenteEnTiempo` simula el grafo con un componente borrador |
| Detectar ciclos en dependencias | DFS con conjunto `pila` en `validarPatron.ts` |
| Separar Zod del core | Esquemas solo en `infraestructura/validacion`; el core recibe datos ya tipados |

## Conclusión

Aprendimos a combinar **TypeScript estricto**, **Zod en runtime** y **arquitectura hexagonal** para que el proyecto escale sin que un cambio en el almacenamiento rompa la lógica de validación. En un proyecto real (Netflix/Spotify) este enfoque permite tests unitarios del core sin navegador y cambiar persistencia por entorno.
