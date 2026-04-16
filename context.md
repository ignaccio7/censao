# Flujo de Roles del Sistema de Gestión de Fichas Médicas y Monitoreo de Vacunación

El sistema tendrá cinco roles principales:

1. Administrador
2. Doctor General
3. Doctor de Fichas (Admision)
4. Enfermería
5. Paciente.

El flujo del sistema parte de la situación actual del Centro de Salud Alto Obrajes: la asignación de fichas presenciales. El sistema digitaliza este proceso, incorpora un paso intermedio de triage en enfermería antes de la atención médica, y automatiza la generación de fichas para pacientes con citas programadas (seguimientos o vacunación) mediante una acción controlada por el personal de Admisión, respetando siempre el orden de atención presencial inicial.

---

# Flujo General del Sistema

1. El paciente llega al centro de salud.
2. El Doctor de Fichas busca al paciente o lo registra si es nuevo.
3. El Doctor de Fichas genera una ficha presencial con un número de orden positivo (ej. 1, 2, 3) y la ficha nace en estado "ADMISION".

- Una vez concluida la recepción de pacientes presenciales del turno (sin depender de una hora estricta, adaptándose al turno mañana o tarde), el Doctor de Fichas utiliza una función del sistema para generar automáticamente las fichas de las citas programadas de ese turno. Estas fichas nacen en estado "ADMISION" con un número negativo (ej. -1, -2) para evitar colisiones, y en ese instante se envían los recordatorios por sistema al paciente.

4. La ficha pasa al área de Enfermería.
5. Enfermería evalúa el motivo de consulta y determina la especialidad requerida.
6. Enfermería asigna la ficha a un médico disponible.
7. La ficha queda en estado "ENFERMERIA".
8. La ficha aparece:

- En la pantalla del Doctor General correspondiente.
- En una pantalla pública visible para los pacientes.

9. La pantalla pública muestra qué médico está atendiendo y qué ficha sigue, de manera similar a los bancos.
10. El paciente puede esperar fuera del consultorio o incluso fuera del centro y volver cuando vea que su ficha está próxima.
11. El Doctor General atiende al paciente siguiendo el orden (primero presenciales, luego citas).
12. Si no requiere seguimiento de vacunación, la ficha se marca como "ATENDIDA".
13. Si requiere vacunación o seguimiento, el médico registra el tratamiento y, si corresponde, una futura cita o siguiente dosis.
14. Al final de cada día, un cronjob envía recordatorios automáticos por correo y sistema.

---

# Pantalla Pública de Fichas

El sistema contará con una vista pública que podrá mostrarse en una televisión, monitor o celular.

Esta pantalla mostrará:

- Nombre o código del médico.
- Número de ficha actual atendida.
- Número de ficha siguiente.
- Estado de atención (cuántos pacientes faltan).

Ejemplo:

| Médico     | Atendiendo | Sigue      |
| ---------- | ---------- | ---------- | --------- | --------- |
| Dr. Pérez  | Ficha P-12 | Ficha P-13 | Ficha C-1 | Ficha C-2 |
| Dra. López | Ficha P-5  | Ficha P-6  | Ficha P-7 | Ficha P-8 |

La pantalla pública no mostrará información sensible del paciente.

---

# 1. Rol: Paciente

El paciente no crea fichas ni reservas directamente. Todo el registro inicial se realiza en el centro de salud mediante el Doctor de Fichas.

## Cómo obtiene acceso al sistema

El paciente solamente tendrá acceso al sistema si, durante una atención médica, se le registra un tratamiento de vacunación o seguimiento.

Por ejemplo:

- El médico registra una vacuna digamos contra el tétanos.
- El médico pregunta si el paciente desea acceder al sistema.
- Si el paciente acepta, se crean automáticamente:
  - Su usuario
  - Su contraseña
  - Su perfil de paciente
  - Sus vacunas y futuras dosis pendientes
  - Sus futuras citas que le corresponden

## Funciones principales

- Iniciar sesión.
- Ver sus datos personales.
- Ver sus fichas registradas.
- Consultar la fecha y hora de su próxima atención (cita).
- Consultar el estado de sus fichas:
  - Admision
  - Enfermeria
  - Atendida
  - Cancelada

- Consultar su tratamiento de vacunación:
  - Vacunas aplicadas
  - Vacunas pendientes
  - Próxima dosis
- Consultar sus siguientes citas programadas
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
2. Pasa por Admisión o directamente a Enfermería si ya tiene su ficha de cita generada
3. Observa la pantalla pública hasta que le corresponda.
4. Es atendido por el Doctor Correspondiente.
5. Si tiene seguimiento de vacunación, se le crea acceso al sistema.
6. Más adelante puede ingresar al sistema para consultar próximas dosis y recordatorios.

---

# 2. Rol: Doctor de Fichas (Admisión)

Este rol corresponde al personal que registra pacientes, asigna fichas y controla el flujo diario de atención.

## Funciones principales

