# 📦 Documentación de Base de Datos - Unica API

> Sistema de gestión para tienda de ropa

## Descripción General

Esta base de datos soporta una aplicación de gestión de inventario y ventas para una tienda de ropa física. El sistema permite:

- Gestionar el catálogo de productos
- Registrar compras al proveedor (reposición de stock)
- Registrar ventas al público
- Manejar devoluciones de productos
- Autenticación de usuarios

---

## Diagrama de Relaciones

```
┌─────────────────┐
│     config      │  (Configuración y credenciales)
└─────────────────┘

┌─────────────────┐       ┌──────────────────────┐
│    products     │◄──────│  productos_comprados │
│   (Catálogo)    │       │  (Compras a proveed.)│
└────────┬────────┘       └──────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│  productos_vendidos │
│  (Ventas al público)│
└─────────────────────┘
```

---

## Tablas

### 1. `products` - Catálogo de Productos

Almacena todos los productos disponibles en el inventario de la tienda.

| Columna         | Tipo    | Requerido | PK  | Descripción                                         |
| --------------- | ------- | --------- | --- | --------------------------------------------------- |
| `id`            | TEXT    | ✅        | ✅  | Identificador único (UUID)                          |
| `code`          | TEXT    | ✅        | -   | Código corto asignado por el usuario (ej: "CAM001") |
| `description`   | TEXT    | ✅        | -   | Nombre/título descriptivo del producto              |
| `provider`      | TEXT    | ✅        | -   | Nombre del proveedor                                |
| `purchasePrice` | REAL    | ✅        | -   | Precio de compra al proveedor                       |
| `salePrice`     | REAL    | ✅        | -   | Precio de venta al público                          |
| `stock`         | INTEGER | ✅        | -   | Cantidad disponible en inventario                   |
| `createdAt`     | TEXT    | ✅        | -   | Fecha de creación (formato: "DD/MM/YYYY")           |
| `metadata`      | TEXT    | No        | -   | Datos adicionales en formato JSON (default: `'{}'`) |

#### Ejemplo de registro

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "REM-001",
  "description": "Remera básica algodón",
  "provider": "TextilSur",
  "purchasePrice": 1500.0,
  "salePrice": 3500.0,
  "stock": 25,
  "createdAt": "15/06/2024",
  "metadata": "{\"colores\": [\"blanco\", \"negro\", \"gris\"]}"
}
```

---

### 2. `productos_comprados` - Registro de Compras (Reposición)

Registra las compras realizadas a proveedores para reponer el inventario. Los datos del producto se copian al momento de la compra para mantener un historial preciso.

| Columna              | Tipo    | Requerido | PK  | Descripción                             |
| -------------------- | ------- | --------- | --- | --------------------------------------- |
| `id`                 | TEXT    | ✅        | ✅  | Identificador único de la compra (UUID) |
| `productId`          | TEXT    | ✅        | -   | FK → `products.id`                      |
| `productCode`        | TEXT    | ✅        | -   | Código del producto (snapshot)          |
| `productDescription` | TEXT    | ✅        | -   | Descripción del producto (snapshot)     |
| `productProvider`    | TEXT    | ✅        | -   | Proveedor del producto (snapshot)       |
| `purchasePrice`      | REAL    | ✅        | -   | Precio unitario de compra               |
| `quantity`           | INTEGER | ✅        | -   | Cantidad de unidades compradas          |
| `purchasedAt`        | TEXT    | ✅        | -   | Fecha de la compra                      |

#### ¿Por qué se duplican los datos del producto?

Los campos `productCode`, `productDescription`, `productProvider` y `purchasePrice` se copian desde la tabla `products` al momento de registrar la compra. Esto permite:

- Mantener un historial preciso aunque el producto se modifique después
- Consultar el detalle de compras pasadas con los datos exactos de ese momento

#### Ejemplo de registro

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "productCode": "REM-001",
  "productDescription": "Remera básica algodón",
  "productProvider": "TextilSur",
  "purchasePrice": 1500.0,
  "quantity": 50,
  "purchasedAt": "20/06/2024"
}
```

---

