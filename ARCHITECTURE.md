# Guía de Referencia Técnica — Proyecto Censao

> Centro de Salud Alto Obrajes · Sistema de Gestión de Fichas Médicas y Monitoreo de Vacunación  
> **Stack:** Next.js 15 · NextAuth v5 (beta.29) · Prisma v6 · PostgreSQL · TanStack Query · Zustand · Zod v4 · Sonner

---

## 0. Contexto de Negocio (Resumen para el Agente)

| Rol              | Clave interna    | Descripción                                                             |
| ---------------- | ---------------- | ----------------------------------------------------------------------- |
| Administrador    | `ADMINISTRADOR`  | Acceso total: gestiona usuarios, roles, vacunas, horarios, reportes     |
| Doctor de Fichas | `DOCTOR_FICHAS`  | Registra pacientes, crea y cancela fichas, ve disponibilidad de médicos |
| Doctor General   | `DOCTOR_GENERAL` | Solo ve sus fichas asignadas, atiende pacientes, registra tratamientos  |
| Paciente         | `PACIENTE`       | Solo ve sus propias fichas, vacunas y citas; nunca crea fichas          |

**Flujo central:** Paciente llega → Doctor de Fichas crea Ficha → Ficha aparece en pantalla del Doctor General y en pantalla pública → Doctor General atiende → marca como ATENDIDA o registra tratamiento de vacunación.

**Estados de `fichas`:** `PENDIENTE | ATENDIDA | CANCELADA` (enum `EstadoFicha` en Prisma).

**Modelo de seguridad:** Híbrido **RBAC + ABAC**:

- RBAC: cada rol tiene permisos distintos almacenados en DB (`roles → roles_permisos → permisos`).
- ABAC: validación de atributos en cada ruta (ej. Doctor General solo ve fichas donde la disponibilidad está vinculada a su usuario_id).

---

## 1. Estructura de Directorios (Screaming Architecture)

