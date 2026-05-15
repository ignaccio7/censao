# Guía de Referencia Técnica — Proyecto Censao

> Centro de Salud Alto Obrajes · Sistema de Gestión de Fichas Médicas y Monitoreo de Vacunación  
> **Stack:** Next.js 15 · NextAuth v5 (beta.29) · Prisma v6 · PostgreSQL · TanStack Query · Zustand · Zod v4 · Sonner · @stepperize/react

---

## 0. Contexto de Negocio (Resumen para el Agente)

| Rol              | Clave interna    | Descripción                                                                                                                                         |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Administrador    | `ADMINISTRADOR`  | Acceso total: gestiona usuarios, roles, vacunas, horarios, reportes                                                                                 |
| Doctor de Fichas | `DOCTOR_FICHAS`  | Registra pacientes, crea fichas presenciales (ADMISION), genera lote de citas programadas, ve pacientes del centro de salud y sus fichas históricas |
| Enfermería       | `ENFERMERIA`     | Triage básico, asigna médico Y aplica vacunas (orden flexible), gestiona tratamientos de vacunación                                                  |
| Doctor General   | `DOCTOR_GENERAL` | Solo ve fichas asignadas a él, atiende pacientes, registra consultas médicas (NO vacunas)                                                           |
| Paciente         | `PACIENTE`       | Solo ve sus propias fichas, vacunas y citas; nunca crea fichas                                                                                      |

**Flujo central:** Paciente llega → Doctor de Fichas crea Ficha (ADMISION) → Enfermería llama al paciente (ENFERMERIA, triage) → Enfermería asigna médico y/o aplica vacunas (orden flexible) → Ficha pasa a EN_ESPERA → Ficha aparece en pantalla del Doctor General y pantalla pública → Médico llama al paciente (ATENDIENDO) → Doctor General atiende, registra consulta si corresponde, y marca como ATENDIDA.

**Fichas programadas (lote):** Citas VACUNA → ficha en ADMISION (pasa por Enfermería). Citas CONTROL/CONSULTA → ficha en EN_ESPERA con disponibilidad_id del doctor original (directo a cola médica).

**Identificación física:** El paciente recibe un cartón en Admisión con su número de ficha. Si hay reasignación, el número no cambia — solo cambia bajo qué médico aparece en la pantalla pública.

**Estados de `fichas`:** `ADMISION | ENFERMERIA | EN_ESPERA | ATENDIENDO | ATENDIDA | CANCELADA` (enum `EstadoFicha` en Prisma) — **6 estados confirmados en schema.prisma**.

**Relación `citas → fichas`:** `fichas.cita_origen_id` (nullable FK → `citas.id`). `NULL` = ficha presencial; valor = ficha generada en lote desde cita programada. Una cita genera máximo una ficha (`"CitaToFicha"`).

**Orden de turno:** Positivo para presenciales (1, 2, 3…), negativo para citas programadas (-1, -2, -3…).

**Modelo de seguridad:** Híbrido **RBAC + ABAC**:

