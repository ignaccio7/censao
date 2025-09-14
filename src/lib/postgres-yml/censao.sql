-- Tabla base para personas (generalización)
CREATE TABLE "personas"(
    "ci" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "paterno" TEXT NULL,
    "materno" TEXT NULL,
    "telefono" TEXT NULL,
    "correo" VARCHAR(255) NULL,
    "direccion" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN personas.ci IS 'Cédula de identidad de la persona (Primary Key)';
COMMENT ON COLUMN personas.nombres IS 'Nombres de la persona';
COMMENT ON COLUMN personas.paterno IS 'Apellido paterno de la persona';
COMMENT ON COLUMN personas.materno IS 'Apellido materno de la persona';
COMMENT ON COLUMN personas.telefono IS 'Número de teléfono de contacto';
COMMENT ON COLUMN personas.correo IS 'Correo electrónico de la persona';
COMMENT ON COLUMN personas.direccion IS 'Dirección física de residencia';
COMMENT ON COLUMN personas.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN personas.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN personas.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN personas.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN personas.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN personas.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "personas" IS 'Tabla base que contiene información común de todas las personas del sistema (pacientes, doctores, usuarios)';

ALTER TABLE
    "personas" ADD CONSTRAINT "personas_correo_unique" UNIQUE("correo");
ALTER TABLE
    "personas" ADD PRIMARY KEY("ci");

-- Tabla de usuarios (especialización de personas)
CREATE TABLE "usuarios"(
    "usuario_id" UUID NOT NULL DEFAULT gen_random_uuid(),  
    "persona_ci" TEXT NOT NULL,  
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT TRUE,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL,
    CONSTRAINT fk_usuarios_personas FOREIGN KEY(persona_ci) REFERENCES personas(ci) ON DELETE CASCADE
);

COMMENT ON COLUMN usuarios.usuario_id IS 'ID único del usuario (UUID)';
COMMENT ON COLUMN usuarios.persona_ci  IS 'CI de la persona, referencia a personas.ci';
COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario para acceso al sistema';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash de la contraseña del usuario';
COMMENT ON COLUMN usuarios.activo IS 'Indica si el usuario está activo en el sistema';
COMMENT ON COLUMN usuarios.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN usuarios.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN usuarios.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN usuarios.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN usuarios.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN usuarios.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "usuarios" IS 'Tabla que contiene información específica de los usuarios del sistema';

ALTER TABLE
    "usuarios" ADD PRIMARY KEY("usuario_id");
ALTER TABLE
    "usuarios" ADD CONSTRAINT "usuarios_username_unique" UNIQUE("username");

-- Tabla de roles del sistema
CREATE TABLE "roles"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN roles.id IS 'Identificador único del rol';
COMMENT ON COLUMN roles.nombre IS 'Nombre descriptivo del rol';
COMMENT ON COLUMN roles.descripcion IS 'Descripción detallada del rol';
COMMENT ON COLUMN roles.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN roles.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN roles.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN roles.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN roles.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN roles.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "roles" IS 'Tabla que contiene los diferentes roles o perfiles de usuarios del sistema';

ALTER TABLE
    "roles" ADD PRIMARY KEY("id");
ALTER TABLE
    "roles" ADD CONSTRAINT "roles_nombre_unique" UNIQUE("nombre");

-- Tabla de doctores (especialización de personas)
CREATE TABLE "doctores"(
    "doctor_id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL,
    CONSTRAINT fk_doctores_personas FOREIGN KEY(doctor_id) REFERENCES personas(ci) ON DELETE CASCADE
);

COMMENT ON COLUMN doctores.doctor_id IS 'CI del doctor, referencia a personas.ci';
COMMENT ON COLUMN doctores.matricula IS 'Número de matrícula profesional del doctor';
COMMENT ON COLUMN doctores.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN doctores.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN doctores.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN doctores.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN doctores.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN doctores.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "doctores" IS 'Tabla que contiene información específica de los doctores del sistema';

ALTER TABLE
    "doctores" ADD PRIMARY KEY("doctor_id");

-- Tabla de relación entre usuarios y roles
CREATE TABLE "usuarios_roles"(
    "usuario_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "desde" DATE NOT NULL DEFAULT CURRENT_DATE,
    "hasta" DATE NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL,
    PRIMARY KEY("usuario_id", "rol_id")
);

COMMENT ON COLUMN usuarios_roles.usuario_id IS 'ID del usuario';
COMMENT ON COLUMN usuarios_roles.rol_id IS 'ID del rol asignado';
COMMENT ON COLUMN usuarios_roles.desde IS 'Fecha de inicio de la asignación del rol';
COMMENT ON COLUMN usuarios_roles.hasta IS 'Fecha de fin de la asignación del rol';
COMMENT ON COLUMN usuarios_roles.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN usuarios_roles.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN usuarios_roles.actualizado_en IS 'Fecha de última actualización';
COMMent ON COLUMN usuarios_roles.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN usuarios_roles.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN usuarios_roles.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "usuarios_roles" IS 'Tabla de relación muchos a muchos entre usuarios y roles';

-- Tabla de pacientes (especialización de personas)
CREATE TABLE "pacientes"(
    "paciente_id" TEXT NOT NULL,
    "nro_historia_clinica" TEXT NULL,
    "fecha_nacimiento" DATE NULL,
    "sexo" TEXT NULL,
    "grupo_sanguineo" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL,
    CONSTRAINT fk_pacientes_personas FOREIGN KEY(paciente_id) REFERENCES personas(ci) ON DELETE CASCADE
);

COMMENT ON COLUMN pacientes.paciente_id IS 'CI del paciente, referencia a personas.ci';
COMMENT ON COLUMN pacientes.nro_historia_clinica IS 'Número único de historia clínica del paciente';
COMMENT ON COLUMN pacientes.fecha_nacimiento IS 'Fecha de nacimiento del paciente';
COMMENT ON COLUMN pacientes.sexo IS 'Sexo biológico del paciente (M/F/O)';
COMMENT ON COLUMN pacientes.grupo_sanguineo IS 'Grupo sanguíneo del paciente';
COMMENT ON COLUMN pacientes.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN pacientes.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN pacientes.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN pacientes.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN pacientes.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN pacientes.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "pacientes" IS 'Tabla que contiene información específica de los pacientes del sistema';

ALTER TABLE
    "pacientes" ADD PRIMARY KEY("paciente_id");
ALTER TABLE
    "pacientes" ADD CONSTRAINT "pacientes_nro_historia_clinica_unique" UNIQUE("nro_historia_clinica");

-- Tabla de permisos
CREATE TABLE "permisos"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "metodos" TEXT[] NOT NULL,
    "icono" TEXT NULL,
    "descripcion" TEXT NULL,
    "modulo" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL,
    PRIMARY KEY("id"),
    CONSTRAINT "permisos_ruta_metodos_unique" UNIQUE("ruta", "metodos")
);

