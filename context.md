en tratamientos borrar dosis_numero porque lo obtenemos del esquema con su foranea
de cita eliminar fecha_real_atencion

# Flujo de Roles del Sistema de Gestión de Fichas Médicas y Monitoreo de Vacunación

El sistema tendrá cinco roles principales:

1. Administrador
2. Doctor General
3. Doctor de Fichas
4. Enfermería
5. Paciente

El flujo del sistema parte de la situación actual del Centro de Salud Alto Obrajes: los pacientes continúan asistiendo físicamente al centro de salud, hacen fila y son registrados inicialmente, incorporando en el sistema un proceso intermedio de clasificación mediante el área de enfermería antes de la atención médica.

---

# Flujo General del Sistema

1. El paciente llega al centro de salud.
2. El Doctor de Fichas busca al paciente o lo registra si es nuevo.
3. El Doctor de Fichas genera una ficha sin asignación médica inicial.
4. La ficha pasa al área de Enfermería.
5. Enfermería evalúa el motivo de consulta y determina la especialidad requerida.
6. Enfermería asigna la ficha a un médico disponible.
7. La ficha queda en estado "Pendiente".
8. La ficha aparece:

- En la pantalla del Doctor General correspondiente.
- En una pantalla pública visible para los pacientes.

9. La pantalla pública muestra qué médico está atendiendo y qué ficha sigue, de manera similar a los bancos.
10. El paciente puede esperar fuera del consultorio o incluso fuera del centro y volver cuando vea que su ficha está próxima.
11. El Doctor General atiende al paciente.
12. Si no requiere seguimiento de vacunación, la ficha se marca como "Atendida".
13. Si requiere vacunación o seguimiento, el médico registra el tratamiento y, si corresponde, una futura cita o siguiente dosis.
14. Al final de cada día, un cronjob envía recordatorios automáticos por correo.

---

# Pantalla Pública de Fichas

El sistema contará con una vista pública que podrá mostrarse en una televisión, monitor o celular.

Esta pantalla mostrará:

- Nombre o código del médico.
- Número de ficha actual atendida.
- Número de ficha siguiente.
- Estado de atención.

Ejemplo:

| Médico     | Atendiendo | Sigue    |
| ---------- | ---------- | -------- |
| Dr. Pérez  | Ficha 12   | Ficha 13 |
| Dra. López | Ficha 5    | Ficha 6  |

La pantalla pública no mostrará información sensible del paciente.

---

# 1. Rol: Paciente

El paciente no crea fichas ni reservas directamente. Todo el registro inicial se realiza en el centro de salud mediante el Doctor de Fichas.

## Cómo obtiene acceso al sistema

El paciente solamente tendrá acceso al sistema si, durante una atención médica, se le registra un tratamiento de vacunación o seguimiento.

Por ejemplo:

- El médico registra una vacuna contra el tétanos.
- El médico pregunta si el paciente desea acceder al sistema.
- Si el paciente acepta, se crean automáticamente:
  - Su usuario
  - Su contraseña
  - Su perfil de paciente
  - Sus vacunas y futuras dosis pendientes

## Funciones principales

- Iniciar sesión.
- Ver sus datos personales.
- Ver sus fichas registradas.
- Consultar la fecha y hora de su próxima atención.
- Consultar el estado de sus fichas:
  - Pendiente
  - Atendida
  - Cancelada

- Consultar su tratamiento de vacunación:
  - Vacunas aplicadas
  - Vacunas pendientes
  - Próxima dosis

- Ver recordatorios enviados.
- Ver la pantalla pública de fichas.

## Restricciones

- No puede crear fichas.
- No puede reservar atención.
- No puede modificar citas.
- Solo puede ver sus propias vacunas y fichas.
- No puede ver información de otros pacientes.
- No puede administrar usuarios ni permisos.

## Flujo típico del paciente

1. Acude al centro de salud.
2. Recibe una ficha del Doctor de Fichas.
3. Observa la pantalla pública hasta que le corresponda.
4. Es atendido por el Doctor General.
5. Si tiene seguimiento de vacunación, se le crea acceso al sistema.
6. Más adelante puede ingresar al sistema para consultar próximas dosis y recordatorios.

---

# 2. Rol: Doctor de Fichas

Este rol corresponde al personal que registra pacientes, asigna fichas y controla el flujo diario de atención.

## Funciones principales

- Registrar pacientes nuevos.
- Buscar pacientes existentes.
- Generar fichas sin asignación médica.
- Registrar el motivo de consulta (opcional).
- Ver disponibilidad de médicos.
- Ver carga de atención por médico.
- Reasignar fichas si un médico no está disponible.
- Reprogramar fichas si corresponde.
- Cancelar fichas.
- Visualizar la pantalla pública.