- RBAC: cada rol tiene permisos distintos almacenados en DB (`roles → roles_permisos → permisos`).
- ABAC: validación de atributos en cada ruta (ej. Doctor General solo ve fichas en estado **EN_ESPERA** donde la disponibilidad está vinculada a su usuario_id; Enfermería solo ve fichas en estado **ADMISION**).

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
    │   │   ├── admin/         # APIs administrativas (solo ADMINISTRADOR)
    │   │   │   └── usuarios/  # CRUD de usuarios del sistema
    │   │   │       ├── route.ts       # GET (lista paginada+search), POST (crear), DELETE (soft delete)
    │   │   │       └── [uuid]/
    │   │   │           └── route.ts   # PATCH (actualizar usuario, rol, datos condicionales)
    │   │   ├── fichas/        # route.ts + service.ts — CRUD de fichas
    │   │   │   └── publico/   # route.ts — pantalla pública (sin auth)
    │   │   ├── doctor/        # route.ts — listado de doctores
    │   │   ├── especialidad/  # API de especialidades y disponibilidades
    │   │   ├── tratamientos/  # API de tratamientos
    │   │   └── lib/
    │   │       └── constants/ # Enums Roles, RoleValue, RoleGroups, RECORD_TYPES compartidos
    │   │
    │   ├── components/        # Componentes REUTILIZABLES globales
    │   │   ├── icons/         # Íconos SVG como componentes React
    │   │   └── ui/
    │   │       ├── dataTable.tsx      # CustomDataTable — tabla principal del sistema
    │   │       ├── modal/modal.tsx    # Modal basado en <dialog> nativo HTML
    │   │       ├── form/custom-input.tsx
    │   │       ├── pagination.tsx     # Paginación con searchParams (Server Component)
    │   │       ├── inputSearch.tsx    # Buscador con debounce vía searchParams
    │   │       ├── skeletons/         # Componentes skeleton para Suspense
    │   │       │   └── skeletonTable.tsx
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
    │   │   │   │   ├── FormReassign.tsx   # Formulario para reasignar fichas
    │   │   │   │   └── statusBadge.tsx    # Badge visual de estado
    │   │   │   └── sections/dashboard/
    │   │   │       ├── doctor-fichas.tsx  # Vista para DOCTOR_FICHAS y ADMINISTRADOR
    │   │   │       └── doctor-general.tsx # Vista para DOCTOR_GENERAL
    │   │   ├── paciente/      # Feature: Vista del Paciente
    │   │   │   ├── tratamientos/          # Tratamientos de vacunación (solo lectura)
    │   │   │   ├── citas/                 # Citas del paciente
    │   │   │   ├── chat/                  # Chat del paciente
    │   │   │   └── utils/                 # Utilidades compartidas
    │   │   ├── atencion/      # Feature: Módulo de atención (DOCTOR_FICHAS, DOCTOR_GENERAL, ADMIN)
    │   │   │   └── pacientes/ # Lista y detalle de pacientes del centro (fichas históricas)
    │   │   ├── admin/         # Feature: Módulo de administración (solo ADMINISTRADOR)
    │   │   │   ├── usuarios/  # CRUD completo de usuarios con formulario multipaso
    │   │   │   │   ├── page.tsx              # Lista paginada con search (Server Component)
    │   │   │   │   ├── schemas/index.ts      # createUsuarioSchema, updateUsuarioSchema (Zod multipaso)
    │   │   │   │   ├── interfaces/index.ts   # Tipo Usuario
    │   │   │   │   ├── crear/
    │   │   │   │   │   └── page.tsx          # Página de creación (carga roles desde DB)
    │   │   │   │   ├── [uuid]/
    │   │   │   │   │   └── editar/
    │   │   │   │   │       └── page.tsx      # Página de edición (carga usuario + roles)
    │   │   │   │   └── components/
    │   │   │   │       ├── usersTable.tsx     # Tabla de usuarios (Server Component)
    │   │   │   │       ├── switchState.tsx    # Toggle activo/inactivo
    │   │   │   │       ├── buttonDelete.tsx   # Botón de eliminar
    │   │   │   │       ├── crear/
    │   │   │   │       │   └── formCreateUser.tsx  # Form multipaso con @stepperize/react
    │   │   │   │       ├── editar/
    │   │   │   │       │   └── formEditUser.tsx    # Form multipaso edición (reutiliza steps)
    │   │   │   │       └── multistep/         # Componentes compartidos del wizard
    │   │   │   │           ├── stepperIndicator.tsx  # Indicador visual de progreso
    │   │   │   │           ├── stepPersona.tsx       # Paso 1: Datos personales (CI, nombre...)
    │   │   │   │           ├── stepCredenciales.tsx  # Paso 2: Username y password
    │   │   │   │           ├── stepRol.tsx           # Paso 3: Rol + campos condicionales
    │   │   │   │           └── stepResumen.tsx       # Paso 4: Resumen antes de confirmar
    │   │   │   └── vacunas/   # Feature: Gestión de vacunas (placeholder)
    │   │   │       └── page.tsx
    │   │   ├── tratamientos/  # Feature: Tratamientos globales (DOCTOR_GENERAL + ADMIN)
    │   │   ├── estado-doctores/ # Feature: Disponibilidad de médicos
    │   │   ├── notificaciones/ # Feature: Recordatorios
    │   │   └── perfil/        # Feature: Perfil de usuario
    │   │
    │   ├── services/          # CAPA DE SERVICIO FRONTEND (TanStack Query hooks)
    │   │   ├── client.ts      # Instancia de Axios configurada con baseURL=/api/
    │   │   ├── fichas.ts      # useFichas() — queries y mutations para /api/fichas
    │   │   ├── usuarios.ts    # useUsuarios(), useUsuario(uuid) — mutations para /api/admin/usuarios
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
    ├── services/              # CAPA DE SERVICIO SERVIDOR (acceso directo a Prisma)
    │   └── usuarios.ts        # UserssService — getAllUsers(), countUsers() para Server Components
    │
    └── lib/                   # UTILIDADES DE SERVIDOR
        ├── prisma/prisma.ts   # Singleton del PrismaClient
        ├── services/
        │   └── auth-service.ts # AuthService — validación de credenciales y permisos API
        └── constants/index.ts # StateRecord, StateRecordValue, Roles, RoleValue, RoleGroups
