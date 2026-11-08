# Documentación de LabPiPanel

Documentación vigente del monorepo. Todo lo que está en `docs/archive/` es
histórico y puede describir una arquitectura anterior.

| Documento | Contenido |
|---|---|
| [GUIA_EJECUCION.md](GUIA_EJECUCION.md) | Instalación, desarrollo, producción, Raspberry Pi y solución de problemas |
| [API.md](API.md) | Endpoints HTTP, formatos de petición/respuesta y códigos de error |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Componentes, flujo de datos y estado de la integración de hardware |
| [TESTING.md](TESTING.md) | Tests automáticos, verificación manual y checklist de aceptación |
| [archive/](archive/) | Documentos y análisis anteriores (solo referencia) |
| [guias/](guias/) | Documentación heredada; se conserva por permisos del sistema y no es referencia vigente |

> `docs/guias/` pertenece a la etapa anterior del proyecto. Está marcada como
> heredada y será movida a `docs/archive/` cuando se puedan cambiar los permisos
> de la carpeta en Windows.

## Lectura recomendada

1. Empieza por el [README principal](../README.md) para el inicio rápido.
2. Sigue la [guía de ejecución](GUIA_EJECUCION.md) si vas a montar el entorno.
3. Consulta la [API](API.md) si vas a consumir o extender el backend.
4. Lee la [arquitectura](ARQUITECTURA.md) antes de portar hardware real.
