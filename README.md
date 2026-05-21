# ArchiCode

Validador de arquitectura de software — proyecto académico con **TypeScript**, **Zod** y **arquitectura hexagonal**.

## Funcionalidades

- Formulario para crear componentes (nombre, tipo, patrón, dependencias)
- Listado con eliminación (CRUD parcial)
- Validación en tiempo real (Zod + reglas de patrón + dependencias circulares)
- Persistencia en `localStorage` vía adaptador hexagonal
- UI responsive con Tailwind CSS

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

## Build y despliegue

```bash
npm run build
npm run preview
```

Subir la carpeta `dist` a [Vercel](https://vercel.com) o Netlify.

## Estructura

```
src/
├── core/                 # Dominio (sin dependencias externas)
│   ├── entidades/
│   ├── puertos/
│   ├── casos-uso/
│   └── utilidades/
└── infraestructura/
    ├── adaptadores/
    ├── validacion/
    └── ui/
```

Ver `INFORME.md` para la documentación técnica de entrega.