```
censao/
├── prisma/
│   ├── schema.prisma          # Fuente de verdad del modelo de datos
│   └── seed.ts                # Datos iniciales (roles, permisos, usuarios, vacunas)
│
└── src/
    ├── auth.ts                # Configuración central de NextAuth (providers, callbacks JWT/session)
    ├── middleware.ts          # Guardia de rutas — corre en el Edge antes de cada request al /dashboard
    │
    ├── actions/               # SERVER ACTIONS (lógica de mutación server-side)
    │   ├── auth/              # Server actions de autenticación y permisos de perfil
    │   └── fichas/            # create.ts — acción de creación de fichas (¡DEPRECADA, ver nota!)
    │
    ├── app/
    │   ├── (inicio)/          # Ruta pública del inicio de sesión (sin layout de dashboard)
    │   ├── api/               # API ROUTES — comunicación cliente→servidor
    │   │   ├── auth/          # Handler de NextAuth ([...nextauth]/route.ts)
    │   │   ├── fichas/        # route.ts + service.ts — CRUD de fichas
    │   │   ├── doctor/        # route.ts — listado de doctores
    │   │   ├── especialidad/  # API de especialidades y disponibilidades
    │   │   └── lib/
    │   │       └── constants/ # Enums Roles, RECORD_TYPES compartidos entre API y front
    │   │
    │   ├── components/        # Componentes REUTILIZABLES globales
    │   │   ├── icons/         # Íconos SVG como componentes React
    │   │   └── ui/
    │   │       ├── dataTable.tsx      # CustomDataTable — tabla principal del sistema
    │   │       ├── modal/modal.tsx    # Modal basado en <dialog> nativo HTML
    │   │       ├── form/custom-input.tsx
    │   │       ├── navbar/
    │   │       ├── sidebar/
    │   │       ├── aside/
    │   │       ├── title.tsx
    │   │       ├── loader.tsx
    │   │       └── cardLink.tsx
    │   │
    │   ├── dashboard/         # PÁGINAS DEL DASHBOARD (App Router)
    │   │   ├── layout.tsx     # Layout principal del dashboard con Sidebar/Navbar
    │   │   ├── page.tsx       # Página raíz del dashboard (home)
    │   │   ├── fichas/        # Feature: Gestión de Fichas
    │   │   │   ├── page.tsx               # Página principal — enruta por rol
    │   │   │   ├── schemas/index.ts       # Schemas Zod: fichaSchema, fichaUpdateSchema
    │   │   │   ├── components/
    │   │   │   │   ├── formRegister.tsx   # Formulario RHF+Zod para crear fichas
    │   │   │   │   └── statusBadge.tsx    # Badge visual de estado PENDIENTE/ATENDIDA/CANCELADA
    │   │   │   └── sections/dashboard/
    │   │   │       ├── doctor-fichas.tsx  # Vista para DOCTOR_FICHAS y ADMINISTRADOR
    │   │   │       └── doctor-general.tsx # Vista para DOCTOR_GENERAL
    │   │   ├── paciente/      # Feature: Vista del Paciente
    │   │   │   └── tratamientos/          # Tratamientos de vacunación de los pacientes
    │   │   ├── atencion/      # Feature: Pantalla pública de atención
    │   │   ├── tratamientos/      # Feature: Tratamientos de vacunación para doctores y el administrador
    │   │   ├── estado-doctores/ # Feature: Disponibilidad de médicos
    │   │   ├── notificaciones/ # Feature: Recordatorios
    │   │   └── perfil/        # Feature: Perfil de usuario
    │   │
    │   ├── services/          # CAPA DE SERVICIO FRONTEND (TanStack Query hooks)
    │   │   ├── client.ts      # Instancia de Axios configurada con baseURL=/api/
    │   │   ├── fichas.ts      # useFichas() — queries y mutations para /api/fichas
    │   │   └── disponibilidad/
    │   │       └── especialidades.ts # useEspecialidades()
    │   │
    │   ├── interfaces/        # Tipos TypeScript globales compartidos
    │   ├── types/             # Tipos adicionales
    │   └── utils/             # Helpers: date.ts (getRangoUTCBoliviaHoy, getTurnoActual)
    │
    ├── hooks/                 # CUSTOM HOOKS — lógica reactiva reutilizable
    │   ├── useUser.ts         # Lee la sesión de NextAuth para exponer id, role, name
    │   ├── useModal.ts        # Wrapper de useModalStore (Zustand)
    │   ├── useProfileRoutes.ts # Carga y expone permisos CRUD del usuario actual
    │   ├── useAside.ts
    │   └── useSidebar.ts
    │
    ├── store/                 # ZUSTAND STORES — estado global del cliente
    │   ├── modal.ts           # { isOpen, setIsOpen }
    │   ├── aside.ts
    │   ├── sidebar.ts
    │   ├── profile-routes.ts  # { routes, setRoutes, hasPermission, clearRoutes }
    │   └── patient/patient.ts # { fichaId, pacienteId, pacienteNombres, ... }
    │
    └── lib/                   # UTILIDADES DE SERVIDOR
        ├── prisma/prisma.ts   # Singleton del PrismaClient
        ├── services/
        │   └── auth-service.ts # AuthService — validación de credenciales y permisos API
        └── constants/
```

> **Nota sobre `src/actions/fichas/create.ts`:** Este archivo tiene un comentario `// ELIMINAR ESTO YA QUE ES UN ENDPOINT DE LA API`. La funcionalidad real de crear fichas se delegó a la API Route `POST /api/fichas`. El Server Action existe como versión alternativa pero no es el flujo activo.

---

## 2. Flujo de Rutas y API

### 2.1 Mapa de API Routes

| Ruta                      | Método   | Handler                     | Modelos Prisma involucrados                                                                                    | Descripción                                                                    |
| ------------------------- | -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler auto       | `usuarios`, `usuarios_roles`, `roles`, `permisos`                                                              | Login/logout/session                                                           |
| `/api/fichas`             | GET      | `FichasService.getFichas()` | `fichas`, `disponibilidades`, `doctores_especialidades`, `doctores`, `especialidades`, `pacientes`, `personas` | Lista fichas del turno actual según rol                                        |
| `/api/fichas`             | POST     | `route.ts::POST`            | `personas`, `pacientes`, `disponibilidades`, `fichas`                                                          | Crea persona+paciente si no existe, verifica cupos, crea ficha con orden_turno |
| `/api/fichas`             | PATCH    | `route.ts::PATCH`           | `fichas`                                                                                                       | Actualiza estado de una ficha (PENDIENTE→ATENDIDA/CANCELADA)                   |
| `/api/doctor`             | GET      | `route.ts::GET`             | `doctores`, `personas`, `doctores_especialidades`                                                              | Lista doctores disponibles                                                     |
| `/api/especialidad`       | GET      | —                           | `especialidades`, `doctores_especialidades`, `disponibilidades`                                                | Lista especialidades con doctores y capacidades                                |