```

> **Nota sobre `src/actions/fichas/create.ts`:** Este archivo tiene un comentario `// ELIMINAR ESTO YA QUE ES UN ENDPOINT DE LA API`. La funcionalidad real de crear fichas se delegó a la API Route `POST /api/fichas`. El Server Action existe como versión alternativa pero no es el flujo activo.

---

## 2. Flujo de Rutas y API

### 2.1 Mapa de API Routes

| Ruta                             | Método             | Handler                     | Modelos Prisma involucrados                                                                                    | Descripción                                                                            |
| -------------------------------- | ------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/api/auth/[...nextauth]`        | GET/POST           | NextAuth handler auto       | `usuarios`, `usuarios_roles`, `roles`, `permisos`                                                              | Login/logout/session                                                                   |
| `/api/fichas`                    | GET                | `FichasService.getFichas()` | `fichas`, `disponibilidades`, `doctores_especialidades`, `doctores`, `especialidades`, `pacientes`, `personas` | Lista fichas del turno actual según rol                                                |
| `/api/fichas`                    | POST               | `route.ts::POST`            | `personas`, `pacientes`, `disponibilidades`, `fichas`                                                          | Crea persona+paciente si no existe, verifica cupos, crea ficha con estado ADMISION     |
| `/api/fichas`                    | PATCH              | `route.ts::PATCH`           | `fichas`                                                                                                       | Actualiza estado de una ficha (ADMISION→ENFERMERIA→ATENDIDA/CANCELADA)                 |
| `/api/fichas/publico`            | GET                | `route.ts::GET`             | `fichas`, `disponibilidades`, `doctores`, `personas`                                                           | Pantalla pública de atención (sin auth, polling)                                       |
| `/api/fichas/generar-citas-lote` | POST               | `route.ts::POST`            | `citas`, `fichas`, `disponibilidades`                                                                          | Genera fichas en lote de citas programadas del turno (DOCTOR_FICHAS)                   |
| `/api/atencion/pacientes`        | GET, POST          | —                           | `pacientes`, `personas`, `fichas`                                                                              | Lista pacientes del centro / asigna paciente (DOCTOR_FICHAS, DOCTOR_GENERAL, ADMIN)    |
| `/api/atencion/pacientes/:uuid`  | GET, PATCH, DELETE | —                           | `pacientes`, `personas`, `fichas`                                                                              | Detalle, modificación y eliminación de paciente (DOCTOR_FICHAS, DOCTOR_GENERAL, ADMIN) |
| `/api/admin/usuarios`            | GET                | `route.ts::GET`             | `usuarios`, `personas`, `usuarios_roles`, `roles`                                                              | Lista usuarios paginada con búsqueda (solo ADMIN)                                      |
| `/api/admin/usuarios`            | POST               | `route.ts::POST`            | `personas`, `usuarios`, `usuarios_roles`, `roles`, `doctores`, `pacientes`                                     | Crea usuario completo en transacción (persona+usuario+rol+datos condicionales)         |
| `/api/admin/usuarios`            | DELETE             | `route.ts::DELETE`          | `usuarios`                                                                                                     | Soft delete de usuario (solo ADMIN)                                                    |
| `/api/admin/usuarios/:uuid`      | PATCH              | `route.ts::PATCH`           | `personas`, `usuarios`, `usuarios_roles`, `roles`, `doctores`, `pacientes`                                     | Actualiza usuario en transacción (persona+password+rol+datos condicionales)            |
| `/api/admin/doctores`            | GET                | `DoctoresService`           | `doctores`, `personas`, `doctores_especialidades`, `especialidades`, `disponibilidades`                        | Lista doctores DOCTOR_GENERAL con especialidades y disponibilidades (solo ADMIN)       |
| `/api/admin/doctores/:uuid`      | GET                | `route.ts::GET`             | `doctores`, `personas`, `doctores_especialidades`, `especialidades`, `disponibilidades`, `turnos_catalogo`     | Detalle del doctor con todas sus asignaciones (solo ADMIN)                             |
| `/api/admin/doctores/:uuid`      | PATCH              | `route.ts::PATCH`           | `doctores`, `doctores_especialidades`, `disponibilidades`                                                      | Actualiza matrícula + sincroniza especialidades y disponibilidades (inactivación)      |
| `/api/doctor`                    | GET                | `route.ts::GET`             | `doctores`, `personas`, `doctores_especialidades`                                                              | Lista doctores disponibles                                                             |
| `/api/especialidad`              | GET                | —                           | `especialidades`, `doctores_especialidades`, `disponibilidades`                                                | Lista especialidades con doctores y capacidades                                        |
| `/api/estado-doctores`           | GET                | —                           | `doctores`, `disponibilidades`                                                                                 | Disponibilidad y carga de médicos (Enfermería)                                         |
| `/api/tratamientos`              | GET, POST          | —                           | `tratamientos`, `fichas`, `esquema_dosis`, `citas`                                                             | Gestión de tratamientos de vacunación (ENFERMERIA)                                     |
| `/api/consultas`                 | GET, POST          | —                           | `consultas`, `fichas`, `citas`                                                                                 | Gestión de consultas médicas (DOCTOR_GENERAL) — **NUEVO v4**                           |
| `/api/consultas/paciente/:uuid`  | GET, PATCH         | —                           | `consultas`, `fichas`, `pacientes`                                                                             | Consultas de un paciente específico (DOCTOR_GENERAL) — **NUEVO v4**                    |

### 2.2 Convención de Nombres

- Las rutas siguen el patrón de **recursos en español y snake_case** internamente en la DB, pero los endpoints usan **inglés/español simple** (`/api/fichas`, `/api/doctor`).
- Las rutas administrativas están bajo `/api/admin/` (ej. `/api/admin/usuarios`).
- Todas las rutas de la API están bajo `/api/` (prefijo de Next.js App Router).
- Las API Routes NO usan dinamic segments `[id]` todavía — los IDs se pasan en el body del PATCH.

### 2.3 Relación de Modelos Prisma (Cadena Principal)

```
fichas
 └─► disponibilidades  (disponibilidad_id, estado: Boolean)
      ├─► turnos_catalogo  (turno_codigo: 'AM' | 'PM')
      └─► doctores_especialidades  (doctor_especialidad_id)
           ├─► doctores  (doctor_id)
           │    └─► personas  (doctor_id = personas.ci)
           └─► especialidades  (especialidad_id, estado: Boolean)
 └─► pacientes  (paciente_id = personas.ci)
      └─► personas  (paciente_id)
 └─► tratamientos[] (Seguimiento vacunación — registrado por ENFERMERIA)
      └─► citas[] (Dosis programadas: Dosis 2, Dosis 3, etc.)
 └─► consultas[] (Consultas médicas — registrado por DOCTOR_GENERAL)
      └─► citas[] (Citas de retorno: control, consulta)
