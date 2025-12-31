# Controladores

> Guía para crear controladores usando `makeController`

## Descripción General

La función `makeController` es una utilidad que simplifica la creación de controladores en Express, proporcionando:

- ✅ Validación automática del body y params con Zod
- ✅ Tipado fuerte de TypeScript
- ✅ Manejo centralizado de errores
- ✅ Respuestas de error consistentes
- ✅ Autorización integrada con JWT

---

## Ubicación

```
src/shared/utils/makeController.ts
```

---

## Firma de la Función

```typescript
makeController<Body, Params>(
    controller: (req, res) => Promise<void>,
    bodySchema?: Body,
    paramsSchema?: Params,
    config?: { authorization?: boolean | ((token: string) => boolean) }
): Handler
```

### Parámetros

| Parámetro      | Tipo       | Requerido | Descripción                                |
| -------------- | ---------- | --------- | ------------------------------------------ |
| `controller`   | `Function` | ✅        | Función async con la lógica                |
| `bodySchema`   | `ZodType`  | No        | Schema Zod para validar `req.body`         |
| `paramsSchema` | `ZodType`  | No        | Schema Zod para validar `req.params`       |
| `config`       | `Object`   | No        | Configuración adicional (ver Autorización) |

### Objeto `req` del Controller

| Propiedad | Tipo                | Descripción                  |
| --------- | ------------------- | ---------------------------- |
| `body`    | Inferido del schema | Body parseado y validado     |
| `params`  | Inferido del schema | Params parseados y validados |
| `request` | `Express.Request`   | Request original de Express  |

---

## Autorización

El parámetro `config.authorization` permite proteger endpoints de forma sencilla.

### Opciones

| Valor                        | Comportamiento                                    |
| ---------------------------- | ------------------------------------------------- |
| `true`                       | Requiere que exista el header `Authorization`     |
| `(token: string) => boolean` | Ejecuta la función para validar el token y el rol |
| `undefined` / no se pasa     | Sin autorización (endpoint público)               |

### Funciones de Utilidad para Roles

Ubicación: `src/modules/auth/utils/auth.ts`

```typescript
import {
  getRole,
  isCashier,
  isAdmin,
  hasAnyRole,
} from '@/modules/auth/utils/auth';

// Obtener el rol del token (retorna string o false)
getRole(token); // "admin" | "cashier" | false

// Verificar roles específicos
isAdmin(token); // true si rol es "admin"
isCashier(token); // true si rol es "cashier"
hasAnyRole(token); // true si tiene cualquier rol válido
```

### Ejemplos de Autorización

```typescript
// ❌ Sin autorización (público)
export const publicEndpoint = makeController(async ({ body }, res) => {
  // ...
}, body);

// ✅ Requiere token (cualquier usuario autenticado)
export const protectedEndpoint = makeController(
  async ({ body }, res) => {
    // ...
  },
  body,
  params,
  { authorization: true },
);

// ✅ Solo administradores
export const adminOnly = makeController(
  async ({ body }, res) => {
    // ...
  },
  body,
  params,
  { authorization: isAdmin },
);

// ✅ Solo cajeros
export const cashierOnly = makeController(
  async ({ body }, res) => {
    // ...
  },
  body,
  params,
  { authorization: isCashier },
);

// ✅ Cualquier rol válido
export const anyRole = makeController(
  async ({ body }, res) => {
    // ...
  },
  body,
  params,
  { authorization: hasAnyRole },
);
```

---

## Manejo de Errores

`makeController` captura automáticamente:

| Tipo de Error        | Código HTTP | Comportamiento                                   |
| -------------------- | ----------- | ------------------------------------------------ |
| `ZodError`           | 400         | Devuelve mensaje y path del campo con error      |
| `ErrorResponse`      | Dinámico    | Usa el código definido en el error personalizado |
| `InvalidCredentials` | 401         | Token inválido o faltante                        |
| Otros errores        | -           | Se pasan al middleware `next(error)`             |

---

## Ejemplos

### Ejemplo Básico: Login (Público)

```typescript
import { env } from '@/config/env';
import { makeController } from '@/shared/utils/makeController';
import { Login } from '@/modules/auth/actions/Login';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const body = z.object({
  username: z
    .string()
    .nonempty('El nombre de usuario no debe estar vacio.')
    .max(100),
  password: z.string().nonempty().max(100),
});

const params = z.object({}).optional();

export const login = makeController<typeof body, typeof params>(
  async function ({ body }, res) {
    const { username, password } = body;

    const { password: _, ...user } = await Login({ username, password });

    const token = jwt.sign({ ...user }, env.JWT_SECRET, { expiresIn: '2DAY' });

    res.status(200).json({
      status: 'success',
      messages: 'Credenciales correctas.',
      token,
      role: user.role,
    });
  },
  body,
  params,
  // Sin config = endpoint público
);
```

### Ejemplo Protegido: Obtener Producto (Cualquier Usuario)

```typescript
import { makeController } from '@/shared/utils/makeController';
import { findProductById } from '@/db';
import { hasAnyRole } from '@/modules/auth/utils/auth';
import { z } from 'zod';

const body = z.object({}).optional();

const params = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getProduct = makeController<typeof body, typeof params>(
  async function ({ params }, res) {
    const product = await findProductById(params!.id);

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ data: product });
  },
  body,
  params,
  { authorization: hasAnyRole },
);
```

### Ejemplo Admin: Crear Producto

```typescript
import { makeController } from '@/shared/utils/makeController';
import { createProduct } from '@/db';
import { isAdmin } from '@/modules/auth/utils/auth';
import { z } from 'zod';

const body = z.object({
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  provider: z.string().min(1),
  purchasePrice: z.number().positive(),
  salePrice: z.number().positive(),
  stock: z.number().int().min(0),
});

export const create = makeController<typeof body>(
  async function ({ body }, res) {
    const product = await createProduct({
      ...body,
      metadata: '{}',
      createdAt: new Date().toLocaleDateString('es-AR'),
    });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  },
  body,
  undefined,
  { authorization: isAdmin },
);
```

---

## Uso en Rutas

```typescript
import { Router } from 'express';
import { login } from './controllers/login';
import { getProduct } from './controllers/getProduct';
import { create } from './controllers/create';

const router = Router();

// Público
router.post('/login', login);

// Protegido (cualquier rol)
router.get('/products/:id', getProduct);

// Solo admin
router.post('/products', create);

export default router;
```

---

## Errores Personalizados

Para lanzar errores con códigos HTTP específicos, usa `ErrorResponse`:

```typescript
import { ErrorResponse } from '@/shared/errors/ErrorResponse';

// Dentro del controlador:
throw new ErrorResponse(404, 'Usuario no encontrado');
throw new ErrorResponse(401, 'Credenciales inválidas');
throw new ErrorResponse(403, 'No tienes permisos');
```