### 2.2 Convención de Nombres

- Las rutas siguen el patrón de **recursos en español y snake_case** internamente en la DB, pero los endpoints usan **inglés/español simple** (`/api/fichas`, `/api/doctor`).
- Todas las rutas de la API están bajo `/api/` (prefijo de Next.js App Router).
- Las API Routes NO usan dinamic segments `[id]` todavía — los IDs se pasan en el body del PATCH.

### 2.3 Relación de Modelos Prisma (Cadena Principal)

```
fichas
 └─► disponibilidades  (disponibilidad_id)
      ├─► turnos_catalogo  (turno_codigo: 'AM' | 'PM')
      └─► doctores_especialidades  (doctor_especialidad_id)
           ├─► doctores  (doctor_id)
           │    └─► personas  (doctor_id = personas.ci)
           └─► especialidades  (especialidad_id)
 └─► pacientes  (paciente_id = personas.ci)
      └─► personas  (paciente_id)
 └─► tratamientos (Contenedor del seguimiento, ej: "Esquema COVID")
      └─► citas[] (Lista de dosis programadas: Dosis 2, Dosis 3, etc.)
```

**La ficha no guarda directamente el doctor ni la especialidad.** Se obtienen navegando por:  
`ficha → disponibilidad → doctores_especialidades → doctor/especialidad`

### 2.4 Modelo de Seguridad en DB

```
usuarios
 └─► usuarios_roles  (usuario_id FK, rol_id FK, desde, hasta)
      └─► roles
           └─► roles_permisos  (rol_id, permiso_id)
                └─► permisos
                     ├── tipo: 'frontend' | 'backend'
                     ├── ruta: '/dashboard/fichas' | '/api/fichas'
                     ├── metodos: ['GET', 'POST', 'PATCH']  (array)
                     ├── icono, nombre, descripcion, modulo
                     └── (solo frontend) ruta con :uuid para rutas dinámicas
```

---

## 3. Capa de Validación y Seguridad

### 3.1 `src/middleware.ts` — Primer Guardián

**Archivo:** `src/middleware.ts`  
**Runtime:** Edge Runtime de Next.js. Corre **antes** de que el servidor procese la request.

```typescript
// Matcher: solo rutas del dashboard
export const config = {
  matcher: ['/dashboard/:path*']
}
```

**Flujo:**

1. Llama `getToken({ req, secret })` de `next-auth/jwt` para decodificar el JWT **sin llamar a la base de datos**.
2. Si no hay token → redirect a `/auth/ingresar`.
3. Si hay token → lee `token.permisos` (array de rutas frontend del usuario).
4. Verifica si `pathname` está en la lista de permisos (exacto o con regex para rutas con `:uuid`).
5. Si no está permitido → redirect a `/dashboard`.
6. Si está permitido → `NextResponse.next()`.

> **Importante:** El middleware **no valida permisos de API**. Los permisos de API se validan dentro de cada route handler.

### 3.2 `src/auth.ts` — Configuración de NextAuth v5

**Archivo:** `src/auth.ts`  
Exporta: `{ handlers, signIn, signOut, auth }`

**Callback JWT (primer login):**

```
user (de authorize) → token = { id, username, name, role, roleDescription, permisos[] }
```

`permisos` en el JWT son solo las **rutas frontend** (`tipo: 'frontend'`) — se usan en el middleware sin tocar la DB.

**Callback session:**

```
token → session.user = { id, username, name, role, roleDescription, permisos[] }
```

**Provider:** Solo `Credentials` con campos `username` y `password`.

### 3.3 `src/lib/services/auth-service.ts` — Segundo Guardián (API Level)

**Clase estática `AuthService`** con tres métodos principales:

| Método                                    | Uso                                | Descripción                                                                                            |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `validateCredentials(username, password)` | Login en `auth.ts::authorize()`    | Verifica bcrypt, carga permisos frontend para el JWT                                                   |
| `validateApiPermission(route, method)`    | Inicio de cada API route handler   | Llama `auth()` (lee sesión), luego verifica en DB si el rol tiene permiso backend para esa ruta+método |
| `getProfilePermissions(userId)`           | Server action `getProfileRoutes()` | Carga permisos frontend completos (con metadatos) para el store del cliente                            |

**`validateApiPermission` (patrón usado en todas las API routes):**

```typescript
// Dentro de cualquier API Route handler:
const validation = await AuthService.validateApiPermission('/api/fichas', 'GET')
if (!validation.success) {
  return NextResponse.json(
    { error: validation.error },
    { status: validation.status }
  )
}
// validation.data = { id, username, role }
```

**`verifyAPIPermission` (método privado):**

- Busca en `usuarios_roles` donde `hasta: null` (rol vigente).
- Busca en `roles_permisos` si existe un permiso con `ruta` y `tipo: 'backend'` y el método en el array `metodos`.
- No usa ningún wrapper/HOF — es validación **manual** al inicio de cada handler.

### 3.4 RBAC vs ABAC — Dónde Ocurre Cada Uno

| Tipo        | Dónde                                              | Cómo                                                                             |
| ----------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| **RBAC**    | `AuthService.validateApiPermission()` + Middleware | Verifica si el ROL tiene permiso para la RUTA                                    |
| **ABAC**    | `FichasService.getFichas()` en `service.ts`        | Filtra por `userId` del doctor si el rol es `DOCTOR_GENERAL`                     |
| **ABAC UI** | `useProfileRoutes()` + `hasPermission()`           | Oculta botones (ej. "Registrar ficha") si el usuario no tiene el método `create` |

---

## 4. Patrones de UI

### 4.1 `CustomDataTable` — Tabla Reutilizable

**Archivo:** `src/app/components/ui/dataTable.tsx`

**Patrón de uso (Render Props / ReactNode[][]):**

```typescript
// El padre construye el contenido de celdas como ReactNode[][]
const contenidoTabla = fichas.map((ficha) => [
  <span key={ficha.id}># {ficha.orden_turno}</span>,
  ficha.paciente_nombres,
  <StatusBadge status={ficha.estado} />,
  <IconDotsVertical />
])

<CustomDataTable
  titulo="Lista de Fichas"
  columnas={[{ campo: '# Ficha' }, { campo: 'Paciente' }]}
  contenidoTabla={contenidoTabla}
  cargando={isLoading}
  error={isError}
  filtros={<TabsComponent />}
  acciones={[<button onClick={openModal}>Nuevo</button>]}
  numeracion={false}
  estilosPersonalizadosFila={(index, fila) => 'custom-class'}
/>
```

**Props clave:**

- `columnas`: define los headers de la tabla.
- `contenidoTabla`: array de filas, cada fila es un array de `ReactNode`.
- `filtros`: slot para tabs/filtros encima de la tabla.
- `acciones`: slot para botones de acción (ej. "Crear").
- `estilosPersonalizadosFila`: callback para estilos condicionales por fila.
- Es **responsive**: muestra tabla en desktop, tarjetas en móvil.

### 4.2 `Modal` — Modal con `<dialog>` Nativo

**Archivo:** `src/app/components/ui/modal/modal.tsx`  
**'use client'** — componente cliente.

**Patrón de uso:**

```typescript
// 1. El store Zustand controla el estado global
const { modal, openModal, closeModal } = useModal() // hook wrapper

// 2. Se usa en cualquier sección
<button onClick={openModal}>Abrir</button>
<Modal isOpen={modal} onClose={closeModal} title="Título" maxWidth="xl">
  <FormRegister />
</Modal>
```

**Características:**

- Usa `<dialog>` HTML nativo con `ref.showModal()` / `ref.close()`.
- Animaciones CSS (`modal-dialog` → `hide`) con `animationend` event.
- `disableBackdropClick`: bloquea cierre al hacer click fuera.
- `maxWidth`: prop para controlar el ancho (`sm | md | lg | xl | 2xl`).
- **Solo existe UN modal store global** (`src/store/modal.ts`) — esto significa que solo puede haber un modal abierto a la vez.