```

> **Cambio v4:** `citas` tiene doble FK opcional: `tratamiento_id` (vacunas) O `consulta_id` (consultas) — nunca ambos.

**La ficha no guarda directamente el doctor ni la especialidad.** Se obtienen navegando por:  
`ficha → disponibilidad → doctores_especialidades → doctor/especialidad`

### 2.3.1 Campo `estado: Boolean` — Inactivación Lógica

| Tabla              | Campo    | `true`                                      | `false`                                                    |
| ------------------ | -------- | ------------------------------------------- | ---------------------------------------------------------- |
| `disponibilidades` | `estado` | Activa — recibe fichas nuevas               | Inactiva — NO recibe fichas nuevas pero conserva historial |
| `especialidades`   | `estado` | Activa — se puede asignar a nuevos doctores | Inactiva — NO aparece en selects de nuevas asignaciones    |

**Reglas:**

- Al desactivar una disponibilidad, NO se elimina — solo `estado = false`
- Los doctores que YA tenían una especialidad inactiva conservan sus registros históricos
- Enfermería al asignar médico filtra `disponibilidades.estado = true`
- Admin al agregar especialidad a un doctor filtra `especialidades.estado = true`

**Nueva relación `citas → fichas`:** `fichas.cita_origen_id` (nullable FK → `citas.id`) | `citas.ficha_generada fichas[]` (relación `"CitaToFicha"`). NULL = presencial; valor = generada en lote desde cita programada.

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
| **ABAC**    | Enfermería: `service.ts`                           | Filtra fichas en estado `ADMISION` para el triage                                |
| **ABAC UI** | `useProfileRoutes()` + `hasPermission()`           | Oculta botones (ej. "Registrar ficha") si el usuario no tiene el método `create` |

### 3.5 Matriz de Acciones sobre Fichas por Rol

| Acción                                   | DOCTOR_FICHAS | ENFERMERIA | DOCTOR_GENERAL | ADMINISTRADOR |
| ---------------------------------------- | ------------- | ---------- | -------------- | ------------- |
| Crear ficha (ADMISION)                   | ✅            | ❌         | ❌             | ✅            |
| Generar lote citas                       | ✅            | ❌         | ❌             | ❌            |
| Llamar para triage (ADMISION→ENFERMERIA) | ❌            | ✅         | ❌             | ✅            |
| Asignar médico (ENFERMERIA→EN_ESPERA)    | ❌            | ✅         | ❌             | ✅            |
| Aplicar vacunas / Registrar tratamiento  | ❌            | ✅         | ❌             | ❌            |
| Llamar paciente (EN_ESPERA→ATENDIENDO)   | ❌            | ❌         | ✅             | ❌            |
| Registrar consulta médica                | ❌            | ❌         | ✅             | ❌            |
| Finalizar atención (ATENDIENDO→ATENDIDA) | ❌            | ❌         | ✅             | ❌            |
| Cancelar ficha                           | ✅            | ✅         | ✅             | ✅            |
| Reasignar ficha                          | ✅            | ✅         | ❌             | ✅            |

> **Cambio v4:** Enfermería gana "Aplicar vacunas / Registrar tratamiento". Doctor General gana "Registrar consulta médica" y pierde acceso directo a tratamientos de vacunación.

---

### 3.6 Permisos Administrativos del ADMINISTRADOR

| Recurso             | Frontend                                 | Backend                           | Métodos            |
| ------------------- | ---------------------------------------- | --------------------------------- | ------------------ |
| Gestión de Usuarios | `/dashboard/admin/usuarios`              | `/api/admin/usuarios`             | CRUD completo      |
| Crear Usuario       | `/dashboard/admin/usuarios/crear`        | `/api/admin/usuarios` POST        | create             |
| Editar Usuario      | `/dashboard/admin/usuarios/:uuid/editar` | `/api/admin/usuarios/:uuid` PATCH | update             |
| Gestión de Vacunas  | `/dashboard/admin/vacunas`               | `/api/admin/vacunas`              | CRUD (placeholder) |

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

### 4.8 Formularios Multipaso — `@stepperize/react`

**Dependencia:** `@stepperize/react` (librería de stepper declarativo)

**Patrón implementado en:** `src/app/dashboard/admin/usuarios/`

```typescript
// 1. Definir pasos con defineStepper()
import { defineStepper } from '@stepperize/react'