### 3. `productos_vendidos` - Registro de Ventas

Registra cada venta realizada al público. Similar a las compras, los datos del producto se copian para mantener historial.

| Columna              | Tipo    | Requerido | PK  | Default | Descripción                               |
| -------------------- | ------- | --------- | --- | ------- | ----------------------------------------- |
| `id`                 | TEXT    | ✅        | ✅  | -       | Identificador único de la venta (UUID)    |
| `productId`          | TEXT    | ✅        | -   | -       | FK → `products.id`                        |
| `productCode`        | TEXT    | ✅        | -   | -       | Código del producto (snapshot)            |
| `productDescription` | TEXT    | ✅        | -   | -       | Descripción del producto (snapshot)       |
| `productProvider`    | TEXT    | ✅        | -   | -       | Proveedor del producto (snapshot)         |
| `purchasePrice`      | REAL    | ✅        | -   | -       | Precio de compra (para calcular ganancia) |
| `salePrice`          | REAL    | ✅        | -   | -       | Precio de venta aplicado                  |
| `soldAt`             | TEXT    | ✅        | -   | -       | Fecha y hora de la venta                  |
| `soldBy`             | TEXT    | ✅        | -   | -       | Identificador del vendedor/local          |
| `isReturned`         | BOOLEAN | No        | -   | `0`     | Indica si el producto fue devuelto        |
| `returnedAt`         | TEXT    | No        | -   | `NULL`  | Fecha de devolución (si aplica)           |
| `details`            | TEXT    | No        | -   | `NULL`  | Detalles adicionales (talle, color, etc.) |

#### Notas importantes

- **`soldBy`**: Actualmente siempre tiene el mismo valor ya que la tienda opera desde un único local físico sin ventas online
- **`isReturned`**: Se marca como `1` (true) cuando un cliente devuelve el producto
- **`details`**: Campo libre para registrar especificaciones de la venta (ej: "Talle M, Color azul")

#### Ejemplo de registro

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "productCode": "REM-001",
  "productDescription": "Remera básica algodón",
  "productProvider": "TextilSur",
  "purchasePrice": 1500.0,
  "salePrice": 3500.0,
  "soldAt": "25/06/2024 14:30",
  "soldBy": "local-principal",
  "isReturned": false,
  "returnedAt": null,
  "details": "Talle L, Color negro"
}
```

---

### 4. `config` - Configuración del Sistema

Almacena pares clave-valor para la configuración de la aplicación, incluyendo credenciales de acceso.

| Columna | Tipo    | Requerido | PK  | Descripción                   |
| ------- | ------- | --------- | --- | ----------------------------- |
| `id`    | INTEGER | No        | ✅  | Identificador autoincremental |
| `key`   | TEXT    | ✅        | -   | Nombre de la configuración    |
| `value` | TEXT    | ✅        | -   | Valor de la configuración     |

#### Uso principal

Esta tabla se utiliza para almacenar las credenciales de los usuarios autorizados. La aplicación no está disponible al público general, por lo que los usuarios son fijos y no se contempla registro de nuevos usuarios.

#### Ejemplo de registros

```json
[
  { "id": 1, "key": "admin_username", "value": "admin" },
  { "id": 2, "key": "admin_password_hash", "value": "$2b$10$..." },
  { "id": 3, "key": "store_name", "value": "Única Indumentaria" }
]
```

---

## Consideraciones Técnicas

### Formato de Fechas

Las fechas se almacenan como `TEXT` en formato `DD/MM/YYYY` o `DD/MM/YYYY HH:mm` o en formato ISO según el caso.

### UUIDs

Los identificadores de `products`, `productos_comprados` y `productos_vendidos` son UUIDs v4 generados en la aplicación.

### Snapshots de Datos

Las tablas de transacciones (`productos_comprados` y `productos_vendidos`) copian los datos del producto al momento de la operación. Esto es intencional para:

1. **Auditoría**: Poder reconstruir exactamente qué se compró/vendió
2. **Historial de precios**: Mantener registro de precios históricos
3. **Independencia**: Las modificaciones al catálogo no alteran el historial
