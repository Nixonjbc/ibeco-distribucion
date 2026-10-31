# Distribuciones IBECO — migración segura

Este repositorio es **distinto** de `Nixonjbc/ibeco-ia` (consulta de catálogo ABC Soft).

## Estado
- GitHub Pages: página de preparación en `index.html`.
- Aplicación original: publicación de ChatGPT Sites, **sin código fuente recuperado**.
- No reemplazar la aplicación original ni borrar sus datos.
- No subir respaldos JSON ni datos personales a este repositorio público.

## Estructura del respaldo original (verificada sin publicar los datos)

El archivo de respaldo examinado contiene:
- `version` (número)
- `clients` (lista de clientes; campos `name`, `phone`, `address`, `cedula`, `rubro`, `id`)
- `products` (lista; campos `id`, `name`, `photo`)
- `entries` (movimientos; campos `date`, `note`, `type`, `lines`, `amount`, `id`, `created`)

**Esta información describe el formato, no garantiza que una app nueva pueda importarlo correctamente.** Se necesita estudiar semántica de los movimientos y construir pruebas contables antes de restaurar datos reales.

## Próximos pasos técnicos
1. Obtener los archivos fuente de la aplicación original mediante su editor/exportación autenticada.
2. Guardar los recursos públicos (HTML, CSS, JS, iconos) en este repositorio, **excluyendo datos privados**.
3. Realizar pruebas con operaciones ficticias, incluidas ventas, recepciones, abonos, pagos, gastos y devoluciones.
4. Validar compatibilidad del respaldo con una copia de prueba y conciliar saldos de clientes, existencias y deuda a proveedor.
5. Probar en iPhone/Safari, incluidas instalaciones desde pantalla de inicio.
6. Solo después de validar, decidir reemplazo del acceso anterior.

## Seguridad
GitHub Pages sirve archivos públicos. **No es una base de datos privada**. No publicar balances o información de clientes en JSON dentro del repositorio.