const { useStepper } = defineStepper(
  { id: 'persona', title: 'Datos Personales', description: 'Identificación' },
  { id: 'credenciales', title: 'Credenciales', description: 'Acceso al sistema' },
  { id: 'rol', title: 'Rol', description: 'Permisos' },
  { id: 'resumen', title: 'Confirmar', description: 'Revisión final' }
)

// 2. Validación parcial por paso con form.trigger()
const STEP_FIELDS: Record<string, (keyof FormData)[]> = {
  persona: ['ci', 'nombres', 'paterno', ...],
  credenciales: ['username', 'password', 'confirmar_password'],
  rol: ['rol_id'],
  resumen: []
}

const handleNext = async (e: React.MouseEvent) => {
  e.preventDefault()
  const fields = STEP_FIELDS[stepper.state.current.data.id]
  const valid = await form.trigger(fields) // Valida SOLO campos del paso actual
  if (valid) stepper.navigation.next()
}

// 3. Schema compuesto con merge + superRefine
const createUsuarioSchema = stepPersonaSchema
  .merge(stepCredencialesSchema)
  .merge(stepRolSchema)
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmar_password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '...', path: ['confirmar_password'] })
    }
  })

// 4. Renderizado condicional por paso
{stepper.state.current.data.id === 'persona' && <StepPersona form={form} />}
{stepper.state.current.data.id === 'credenciales' && <StepCredenciales form={form} />}

