1. TypeScript — tipos antes de ejecutar
Le decís al editor qué forma tienen los datos (nombre, tipo, patrón, etc.). Si te equivocás, el error aparece al escribir código, no cuando el usuario usa la página.

Ejemplo del proyecto: un componente tiene nombre: string, tipo: 'api' | 'ui' | ..., etc.

También piden:

Utility types (Omit, Partial, Pick, Readonly) — variantes del mismo tipo (con/sin id, solo algunos campos, etc.)
Al menos un generic — una función que sirve para varios tipos (en ArchiCode: generarId, ResultadoOperacion<T>)
2. Zod — validar lo que viene del formulario
TypeScript no protege cuando el usuario escribe en un formulario: eso es texto “sucio”. Zod revisa en vivo:

nombre mínimo 2 caracteres
tipo y patrón válidos
dependencias bien formadas
Si falla, muestra mensajes claros sin guardar basura.

El código se divide en dos mundos:

Parte	                 Qué hace	                     Ejemplo
Core (src/core/)	Reglas de negocio puras	“¿Hay dependencia circular?”, “¿Se puede agregar?”

Infraestructura(src/infraestructura/)	Detalles técnicos	Guardar en localStorage, dibujar la pantalla, esquema Zod

El puerto es un contrato: “quiero guardar componentes”.
El adaptador es la implementación: “los guardo en localStorage”.
Si mañana cambiás a una API, tocás solo el adaptador, no la lógica de validación.

Eso es lo que el PDF llama Arquitectura Limpia / Hexagonal.


Qué es ArchiCode como producto
Imaginá que sos arquitecto de software y querés documentar piezas de un sistema:

Auth API (tipo API, patrón hexagonal)
Base de usuarios (base de datos, depende de Auth API)
Pantalla de login (UI, patrón MVC)
La web te deja crear esas piezas, verlas en lista, enlazar dependencias (“este depende de aquel”) y te avisa si el diseño rompe reglas (como un linter de arquitectura).

Las 5 funcionalidades obligatorias del PDF
Formulario para crear un componente (con TS + Zod).
Listado de todo lo que agregaste.
Validación en tiempo real mientras completás el formulario y un panel global del sistema.
Persistencia en localStorage (si recargás la página, sigue ahí).
Interfaz moderna y que se vea bien en celular (responsive).


  A[Completás el formulario] --> B{Zod valida campos}
  B -->|Error| C[Mensajes en rojo]
  B -->|OK| D[Caso de uso: agregarComponente]
  D --> E{Reglas de arquitectura}
  E -->|Error| F[No guarda + aviso]
  E -->|OK| G[localStorage]
  G --> H[Lista + panel de validación global]

Paso a paso
Completás el formulario (nombre, tipo, patrón, descripción opcional).
Dependencias: cuando ya hay componentes, aparecen checkboxes para marcar “de quién depende este”.
Mientras escribís, Zod y las reglas de arquitectura pueden mostrar una vista previa de problemas (sin guardar todavía).
Al hacer “Agregar componente”:
Zod valida otra vez.
El caso de uso revisa nombre duplicado, dependencias que no existen, ciclos, reglas del patrón.
Si todo está bien → se guarda en localStorage y se actualiza la lista.
El panel de arriba a la derecha (“Arquitectura válida” / “Se detectaron violaciones”) analiza todo el sistema, no solo el último componente.
Eliminar: solo si ningún otro componente depende de ese (si no, te avisa).
Qué valida “en tiempo real”