- Registrar pacientes nuevos.
- Buscar pacientes existentes.
- Generar fichas presenciales sin asignación médica inicial (Estado ADMISION).
- Generar en lote las fichas de las citas programadas correspondientes a ese turno (mañana o tarde), disparando las notificaciones a los pacientes.
- Registrar el motivo de consulta (opcional).
- Ver disponibilidad de médicos.
- Ver carga de atención por médico.
- Reasignar fichas si un médico no está disponible.
- Reprogramar fichas si corresponde.
- Cancelar fichas.
- Visualizar la pantalla pública.

## Estados de las fichas

Las fichas solamente tendrán cuatro estados:

- ADMISION
- ENFERMERIA
- ATENDIDA
- CANCELADA

## Restricciones

- No puede registrar diagnósticos.
- No puede registrar vacunas.
- No puede acceder al historial clínico completo.
- No puede administrar permisos del sistema.

## Flujo típico del Doctor de Fichas

1. El paciente llega al centro de salud.
2. El Doctor de Fichas busca si ya existe.
3. Si no existe, lo registra.
4. Se crea la ficha presencial sin asignación médica en estado ADMISION.
5. Una vez terminada la fila física, genera las fichas de citas programadas del turno.
6. Las fichas pasan a Enfermería.
7. En caso de contingencia:
   - Puede reasignar fichas ya asignadas.

---

3. Rol: Enfermería

Este rol es responsable de la clasificación del paciente antes de la atención médica, cumpliendo una función de triage básico.

## Funciones principales

- Visualizar fichas en estado ADMISION (tanto presenciales como programadas).
- Evaluar el motivo de consulta.
- Determinar la especialidad requerida.
- Asignar o confirmar al médico disponible y cambiar el estado a ENFERMERIA.
- Ver carga de trabajo de médicos.
- Reasignar fichas si es necesario.
- Visualizar la pantalla pública.

## Restricciones

- No registra diagnósticos.
- No aplica tratamientos médicos.
- No registra vacunas.
- No administra usuarios ni permisos.

# Flujo típico de Enfermería

1. Visualiza fichas sin asignación en estado ADMISION.
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
- Ver sus fichas pendientes en estado ENFERMERIA.
- Ver la ficha que sigue.
- Ver información básica del paciente.
- Marcar una ficha como ATENDIDA o CANCELADA.
- Registrar observaciones.
- Registrar tratamientos de vacunación.
- Registrar futuras dosis si corresponde.
- Registrar una futura cita de control.
- Crear usuario de paciente si requiere seguimiento.
- Enviar recordatorios manuales.
- Registrar nuevas vacunas disponibles en el sistema.

## Flujo de atención

1. El médico inicia sesión.
2. Ve el listado de fichas asignadas (ENFERMERIA).
3. Selecciona la siguiente ficha.
4. Atiende al paciente.
5. Si no necesita seguimiento:
   - Marca la ficha como "ATENDIDA".

6. Si necesita vacunación:
   - Registra la vacuna aplicada.
   - Registra si habrá una próxima dosis.
   - Registra una futura atención (cita).
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
  - Enfermeria
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
- Serán enviados por correo electrónico mediante Gmail y Sistema.
- Recordarán:
  - Próxima vacuna
  - Próxima cita
  - Seguimiento pendiente

## Recordatorios manuales

- Se enviaran en el momento exacto en que el Doctor de Fichas accione la generación del lote de citas para ese turno.
- Esto flexibiliza el proceso para adaptarse a la realidad del centro de salud (turnos mañana/tarde) sin depender de un horario fijo rígido de medianoche.
- Recordarán:
  - Su número de ficha asignada (Ej. C-01).
  - La cantidad de pacientes presenciales por delante.

El enlace para monitorear la pantalla pública.

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

Las futuras atenciones registradas por el Doctor General no se convierten instantáneamente en una ficha activa.

El flujo será:

1. El médico registra una cita futura o próxima dosis.
2. El día del turno correspondiente, el Doctor de Fichas genera en lote las atenciones programadas.
3. El sistema transforma estas citas en fichas reales asignándoles un número negativo secuencial para que no choquen con los números presenciales generados esa misma mañana.
4. El paciente recibe la notificación y puede pasar directo por Enfermería cuando se acerque su turno.

Esto se ajusta mejor al funcionamiento real del centro de salud, ya que los pacientes siguen haciendo fila y no sería justo que una persona llegue directamente a consulta sin pasar por el mismo proceso que los demás.

La recomendación aplicada es mantener fichas únicamente con los estados que reflejan el flujo físico real:

- ADMISION
- ENFERMERIA
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
  - ADMISION
  - ENFERMERIA
  - ATENDIDA
  - CANCELADA

- Motivo
- Orden de turno (Positivo para presenciales, Negativo para citas)
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
  - El volumen de la fila presencial.

- No mostrará datos sensibles del paciente.
- Solamente mostrará:
  - Médico
  - Ficha actual
  - Próxima ficha
  - Estado de la fila

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