// 5. Navegación: stepper.navigation.next(), stepper.navigation.prev()
// 6. Estado: stepper.state.isFirst, stepper.state.isLast
```

**Reutilización Crear→Editar:** Los componentes de cada paso (`StepPersona`, `StepCredenciales`, `StepRol`, `StepResumen`) aceptan prop `isEdit` para adaptar campos (ej. CI deshabilitado en edición, password opcional).

**Campos condicionales por rol:** `StepRol` muestra campos extra según el rol seleccionado:

- Roles con "DOCTOR": campo `matricula`
- Rol "PACIENTE": campos `fecha_nacimiento`, `sexo`, `grupo_sanguineo`

### 4.9 Server Components con Auth Directa en Page

**Patrón en páginas administrativas (Server Components):**

```typescript
// page.tsx — Server Component (NO 'use client')
export default async function UsuariosPage({ searchParams }) {
  // Validación de permisos directa en la página
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'GET'
  )
  if (!validation.success) redirect('/dashboard')

  // Datos cargados en servidor con Prisma directo o servicio
  const usuarios = await UserssService.getAllUsers({
    search,
    page,
    numberPerPage
  })

  return (
    <Suspense fallback={<SkeletonTable columns={5} rows={5} />}>
      <UsersTable search={search} page={page} />
    </Suspense>
  )
}
```

**Diferencia con el patrón de fichas:** Las páginas admin usan Server Components con `Suspense` + `SkeletonTable` en vez de TanStack Query en el cliente. La data se carga directamente en el servidor vía `UserssService` (Prisma directo).

### 4.10 Servicios Servidor vs Cliente

| Capa         | Ubicación                      | Patrón                                                          | Usado por                            |
| ------------ | ------------------------------ | --------------------------------------------------------------- | ------------------------------------ |
| **Servidor** | `src/services/usuarios.ts`     | Clase estática con métodos Prisma (`getAllUsers`, `countUsers`) | Server Components (pages, tables)    |
| **Cliente**  | `src/app/services/usuarios.ts` | Hooks TanStack Query (`useUsuarios`, `useUsuario`)              | Client Components (forms, mutations) |

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
// user = { id, username, name, role: 'DOCTOR_FICHAS' | 'ENFERMERIA' | 'DOCTOR_GENERAL' | 'ADMINISTRADOR' | 'PACIENTE', roleName }
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
  Roles.ENFERMERIA === role && (
    <DashboardEnfermeria fichas={fichas} /> // Fichas en estado ADMISION para triage
  )
}
{
  Roles.DOCTOR_GENERAL === role && (
    <DashboardDoctorGeneral fichas={fichas} /> // Fichas en estado ENFERMERIA asignadas
  )
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
    │   → (positivo para presenciales)
    │
    ├─ [PASO 8] Crear ficha en DB
    │   → prisma.fichas.create({
    │       paciente_id: cedula,
    │       disponibilidad_id: disponibilidad.id,
    │       fecha_ficha: new Date(),
    │       orden_turno: siguienteOrden,
    │       estado: 'ADMISION',
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
[UI] CustomDataTable se re-renderiza con la nueva ficha visible (estado ADMISION)
```