### 4.3 Formularios — React Hook Form + Zod + Sonner

**Patrón estándar de formulario:**

```typescript
// 1. Schema Zod en schemas/index.ts (co-locado con la feature)
const fichaSchema = z.object({
  cedula: z.string().min(7).max(10).regex(/^\d+$/),
  nombre: z.string().min(3).max(100),
  especialidad: z.uuid(),
  doctor: z.string().min(1)
})
type FichaFormData = z.infer<typeof fichaSchema>

// 2. useForm con zodResolver en el componente
const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
  reset
} = useForm<FichaFormData>({ resolver: zodResolver(fichaSchema) })

// 3. onSubmit llama al mutation de TanStack Query
const onSubmit = async (data: FichaFormData) => {
  const result = await createFicha.mutateAsync(data)
  if (result.success) {
    toast.success(result.message)
    reset()
    closeModal()
  } else {
    toast.error(result.message)
  }
}

// 4. El botón muestra estado de carga
;<button disabled={createFicha.isPending}>
  {createFicha.isPending ? 'Registrando...' : 'Guardar'}
</button>
```

**Notificaciones:** siempre con `sonner` (`toast.success` / `toast.error`).

### 4.4 Zustand Stores — Estado Global del Cliente

| Store                   | Archivo                    | Estado                                                                   | Cuándo usar                                                               |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `useModalStore`         | `store/modal.ts`           | `isOpen: boolean`                                                        | Controlar apertura/cierre del modal global                                |
| `usePatientStore`       | `store/patient/patient.ts` | `fichaId, pacienteId, pacienteNombres, doctorNombre, especialidadNombre` | Pasar datos del paciente seleccionado entre componentes sin prop drilling |
| `useProfileRoutesStore` | `store/profile-routes.ts`  | `routes[], hasPermission()`                                              | Permisos CRUD del usuario actual para la UI                               |
| `useSidebarStore`       | `store/sidebar.ts`         | `isOpen`                                                                 | Estado del sidebar                                                        |
| `useAsideStore`         | `store/aside.ts`           | `isOpen`                                                                 | Estado del panel lateral                                                  |

**Patrón de acceso (siempre vía hook wrapper):**

```typescript
// No usar el store directamente en componentes:
import useModal from '@/hooks/useModal' // correcto
import useModalStore from '@/store/modal' // solo si necesitas acceso directo
```

### 4.5 `useUser` — Leer el Rol del Usuario

**Archivo:** `src/hooks/useUser.ts`  
Usa `useSession()` de NextAuth para exponer los datos del usuario:

```typescript
const { user } = useUser()
// user = { id, usename, name, role: 'DOCTOR_FICHAS' | 'DOCTOR_GENERAL' | ..., roleName }
```

**Vista condicional por rol (patrón en page.tsx):**

```typescript
const { user } = useUser()
const { role } = user

// Renderizar componente según rol
{
  ;(Roles.DOCTOR_FICHAS === role || Roles.ADMINISTRADOR === role) && (
    <DashboardDoctorFichas fichas={fichas} />
  )
}
{
  Roles.DOCTOR_GENERAL === role && <DashboardDoctorGeneral fichas={fichas} />
}
```

### 4.6 `useProfileRoutes` — RBAC en la UI

**Archivo:** `src/hooks/useProfileRoutes.ts`

Carga los permisos del usuario desde el servidor via Server Action `getProfileRoutes()` y los guarda en `useProfileRoutesStore`. Expone:

```typescript
const { read, create, update, delete: deletePerm, loading } = useProfileRoutes()

// Ocultar botón si el usuario no tiene permiso de creación en la ruta actual
{
  create && <button onClick={openModal}>Registrar nueva ficha</button>
}
```

Los métodos `read/create/update/delete` verifican si la ruta actual (`usePathname()`) y la acción correspondiente están en los permisos del usuario.

### 4.7 TanStack Query — Capa de Data Fetching

**Patrón en `src/app/services/`:**

```typescript
// Query (lectura)
const fichasQuery = useQuery({
  queryKey: ['fichas'],
  queryFn: () => apiClient.get('/fichas').then(r => r.data.data),
  staleTime: 5 * 60 * 1000 // 5 minutos de caché
})

// Mutation (escritura) con invalidación automática
const createFicha = useMutation({
  mutationFn: data => apiClient.post('fichas', data).then(r => r.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['fichas'] })
    queryClient.invalidateQueries({ queryKey: ['especialidad'] })
  }
})
```