COMMENT ON COLUMN permisos.id IS 'Identificador único del permiso';
COMMENT ON COLUMN permisos.nombre IS 'Nombre descriptivo del permiso (ej. Gestionar citas)';
COMMENT ON COLUMN permisos.tipo IS 'Tipo de permiso: [frontend, backend]';
COMMENT ON COLUMN permisos.ruta IS 'Ruta o endpoint asociado (ej. /api/citas, o /dashboard/paciente)';
COMMENT ON COLUMN permisos.metodos IS 'Métodos HTTP permitidos: [GET, POST, PUT, DELETE] o [read, create, update, delete]';
COMMENT ON COLUMN permisos.icono IS 'Icono asociado al permiso';
COMMENT ON COLUMN permisos.descripcion IS 'Descripción detallada del permiso';
COMMENT ON COLUMN permisos.modulo IS 'Modulo asociado al permiso (ej. citas)';
COMMENT ON COLUMN permisos.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN permisos.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN permisos.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN permisos.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN permisos.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN permisos.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "permisos" IS 'Tabla que define permisos específicos por ruta y método HTTP';

-- Tabla intermedia: muchos a muchos entre roles y permisos
CREATE TABLE "roles_permisos"(
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" UUID NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" UUID NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL,
    PRIMARY KEY("rol_id", "permiso_id"),
    CONSTRAINT fk_roles FOREIGN KEY("rol_id") REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_permisos FOREIGN KEY("permiso_id") REFERENCES permisos(id) ON DELETE CASCADE
);

COMMENT ON COLUMN roles_permisos.rol_id IS 'ID del rol';
COMMENT ON COLUMN roles_permisos.permiso_id IS 'ID del permiso';
COMMENT ON COLUMN roles_permisos.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN roles_permisos.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN roles_permisos.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN roles_permisos.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN permisos.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN permisos.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "roles_permisos" IS 'Asociación entre roles y permisos (qué rol puede hacer qué acción)';