---

## 6. Flujo Completo de una Ficha (de ADMISION a ATENDIDA)

```
[ADMISIÓN] Doctor de Fichas crea ficha → estado: ADMISION, orden_turno: +N
    │
    ▼
[ENFERMERÍA] Enfermera ve ficha en cola ADMISION
    → Evalúa motivo de consulta
    → Si requiere vacunación:
        → Aplica vacuna y registra Tratamiento (vinculado a ficha vía ficha_origen_id)
        → Registra Cita(s) futuras de dosis (vinculadas al tratamiento)
    → Determina especialidad y médico disponible
    → Asigna médico → estado: EN_ESPERA
    (Nota: vacunación y asignación pueden ocurrir en cualquier orden)
    │
    ▼
[DOCTOR GENERAL] Médico ve ficha en su cola EN_ESPERA
    → Llama al paciente → estado: ATENDIENDO
    → Atiende al paciente
    → Si no requiere seguimiento → estado: ATENDIDA
    → Si requiere consulta de retorno:
        → Crea Consulta (vinculada a ficha vía ficha_origen_id)
        → Registra Cita(s) de retorno (vinculadas a la consulta)
        → Opcionalmente crea usuario del paciente
        → estado: ATENDIDA

[FICHAS PROGRAMADAS — Generación en Lote]
    → Citas tipo VACUNA → ficha en ADMISION (pasa por Enfermería)
    → Citas tipo CONTROL/CONSULTA → ficha en EN_ESPERA con disponibilidad_id original
```

---

## 7. Patrones y Convenciones Establecidas

### 7.1 Alias de Importación

El proyecto usa `@/` para referenciar desde `src/`:

```typescript
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { fichaSchema } from '@/app/dashboard/fichas/schemas'
import { Roles } from '@/app/api/lib/constants'
```

### 7.2 Co-localización de Schemas

Los schemas Zod viven **junto a la feature** que los usa:

```
src/app/dashboard/fichas/schemas/index.ts  ← schema de ficha
```

El schema es importado tanto por el formulario del cliente como por la API route del servidor (misma validación en ambos lados).

### 7.3 Soft Delete

Todos los modelos tienen `eliminado_en DateTime?` y `eliminado_por String?`.  
Las queries siempre filtran `eliminado_en: null` para excluir registros eliminados.

### 7.4 Auditoría

Todos los modelos tienen: `creado_en`, `creado_por`, `actualizado_en`, `actualizado_por`.  
Existe tabla `auditoria_log` con `registro_antiguo / registro_nuevo` JSON.

### 7.5 Zona Horaria

El sistema opera en **Bolivia (America/La_Paz, UTC-4)**.  
`getRangoUTCBoliviaHoy()` y `getTurnoActual()` en `src/app/utils/date.ts` son los helpers clave para consultas de fichas del día.

### 7.6 Turno AM/PM

El turno se determina por la hora actual de Bolivia: `< 13:00 → 'AM'`, `>= 13:00 → 'PM'`.  
El código `turno_catalogo` se guarda como string `'AM'` o `'PM'` en la tabla.

### 7.7 Linting y Formato