**`apiClient`** (`src/app/services/client.ts`): instancia de Axios con `baseURL: '/api/'`.

---

## 5. Ciclo de Vida de una Petición — "Doctor de Fichas crea una Ficha"

### Paso a Paso Completo

```
[USUARIO] Click en "Registrar nueva ficha"
    │
    ▼
[UI] doctor-fichas.tsx::openModal()
    → useModalStore.setIsOpen(true)
    → <Modal isOpen={true}> muestra <FormRegister />
    │
    ▼
[UI] FormRegister.tsx — usuario completa el formulario
    → watch('especialidad') filtra doctores disponibles en el select
    → handleSubmit(onSubmit) — React Hook Form valida con fichaSchema (Zod)
    │
    ├─ [VALIDACIÓN CLIENTE - ZOD] fichaSchema.safeParse(data)
    │   cedula: min 7, max 10, solo dígitos
    │   nombre: min 3, solo letras y espacios
    │   especialidad: uuid válido
    │   doctor: string numérico
    │   → Si falla: errors se muestran inline en el form
    │
    ▼
[SERVICE] useFichas().createFicha.mutateAsync(data)
    → apiClient.post('fichas', data)  [Axios, baseURL='/api/']
    │
    ▼
[NETWORK] POST /api/fichas  (HTTP Request al servidor)
    │
    ▼
[MIDDLEWARE] src/middleware.ts — NO intercepta /api/*, solo /dashboard/*
    (se salta, la API no pasa por el middleware de rutas)
    │
    ▼
[API ROUTE] src/app/api/fichas/route.ts::POST(request)
    │
    ├─ [PASO 1] AuthService.validateApiPermission('/api/fichas', 'POST')
    │   → auth() — lee sesión del JWT (no toca DB)
    │   → Si no hay sesión → { success: false, status: 401 }
    │   → verifyAPIPermission(userId, '/api/fichas', 'POST')
    │       → query DB: usuarios_roles → roles → roles_permisos → permisos
    │         WHERE ruta='/api/fichas' AND tipo='backend' AND metodos HAS 'POST'
    │         AND hasta IS NULL (rol vigente)
    │   → Si no tiene permiso → { success: false, status: 403 }
    │   → Si OK → { success: true, data: { id, username, role } }
    │
    ├─ [PASO 2] Parsear body y validar con fichaSchema (Zod, SEGUNDA validación)
    │   → Si falla → 400 con detalle de errores
    │
    ├─ [PASO 3] Verificar/Crear persona
    │   → prisma.personas.findUnique({ where: { ci: cedula } })
    │   → Si existe: valida que el nombre coincida
    │   → Si no existe: prisma.personas.create({ ci, nombres, paterno, materno })
    │
    ├─ [PASO 4] Verificar/Crear paciente
    │   → prisma.pacientes.findUnique({ where: { paciente_id: cedula } })
    │   → Si no existe: prisma.pacientes.create({ paciente_id: cedula, ... })
    │
    ├─ [PASO 5] Determinar turno actual
    │   → getTurnoActual() en src/app/utils/date.ts
    │   → Retorna 'AM' si hora < 13, 'PM' si >= 13 (zona horaria Bolivia)
    │
    ├─ [PASO 6] Buscar disponibilidad del doctor
    │   → prisma.disponibilidades.findFirst({
    │       where: {
    │         doctores_especialidades: { doctor_id, especialidad_id },
    │         turnos_catalogo: { codigo: turno }
    │       },
    │       include: { _count: { fichas: { where: { fecha HOY } } } }
    │     })
    │   → Si no hay disponibilidad → 400 "No hay disponibilidad"
    │   → Si cupos llenos (count >= cupos) → 400 "Sin cupos"
    │
    ├─ [PASO 7] Calcular orden_turno
    │   → siguienteOrden = disponibilidad._count.fichas + 1
    │
    ├─ [PASO 8] Crear ficha en DB
    │   → prisma.fichas.create({
    │       paciente_id: cedula,
    │       disponibilidad_id: disponibilidad.id,
    │       fecha_ficha: new Date(),
    │       orden_turno: siguienteOrden,
    │       estado: 'PENDIENTE',
    │       creado_por: userId
    │     })
    │   → Constraint único: [disponibilidad_id, fecha_ficha, orden_turno]
    │     (previene duplicados por concurrencia → 409 si falla)
    │
    ▼
[RESPONSE] 201 { success: true, message: "Ficha creada...", data: { ficha_id, ... } }
    │
    ▼
[SERVICE] useFichas().createFicha.onSuccess()
    → queryClient.invalidateQueries(['fichas'])    → refetch automático
    → queryClient.invalidateQueries(['especialidad']) → actualiza contadores
    │
    ▼
[UI] FormRegister.tsx::onSubmit resultado
    → toast.success("Ficha creada exitosamente...") [Sonner]
    → reset() — limpia el formulario
    → closeModal() — cierra el modal (Zustand)
    │
    ▼
[UI] CustomDataTable se re-renderiza con la nueva ficha visible
```