## Estados de las fichas

Las fichas solamente tendrán tres estados:

- Pendiente
- Atendida
- Cancelada

## Restricciones

- No puede registrar diagnósticos.
- No puede registrar vacunas.
- No puede acceder al historial clínico completo.
- No puede administrar permisos del sistema.

## Flujo típico del Doctor de Fichas

1. El paciente llega al centro de salud.
2. El Doctor de Fichas busca si ya existe.
3. Si no existe, lo registra.
4. Se crea la ficha sin asignación médica.
5. La ficha pasa a Enfermería.
6. En caso de contingencia:
   - Puede reasignar fichas ya asignadas.

---

3. Rol: Enfermería

Este rol es responsable de la clasificación del paciente antes de la atención médica, cumpliendo una función de triage básico.

## Funciones principales

- Visualizar fichas sin asignación.
- Evaluar el motivo de consulta.
- Determinar la especialidad requerida.
- Asignar la ficha a un médico disponible.
- Ver carga de trabajo de médicos.
- Reasignar fichas si es necesario.
- Visualizar la pantalla pública.

## Restricciones

- No registra diagnósticos.
- No aplica tratamientos médicos.
- No registra vacunas.
- No administra usuarios ni permisos.

# Flujo típico de Enfermería

1. Visualiza fichas sin asignación.
2. Selecciona una ficha.
3. Evalúa el motivo del paciente.
4. Determina la especialidad y médico disponible.
5. Asigna la ficha.
6. La ficha se publica automáticamente en el sistema.
7. En caso necesario:

- Puede reasignar la ficha a otro médico.

# 4. Rol: Doctor General

El rol Doctor General incluye médicos generales, odontólogos u otros médicos del centro. Todos usan el mismo tipo de cuenta, pero solo ven las fichas asignadas a ellos. Solo recibe fichas previamente asignadas por Enfermería.

## Funciones principales

- Iniciar sesión.
- Ver sus fichas pendientes.
- Ver la ficha que sigue.
- Marcar qué ficha está atendiendo.
- Ver información básica del paciente.
- Marcar una ficha como atendida.
- Registrar observaciones.
- Registrar tratamientos de vacunación.
- Registrar futuras dosis.
- Registrar una futura cita de control.
- Crear usuario de paciente si requiere seguimiento.
- Enviar recordatorios manuales.
- Registrar nuevas vacunas disponibles en el sistema.

## Flujo de atención

1. El médico inicia sesión.
2. Ve el listado de fichas asignadas.
3. Selecciona la siguiente ficha.
4. Atiende al paciente.
5. Si no necesita seguimiento:
   - Marca la ficha como "Atendida".

6. Si necesita vacunación:
   - Registra la vacuna aplicada.
   - Registra si habrá una próxima dosis.
   - Registra una futura atención.
   - Crea el usuario del paciente si corresponde.

## Restricciones

- Solo puede ver sus propios pacientes asignados.
- No puede ver fichas de otros médicos.
- No puede gestionar usuarios administrativos.
- No puede modificar permisos.

---

# 5. Rol: Administrador

El administrador tiene acceso completo al sistema.

## Funciones principales

- Gestionar usuarios.
- Crear, editar o eliminar:
  - Pacientes
  - Doctores
  - Administradores

- Asignar roles.
- Gestionar vacunas.
- Gestionar médicos y especialidades.
- Gestionar horarios.
- Configurar recordatorios automáticos.
- Ver reportes.
- Reasignar fichas.
- Reprogramar fichas.
- Activar o desactivar usuarios.
- Gestionar permisos.

## Función importante de emergencia

Si un médico tiene una emergencia o debe retirarse:

- El administrador, el Doctor de Fichas o Enfermería pueden:
  - Reasignar sus fichas a otro médico.

## Restricciones

- No atiende pacientes directamente.
- No registra diagnósticos.

---

# Recordatorios y Notificaciones

El sistema manejará dos tipos de recordatorios:

## Recordatorios automáticos

- Se enviarán mediante un cronjob.
- Se ejecutarán al final de cada día.
- Serán enviados por correo electrónico mediante Gmail.
- Recordarán:
  - Próxima vacuna
  - Próxima cita
  - Seguimiento pendiente

## Recordatorios manuales

Podrán ser enviados por:

- Administrador
- Doctor General

---

# Modelo de Seguridad

El sistema implementa un modelo híbrido RBAC + ABAC.

## RBAC