- **OXLint** para linting (no ESLint). Configurado en `.oxlintrc.json`.
- **Prettier** para formato.
- **Husky + lint-staged**: corre validaciones antes de cada commit.
- Los comentarios `// oxlint-disable rule-name` se usan para deshabilitar reglas específicas.

### 7.8 Reglas Semánticas de Git

- **Commitizen** con `cz-conventional-changelog`.
- Usar `npm run commit` para commits asistidos.
- **CommitLint** verifica el formato del mensaje.

---

## 8. Deuda Técnica Identificada

| Item                                      | Archivo                                        | Descripción                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Server Action duplicada                   | `src/actions/fichas/create.ts`                 | Mismo lógica que POST /api/fichas. Comentario dice "ELIMINAR". Usar solo la API Route.                                                           |
| `any` types                               | múltiples                                      | `formRegister.tsx`, `fichas.ts`, `service.ts`, `formEditUser.tsx` usan `any`. Debería tipificarse con DTOs.                                      |
| Datos quemados en `useUser`               | `src/hooks/useUser.ts`                         | Mapa de roles con `TODO` — si se añade un nuevo rol no se reflejaría.                                                                            |
| Un solo modal global                      | `src/store/modal.ts`                           | El store `isOpen` es global y singular — no soporta múltiples modales simultáneos.                                                               |
| Contadores de tarjetas fijos              | `doctor-fichas.tsx` línea 81                   | Los números "13", "10", "1" están hardcodeados. Debería calcularse desde `fichas`.                                                               |
| Typo en servicio                          | `src/app/services/fichas.ts`                   | `queryKey: ['espcialidad']` (falta la 'e') — invalidación incorrecta.                                                                            |
| Estado PENDIENTE en código                | `constants`, `schemas`, `sections`, `route.ts` | El enum Prisma ya usa 6 estados. Código TS puede tener filtros/tabs basados en solo 4. Requiere migración completa.                              |
| ABAC Doctor General desactualizado        | `src/app/api/fichas/service.ts`                | Doctor General debe ver fichas en `EN_ESPERA` (no `ENFERMERIA`). Requiere actualización.                                                         |
| `doctor-general.tsx` activeTab incorrecto | `sections/dashboard/doctor-general.tsx`        | `activeTab` inicializado en `StateRecordValue.ENFERMERIA` — debe cambiarse a `EN_ESPERA`. `allowedTabs` debe incluir `EN_ESPERA` y `ATENDIENDO`. |
| Enfermería ABAC desactualizado            | `src/app/api/fichas/service.ts` ABAC           | Enfermería debe ver fichas en `ADMISION`. Al asignar médico, cambia a `EN_ESPERA`.                                                               |
| Typo en nombre de servicio                | `src/services/usuarios.ts`                     | Clase se llama `UserssService` (doble 's'). Debería ser `UsersService`.                                                                          |
| Console.logs en producción                | `admin/usuarios/` múltiples archivos           | Múltiples `console.log` de depuración en page.tsx, usersTable.tsx, route.ts. Limpiar antes de producción.                                        |
| Vacunas admin placeholder                 | `dashboard/admin/vacunas/page.tsx`             | Página vacía de 66 bytes. Pendiente de implementar.                                                                                              |
| **v4** Módulo consultas no existe         | `dashboard/consultas/` + `api/consultas/`      | Crear páginas, API routes, schemas y service para el nuevo módulo de consultas médicas (DOCTOR_GENERAL).                                         |
| **v4** Tratamientos cambian de dueño      | `dashboard/tratamientos/` + `api/tratamientos/`| Los tratamientos pasan de DOCTOR_GENERAL a ENFERMERIA. Revisar ABAC y UI.                                                                        |
| **v4** generar-citas-lote sin diferenciar | `api/fichas/generar-citas-lote`                | La generación en lote debe diferenciar citas VACUNA (→ADMISION) vs CONTROL/CONSULTA (→EN_ESPERA con disponibilidad_id).                          |
| **v4** observaciones en tratamientos      | `api/tratamientos/`                            | Campo `observaciones` agregado al modelo — revisar formularios y API para incluirlo.                                                             |