-- Catálogo de turnos disponibles
CREATE TABLE "turnos_catalogo"(
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hora_inicio" TIME(0) WITHOUT TIME ZONE NOT NULL,
    "hora_fin" TIME(0) WITHOUT TIME ZONE NOT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN turnos_catalogo.codigo IS 'Código único del turno';
COMMENT ON COLUMN turnos_catalogo.nombre IS 'Nombre descriptivo del turno';
COMMENT ON COLUMN turnos_catalogo.hora_inicio IS 'Hora de inicio del turno';
COMMENT ON COLUMN turnos_catalogo.hora_fin IS 'Hora de fin del turno';
COMMENT ON COLUMN turnos_catalogo.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN turnos_catalogo.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN turnos_catalogo.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN turnos_catalogo.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN turnos_catalogo.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN turnos_catalogo.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "turnos_catalogo" IS 'Catálogo de turnos disponibles para asignación de citas';

ALTER TABLE
    "turnos_catalogo" ADD PRIMARY KEY("codigo");

-- Tabla de disponibilidades de doctores
CREATE TABLE "disponibilidades"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "doctor_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "turno_codigo" TEXT NOT NULL,
    "cupos" INTEGER NOT NULL,
    "observacion" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN disponibilidades.id IS 'Identificador único de la disponibilidad';
COMMENT ON COLUMN disponibilidades.doctor_id IS 'ID del doctor con disponibilidad';
COMMENT ON COLUMN disponibilidades.fecha IS 'Fecha de la disponibilidad';
COMMENT ON COLUMN disponibilidades.turno_codigo IS 'Código del turno de disponibilidad';
COMMENT ON COLUMN disponibilidades.cupos IS 'Número de cupos disponibles';
COMMENT ON COLUMN disponibilidades.observacion IS 'Observaciones sobre la disponibilidad';
COMMENT ON COLUMN disponibilidades.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN disponibilidades.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN disponibilidades.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN disponibilidades.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN disponibilidades.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN disponibilidades.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "disponibilidades" IS 'Tabla que registra las disponibilidades de tiempo de los doctores para atender citas';

ALTER TABLE
    "disponibilidades" ADD PRIMARY KEY("id");

-- Tabla de citas médicas
CREATE TABLE "citas"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "paciente_id" TEXT NOT NULL,
    "disponibilidad_id" UUID NOT NULL,
    "fecha_hora_inicial" TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    "fecha_hora_final" TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    "turno" TEXT NULL,
    "motivo" TEXT NULL,
    "orden_turno" INTEGER NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN citas.id IS 'Identificador único de la cita';
COMMENT ON COLUMN citas.paciente_id IS 'ID del paciente que solicita la cita';
COMMENT ON COLUMN citas.disponibilidad_id IS 'ID de la disponibilidad asignada';
COMMENT ON COLUMN citas.fecha_hora_inicial IS 'Fecha y hora inicial programada para la cita';
COMMENT ON COLUMN citas.fecha_hora_final IS 'Fecha y hora final programada para la cita';
COMMENT ON COLUMN citas.turno IS 'Turno asignado para la cita';
COMMENT ON COLUMN citas.motivo IS 'Motivo de la cita';
COMMENT ON COLUMN citas.orden_turno IS 'Número de orden en el turno';
COMMENT ON COLUMN citas.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN citas.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN citas.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN citas.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN citas.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN citas.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "citas" IS 'Tabla que registra las citas médicas programadas';

ALTER TABLE
    "citas" ADD PRIMARY KEY("id");

-- Tabla de vacunas
CREATE TABLE "vacunas"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NULL,
    "fabricante" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN vacunas.id IS 'Identificador único de la vacuna';
COMMENT ON COLUMN vacunas.nombre IS 'Nombre de la vacuna';
COMMENT ON COLUMN vacunas.descripcion IS 'Descripción de la vacuna';
COMMENT ON COLUMN vacunas.fabricante IS 'Nombre del fabricante de la vacuna';
COMMENT ON COLUMN vacunas.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN vacunas.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN vacunas.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN vacunas.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN vacunas.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN vacunas.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "vacunas" IS 'Catálogo de vacunas disponibles en el sistema';

ALTER TABLE
    "vacunas" ADD PRIMARY KEY("id");
ALTER TABLE
    "vacunas" ADD CONSTRAINT "vacunas_nombre_unique" UNIQUE("nombre");

-- Tabla de esquemas de dosis para vacunas
CREATE TABLE "esquema_dosis"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "vacuna_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "intervalo_dias" INTEGER NOT NULL,
    "edad_min_meses" INTEGER NULL,
    "notas" TEXT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN esquema_dosis.id IS 'Identificador único del esquema de dosis';
COMMENT ON COLUMN esquema_dosis.vacuna_id IS 'ID de la vacuna asociada';
COMMENT ON COLUMN esquema_dosis.numero IS 'Número de dosis en el esquema';
COMMENT ON COLUMN esquema_dosis.intervalo_dias IS 'Intervalo en días entre dosis';
COMMENT ON COLUMN esquema_dosis.edad_min_meses IS 'Edad mínima en meses para aplicar la dosis';
COMMENT ON COLUMN esquema_dosis.notas IS 'Notas adicionales sobre el esquema';
COMMENT ON COLUMN esquema_dosis.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN esquema_dosis.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN esquema_dosis.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN esquema_dosis.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN esquema_dosis.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN esquema_dosis.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "esquema_dosis" IS 'Tabla que define los esquemas de dosis para cada vacuna';

ALTER TABLE
    "esquema_dosis" ADD PRIMARY KEY("id");

-- Tabla de tratamientos médicos
CREATE TABLE "tratamientos"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "estado" TEXT NOT NULL,
    "cita_id" UUID NOT NULL,
    "esquema_id" UUID NOT NULL,
    "tratamiento_original_id" UUID NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN tratamientos.id IS 'Identificador único del tratamiento';
COMMENT ON COLUMN tratamientos.estado IS 'Estado del tratamiento';
COMMENT ON COLUMN tratamientos.cita_id IS 'ID de la cita asociada al tratamiento';
COMMENT ON COLUMN tratamientos.esquema_id IS 'ID del esquema de dosis aplicado';
COMMENT ON COLUMN tratamientos.tratamiento_original_id IS 'ID del tratamiento original en caso de reprogramación';
COMMENT ON COLUMN tratamientos.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN tratamientos.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN tratamientos.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN tratamientos.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN tratamientos.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN tratamientos.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "tratamientos" IS 'Tabla que registra los tratamientos médicos aplicados a pacientes';

ALTER TABLE
    "tratamientos" ADD PRIMARY KEY("id");

-- Tabla de notificaciones a pacientes
CREATE TABLE "notificaciones"(
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "paciente_id" TEXT NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" VARCHAR(255) NOT NULL,
    "fecha_envio" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT FALSE,
    "medio" VARCHAR(255) NOT NULL,
    "tratamiento_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN notificaciones.id IS 'Identificador único de la notificación';
COMMENT ON COLUMN notificaciones.paciente_id IS 'ID del paciente que recibe la notificación';
COMMENT ON COLUMN notificaciones.titulo IS 'Título de la notificación';
COMMENT ON COLUMN notificaciones.mensaje IS 'Mensaje de la notificación';
COMMENT ON COLUMN notificaciones.fecha_envio IS 'Fecha y hora de envío de la notificación';
COMMENT ON COLUMN notificaciones.leido IS 'Indica si la notificación fue leída';
COMMENT ON COLUMN notificaciones.medio IS 'Medio por el que se envió la notificación (email, sms, app)';
COMMENT ON COLUMN notificaciones.tratamiento_id IS 'ID del tratamiento relacionado';
COMMENT ON COLUMN notificaciones.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN notificaciones.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN notificaciones.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN notificaciones.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN notificaciones.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN notificaciones.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "notificaciones" IS 'Tabla que registra las notificaciones enviadas a los pacientes';

ALTER TABLE
    "notificaciones" ADD PRIMARY KEY("id");

-- Tabla de auditoría del sistema
CREATE TABLE "auditoria_log"(
    "id" bigserial NOT NULL,
    "nombre_tabla" VARCHAR(255) NOT NULL,
    "registro_id" TEXT NOT NULL,
    "accion" VARCHAR(255) NOT NULL,
    "registro_antiguo" jsonb NOT NULL,
    "registro_nuevo" jsonb NOT NULL,
    "fecha_cambio" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" TEXT NULL
);

COMMENT ON COLUMN auditoria_log.id IS 'Identificador único del registro de auditoría';
COMMENT ON COLUMN auditoria_log.nombre_tabla IS 'Nombre de la tabla auditada';
COMMENT ON COLUMN auditoria_log.registro_id IS 'ID del registro modificado';
COMMENT ON COLUMN auditoria_log.accion IS 'Tipo de acción realizada (INSERT, UPDATE, DELETE)';
COMMENT ON COLUMN auditoria_log.registro_antiguo IS 'Estado anterior del registro';
COMMENT ON COLUMN auditoria_log.registro_nuevo IS 'Estado nuevo del registro';
COMMENT ON COLUMN auditoria_log.fecha_cambio IS 'Fecha y hora del cambio';
COMMENT ON COLUMN auditoria_log.usuario_id IS 'ID del usuario que realizó el cambio';
COMMENT ON COLUMN auditoria_log.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN auditoria_log.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN auditoria_log.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN auditoria_log.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN auditoria_log.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN auditoria_log.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE "auditoria_log" IS 'Tabla que registra todos los cambios importantes en el sistema para auditoría';

ALTER TABLE
    "auditoria_log" ADD PRIMARY KEY("id");


CREATE TABLE "refresh_tokens" (
    "token_id" UUID NOT NULL, -- ID único del refresh token
    "user_id" UUID NOT NULL,  -- Referencia al usuario propietario del token
    "token_hash" TEXT NOT NULL, -- Hash del refresh token para seguridad
    "expira_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL, -- Fecha y hora de expiración del token
    "creado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" UUID NULL,
    "actualizado_en" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" UUID NULL,
    "eliminado_en" TIMESTAMP(0) WITH TIME ZONE NULL,
    "eliminado_por" UUID null,
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY("token_id"),
    CONSTRAINT fk_refresh_tokens_usuario FOREIGN KEY ("user_id") REFERENCES "usuarios" ("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON COLUMN refresh_tokens.token_id IS 'ID único del refresh token';
COMMENT ON COLUMN refresh_tokens.user_id IS 'ID del usuario que posee el refresh token, referencia a usuarios.usuario_id';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'Hash del refresh token para validar y evitar exposición directa';
COMMENT ON COLUMN refresh_tokens.expira_en IS 'Fecha y hora en que expira el refresh token';
COMMENT ON COLUMN refresh_tokens.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN refresh_tokens.creado_por IS 'ID del usuario que creó el registro';
COMMENT ON COLUMN refresh_tokens.actualizado_en IS 'Fecha de última actualización';
COMMENT ON COLUMN refresh_tokens.actualizado_por IS 'ID del usuario que actualizó el registro';
COMMENT ON COLUMN refresh_tokens.eliminado_en IS 'Fecha de eliminación del registro';
COMMENT ON COLUMN refresh_tokens.eliminado_por IS 'ID del usuario que eliminó el registro';

COMMENT ON TABLE refresh_tokens IS 'Tabla que contiene los refresh tokens para mantener sesiones activas seguras';

-- Relaciones entre tablas
ALTER TABLE
    "tratamientos" ADD CONSTRAINT "tratamientos_tratamiento_original_id_foreign" FOREIGN KEY("tratamiento_original_id") REFERENCES "tratamientos"("id");
ALTER TABLE
    "tratamientos" ADD CONSTRAINT "tratamientos_cita_id_foreign" FOREIGN KEY("cita_id") REFERENCES "citas"("id");
ALTER TABLE
    "disponibilidades" ADD CONSTRAINT "disponibilidades_doctor_id_foreign" FOREIGN KEY("doctor_id") REFERENCES "doctores"("doctor_id");
ALTER TABLE
    "tratamientos" ADD CONSTRAINT "tratamientos_esquema_id_foreign" FOREIGN KEY("esquema_id") REFERENCES "esquema_dosis"("id");
ALTER TABLE
    "notificaciones" ADD CONSTRAINT "notificaciones_tratamiento_id_foreign" FOREIGN KEY("tratamiento_id") REFERENCES "tratamientos"("id");
ALTER TABLE
    "esquema_dosis" ADD CONSTRAINT "esquema_dosis_vacuna_id_foreign" FOREIGN KEY("vacuna_id") REFERENCES "vacunas"("id");
ALTER TABLE
    "citas" ADD CONSTRAINT "citas_disponibilidad_id_foreign" FOREIGN KEY("disponibilidad_id") REFERENCES "disponibilidades"("id");
ALTER TABLE
    "notificaciones" ADD CONSTRAINT "notificaciones_paciente_id_foreign" FOREIGN KEY("paciente_id") REFERENCES "pacientes"("paciente_id");
ALTER TABLE
    "citas" ADD CONSTRAINT "citas_paciente_id_foreign" FOREIGN KEY("paciente_id") REFERENCES "pacientes"("paciente_id");
ALTER TABLE
    "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rol_id_foreign" FOREIGN KEY("rol_id") REFERENCES "roles"("id");
ALTER TABLE
    "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_foreign" FOREIGN KEY("usuario_id") REFERENCES "usuarios"("usuario_id");
ALTER TABLE
    "auditoria_log" ADD CONSTRAINT "auditoria_log_usuario_id_foreign" FOREIGN KEY("usuario_id") REFERENCES "usuarios"("usuario_id");
ALTER TABLE
    "disponibilidades" ADD CONSTRAINT "disponibilidades_turno_codigo_foreign" FOREIGN KEY("turno_codigo") REFERENCES "turnos_catalogo"("codigo");