Cada rol tiene permisos distintos:

- Paciente
- Doctor de Fichas
- Enfermería
- Doctor General
- Administrador

## ABAC

Además de los roles, se validan atributos específicos.

Ejemplos:

- Un paciente solo puede ver sus propias vacunas.
- Un Doctor General solo puede ver las fichas que le fueron asignadas.
- Un Doctor de Fichas solo puede modificar fichas pendientes.
- Enfermería puede asignar y reasignar fichas.
- El Administrador puede acceder a toda la información.

---

# Decisiones y Ajustes del Modelo

## Futuras citas y relación con las fichas

Las futuras atenciones registradas por el Doctor General no se convertirán automáticamente en una ficha.

El flujo será:

1. El médico registra una cita futura o próxima dosis.
2. El paciente recibe recordatorios automáticos.
3. El día correspondiente, el paciente debe volver al centro de salud y sacar una nueva ficha mediante el Doctor de Fichas.
4. Esa nueva ficha será la que realmente permita la atención.

Esto se ajusta mejor al funcionamiento real del centro de salud, ya que los pacientes siguen haciendo fila y no sería justo que una persona llegue directamente a consulta sin pasar por el mismo proceso que los demás.

Por ello, no conviene agregar un nuevo estado "PROGRAMADA" a la tabla `fichas`.

La recomendación es mantener `fichas` únicamente con los estados:

- PENDIENTE
- ATENDIDA
- CANCELADA

Y crear una tabla separada para las futuras citas o controles.

La tabla `citas` servirá para:

- Próximas dosis.
- Controles posteriores.
- Revisiones médicas.
- Reprogramaciones cuando una atención deba trasladarse a otro día.
- Recordatorios automáticos.

La tabla `citas` no representa una atención realizada, sino una atención futura pendiente.

Cada registro de la tabla permitirá saber:

- Qué paciente debe volver.
- Qué médico lo atenderá nuevamente.
- Para qué fecha fue programado.
- Si el paciente confirmó asistencia.
- Desde qué ficha original se generó la futura cita.

Mientras que la tabla `fichas` seguirá representando únicamente las atenciones reales del día.

Es decir:

- `fichas` = el paciente sí asistió físicamente y recibió o está esperando atención.
- `citas` = el paciente todavía no volvió; solamente existe una futura atención programada.

## Datos definitivos de una ficha

Con base en tu tabla actual, una ficha tendrá:

- ID
- Paciente
- Disponibilidad asignada
- Médico asignado (obtenido desde la disponibilidad)
- Especialidad del médico
- Fecha y hora de creación de la ficha
- Estado:
  - PENDIENTE
  - ATENDIDA
  - CANCELADA

- Motivo
- Orden de turno
- Usuario que la creó
- Usuario que la modificó

La relación correcta sería:

`Ficha -> Disponibilidad -> Doctor -> Especialidad`

Por tanto, la ficha no necesita guardar directamente el doctor ni la especialidad si ya pueden obtenerse desde `disponibilidad_id`.

## Pantalla pública

La pantalla pública funcionará mediante polling.

- El frontend realizará una petición cada 5 a 10 minutos.
- La petición consultará:
  - Qué ficha está siendo atendida actualmente por cada médico.
  - Qué ficha sigue después.

- No mostrará datos sensibles del paciente.
- Solamente mostrará:
  - Médico
  - Ficha actual
  - Próxima ficha

Ejemplo:

| Médico     | Atendiendo | Sigue |
| ---------- | ---------- | ----- |
| Dr. Pérez  | 12         | 13    |
| Dra. López | 5          | 6     |

Si luego deseas que cambie más rápido, el polling podría reducirse a cada 30 segundos o 1 minuto sin necesidad de usar WebSockets.

## Vacunas iniciales

Inicialmente el sistema manejará vacunas simples, por ejemplo:

- Tétanos
- COVID
- Influenza

Cada vacuna podrá tener varios esquemas:

- Número de dosis
- Tiempo entre dosis
- Descripción

## Tratamientos simultáneos

Un paciente sí podrá tener más de un tratamiento de vacunación al mismo tiempo.

Por ejemplo:

- Un seguimiento de vacuna contra el tétanos
- Y al mismo tiempo una dosis pendiente de COVID

Por ello, la relación correcta es:

`Paciente -> muchos tratamientos o esquemas de vacunación`

Y cada tratamiento podrá tener varias dosis o citas asociadas.

Un paciente puede tener múltiples Tratamientos activos. Cada Tratamiento se origina a partir de una Ficha de atención real y sirve como contenedor para una o más Citas futuras (dosis o controles).
