-- CreateEnum
CREATE TYPE "public"."EstadoFicha" AS ENUM ('ADMISION', 'ENFERMERIA', 'EN_ESPERA', 'ATENDIENDO', 'ATENDIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "public"."auditoria_log" (
    "id" BIGSERIAL NOT NULL,
    "nombre_tabla" VARCHAR(255) NOT NULL,
    "registro_id" TEXT NOT NULL,
    "accion" VARCHAR(255) NOT NULL,
    "registro_antiguo" JSONB NOT NULL,
    "registro_nuevo" JSONB NOT NULL,
    "fecha_cambio" TIMESTAMP(0) NOT NULL,
    "usuario_id" UUID,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "auditoria_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fichas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" TEXT NOT NULL,
    "disponibilidad_id" UUID,
    "turno_codigo" TEXT NOT NULL,
    "fecha_ficha" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "estado" "public"."EstadoFicha" DEFAULT 'ADMISION',
    "orden_turno" INTEGER,
    "cita_origen_id" UUID,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "fichas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."disponibilidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "turno_codigo" TEXT NOT NULL,
    "cupos" INTEGER NOT NULL DEFAULT 0,
    "observacion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,
    "doctor_especialidad_id" UUID NOT NULL,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctores" (
    "doctor_id" TEXT NOT NULL,
    "matricula" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "doctores_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "public"."esquema_dosis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacuna_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "intervalo_dias" INTEGER NOT NULL,
    "edad_min_meses" INTEGER,
    "notas" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "esquema_dosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" TEXT NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" VARCHAR(255) NOT NULL,
    "fecha_envio" TIMESTAMP(0) NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "medio" VARCHAR(255) NOT NULL,
    "cita_id" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pacientes" (
    "paciente_id" TEXT NOT NULL,
    "nro_historia_clinica" TEXT,
    "fecha_nacimiento" DATE,
    "sexo" TEXT,
    "grupo_sanguineo" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("paciente_id")
);

-- CreateTable
CREATE TABLE "public"."permisos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "metodos" TEXT[],
    "icono" TEXT,
    "descripcion" TEXT,
    "modulo" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personas" (
    "ci" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "paterno" TEXT,
    "materno" TEXT,
    "telefono" TEXT,
    "correo" VARCHAR(255),
    "direccion" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("ci")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles_permisos" (
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" UUID,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" UUID,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("rol_id","permiso_id")
);

-- CreateTable
CREATE TABLE "public"."tratamientos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'EN_CURSO',
    "observaciones" TEXT,
    "esquema_id" UUID NOT NULL,
    "fecha_aplicacion" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "tratamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ficha_origen_id" UUID NOT NULL,
    "consulta_padre_id" UUID,
    "motivo_consulta" TEXT NOT NULL,
    "observaciones" TEXT,
    "requiere_retorno" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."citas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "tratamiento_id" UUID,
    "consulta_id" UUID,
    "fecha_programada" TIMESTAMPTZ(0) NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "turno_codigo" TEXT NOT NULL DEFAULT 'AM',
    "observaciones" TEXT,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."turnos_catalogo" (
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fin" TIME(0) NOT NULL,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "turnos_catalogo_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "usuario_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "persona_ci" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "public"."usuarios_roles" (
    "usuario_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "desde" DATE NOT NULL DEFAULT CURRENT_DATE,
    "hasta" DATE,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("usuario_id","rol_id")
);

-- CreateTable
CREATE TABLE "public"."vacunas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fabricante" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctores_especialidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctor_id" TEXT NOT NULL,
    "especialidad_id" UUID NOT NULL,

    CONSTRAINT "doctores_especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."especialidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fichas_turno_codigo_fecha_ficha_orden_turno_key" ON "public"."fichas"("turno_codigo", "fecha_ficha", "orden_turno");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_nro_historia_clinica_unique" ON "public"."pacientes"("nro_historia_clinica");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_ruta_metodos_unique" ON "public"."permisos"("ruta", "metodos");

-- CreateIndex
CREATE UNIQUE INDEX "personas_correo_unique" ON "public"."personas"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_unique" ON "public"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_unique" ON "public"."usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "vacunas_nombre_unique" ON "public"."vacunas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "doctores_especialidades_doctor_id_especialidad_id_key" ON "public"."doctores_especialidades"("doctor_id", "especialidad_id");

-- AddForeignKey
ALTER TABLE "public"."auditoria_log" ADD CONSTRAINT "auditoria_log_usuario_id_foreign" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."fichas" ADD CONSTRAINT "fichas_disponibilidad_id_foreign" FOREIGN KEY ("disponibilidad_id") REFERENCES "public"."disponibilidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."fichas" ADD CONSTRAINT "fichas_paciente_id_foreign" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("paciente_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."fichas" ADD CONSTRAINT "fichas_cita_origen_id_fkey" FOREIGN KEY ("cita_origen_id") REFERENCES "public"."citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."disponibilidades" ADD CONSTRAINT "disponibilidades_doctor_especialidad_id_fkey" FOREIGN KEY ("doctor_especialidad_id") REFERENCES "public"."doctores_especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."disponibilidades" ADD CONSTRAINT "disponibilidades_turno_codigo_foreign" FOREIGN KEY ("turno_codigo") REFERENCES "public"."turnos_catalogo"("codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctores" ADD CONSTRAINT "fk_doctores_personas" FOREIGN KEY ("doctor_id") REFERENCES "public"."personas"("ci") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."esquema_dosis" ADD CONSTRAINT "esquema_dosis_vacuna_id_foreign" FOREIGN KEY ("vacuna_id") REFERENCES "public"."vacunas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_paciente_id_foreign" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("paciente_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_cita_id_foreign" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."pacientes" ADD CONSTRAINT "fk_pacientes_personas" FOREIGN KEY ("paciente_id") REFERENCES "public"."personas"("ci") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."roles_permisos" ADD CONSTRAINT "fk_permisos" FOREIGN KEY ("permiso_id") REFERENCES "public"."permisos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."roles_permisos" ADD CONSTRAINT "fk_roles" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tratamientos" ADD CONSTRAINT "tratamientos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("paciente_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tratamientos" ADD CONSTRAINT "tratamientos_esquema_id_foreign" FOREIGN KEY ("esquema_id") REFERENCES "public"."esquema_dosis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."consultas" ADD CONSTRAINT "consultas_ficha_origen_id_fkey" FOREIGN KEY ("ficha_origen_id") REFERENCES "public"."fichas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultas" ADD CONSTRAINT "consultas_consulta_padre_id_fkey" FOREIGN KEY ("consulta_padre_id") REFERENCES "public"."consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("paciente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctores"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_tratamiento_id_fkey" FOREIGN KEY ("tratamiento_id") REFERENCES "public"."tratamientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "public"."consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_turno_codigo_fkey" FOREIGN KEY ("turno_codigo") REFERENCES "public"."turnos_catalogo"("codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "fk_usuarios_personas" FOREIGN KEY ("persona_ci") REFERENCES "public"."personas"("ci") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_rol_id_foreign" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_foreign" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctores_especialidades" ADD CONSTRAINT "doctores_especialidades_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctores"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctores_especialidades" ADD CONSTRAINT "doctores_especialidades_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "public"."especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