---

## 6. Patrones y Convenciones Establecidas

### 6.1 Alias de Importación

El proyecto usa `@/` para referenciar desde `src/`:

```typescript
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { fichaSchema } from '@/app/dashboard/fichas/schemas'
import { Roles } from '@/app/api/lib/constants'
```

### 6.2 Co-localización de Schemas

Los schemas Zod viven **junto a la feature** que los usa:

```
src/app/dashboard/fichas/schemas/index.ts  ← schema de ficha
```

El schema es importado tanto por el formulario del cliente como por la API route del servidor (misma validación en ambos lados).

### 6.3 Soft Delete

Todos los modelos tienen `eliminado_en DateTime?` y `eliminado_por String?`.  
Las queries siempre filtran `eliminado_en: null` para excluir registros eliminados.

### 6.4 Auditoría

Todos los modelos tienen: `creado_en`, `creado_por`, `actualizado_en`, `actualizado_por`.  
Existe tabla `auditoria_log` con `registro_antiguo / registro_nuevo` JSON.

### 6.5 Zona Horaria

El sistema opera en **Bolivia (America/La_Paz, UTC-4)**.  
`getRangoUTCBoliviaHoy()` y `getTurnoActual()` en `src/app/utils/date.ts` son los helpers clave para consultas de fichas del día.

### 6.6 Turno AM/PM

El turno se determina por la hora actual de Bolivia: `< 13:00 → 'AM'`, `>= 13:00 → 'PM'`.  
El código `turno_catalogo` se guarda como string `'AM'` o `'PM'` en la tabla.

### 6.7 Linting y Formato

- **OXLint** para linting (no ESLint). Configurado en `.oxlintrc.json`.
- **Prettier** para formato.
- **Husky + lint-staged**: corre validaciones antes de cada commit.
- Los comentarios `// oxlint-disable rule-name` se usan para deshabilitar reglas específicas.

### 6.8 Reglas Semánticas de Git

- **Commitizen** con `cz-conventional-changelog`.
- Usar `npm run commit` para commits asistidos.
- **CommitLint** verifica el formato del mensaje.

---

## 7. Deuda Técnica Identificada

| Item                         | Archivo                        | Descripción                                                                             |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| Server Action duplicada      | `src/actions/fichas/create.ts` | Mismo lógica que POST /api/fichas. Comentario dice "ELIMINAR". Usar solo la API Route.  |
| `any` types                  | múltiples                      | `formRegister.tsx`, `fichas.ts`, `service.ts` usan `any`. Debería tipificarse con DTOs. |
| Datos quemados en `useUser`  | `src/hooks/useUser.ts`         | Mapa de roles con `TODO` — si se añade un nuevo rol no se reflejaría.                   |
| Un solo modal global         | `src/store/modal.ts`           | El store `isOpen` es global y singular — no soporta múltiples modales simultáneos.      |
| Contadores de tarjetas fijos | `doctor-fichas.tsx` línea 81   | Los números "13", "10", "1" están hardcodeados. Debería calcularse desde `fichas`.      |
| Typo en servicio             | `src/app/services/fichas.ts`   | `queryKey: ['espcialidad']` (falta la 'e') — invalidación incorrecta.                   |
