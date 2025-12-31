# Controladores

> Guía para crear controladores usando `makeController`

## Descripción General

La función `makeController` es una utilidad que simplifica la creación de controladores en Express, proporcionando:

- ✅ Validación automática del body y params con Zod
- ✅ Tipado fuerte de TypeScript
- ✅ Manejo centralizado de errores
- ✅ Respuestas de error consistentes

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
    paramsSchema?: Params
): Handler
```

### Parámetros

| Parámetro      | Tipo       | Requerido | Descripción                          |
| -------------- | ---------- | --------- | ------------------------------------ |
| `controller`   | `Function` | ✅        | Función async con la lógica          |
| `bodySchema`   | `ZodType`  | No        | Schema Zod para validar `req.body`   |
| `paramsSchema` | `ZodType`  | No        | Schema Zod para validar `req.params` |

### Objeto `req` del Controller

| Propiedad | Tipo                | Descripción                  |
| --------- | ------------------- | ---------------------------- |
| `body`    | Inferido del schema | Body parseado y validado     |
| `params`  | Inferido del schema | Params parseados y validados |
| `request` | `Express.Request`   | Request original de Express  |

---

## Manejo de Errores

`makeController` captura automáticamente:

| Tipo de Error   | Código HTTP | Comportamiento                                   |
| --------------- | ----------- | ------------------------------------------------ |
| `ZodError`      | 400         | Devuelve mensaje y path del campo con error      |
| `ErrorResponse` | Dinámico    | Usa el código definido en el error personalizado |
| Otros errores   | -           | Se pasan al middleware `next(error)`             |

---

## Ejemplos

### Ejemplo Básico: Login

```typescript
import { env } from '@/config/env';
import { makeController } from '@/shared/utils/makeController';
import { Login } from '@/modules/auth/actions/Login';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// 1. Definir schemas de validación
const body = z.object({
  username: z
    .string()
    .nonempty('El nombre de usuario no debe estar vacio.')
    .max(100),
  password: z.string().nonempty().max(100),
});

const params = z.object({}).optional();

// 2. Crear el controlador con tipos inferidos
export const login = makeController<typeof body, typeof params>(
  async function ({ body, params, request }, res) {
    const { username, password } = body; // ✅ Tipado automático

    const { password: _, ...user } = await Login({ username, password });

    const token = jwt.sign({ ...user }, env.JWT_SECRET, { expiresIn: '2DAY' });

    res.status(200).json({
      status: 'success',
      messages: 'Credenciales correctas.',
      token,
      role: user.role,
    });
  },
  body, // Schema del body
  params, // Schema de params
);
```

### Ejemplo con Params: Obtener Producto por ID

```typescript
import { makeController } from '@/shared/utils/makeController';
import { findProductById } from '@/db';
import { z } from 'zod';

const body = z.object({}).optional();

const params = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getProduct = makeController<typeof body, typeof params>(
  async function ({ params }, res) {
    const product = await findProductById(params.id);

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ data: product });
  },
  body,
  params,
);
```

### Ejemplo Solo con Body: Crear Producto

```typescript
import { makeController } from '@/shared/utils/makeController';
import { createProduct } from '@/db';
import { z } from 'zod';

const body = z.object({
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  provider: z.string().min(1),
  purchasePrice: z.number().positive(),
  salePrice: z.number().positive(),
  stock: z.number().int().min(0),
});

export const create = makeController<typeof body>(async function (
  { body },
  res,
) {
  const product = await createProduct({
    ...body,
    metadata: '{}',
    createdAt: new Date().toLocaleDateString('es-AR'),
  });

  res.status(201).json({
    status: 'success',
    data: product,
  });
}, body);
```

---

## Uso en Rutas

```typescript
import { Router } from 'express';
import { login } from './controllers/login';
import { getProduct } from './controllers/getProduct';

const router = Router();

router.post('/login', login);
router.get('/products/:id', getProduct);

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
