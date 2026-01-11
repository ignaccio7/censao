-- CreateTable
CREATE TABLE "public"."auditoria_log" (
    "id" BIGSERIAL NOT NULL,
    "nombre_tabla" VARCHAR(255) NOT NULL,
    "registro_id" TEXT NOT NULL,
    "accion" VARCHAR(255) NOT NULL,
    "registro_antiguo" JSONB NOT NULL,
    "registro_nuevo" JSONB NOT NULL,
    "fecha_cambio" TIMESTAMP(0) NOT NULL,
    "usuario_id" UUID NOT NULL,
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
    "disponibilidad_id" UUID NOT NULL,
    "fecha_ficha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "estado" TEXT DEFAULT 'PENDIENTE',
    "orden_turno" INTEGER,
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
    "matricula" TEXT NOT NULL,
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
    "tratamiento_id" UUID NOT NULL,
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
    "estado" TEXT NOT NULL,
    "ficha_id" UUID NOT NULL,
    "esquema_id" UUID NOT NULL,
    "tratamiento_original_id" UUID,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "tratamientos_pkey" PRIMARY KEY ("id")
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
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "token_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMPTZ(0) NOT NULL,
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" UUID,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" UUID,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" UUID,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_id")
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
    "creado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,
    "actualizado_en" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_por" TEXT,
    "eliminado_en" TIMESTAMPTZ(0),
    "eliminado_por" TEXT,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fichas_disponibilidad_id_fecha_ficha_orden_turno_key" ON "public"."fichas"("disponibilidad_id", "fecha_ficha", "orden_turno");

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
ALTER TABLE "public"."auditoria_log" ADD CONSTRAINT "auditoria_log_usuario_id_foreign" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."fichas" ADD CONSTRAINT "fichas_disponibilidad_id_foreign" FOREIGN KEY ("disponibilidad_id") REFERENCES "public"."disponibilidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."fichas" ADD CONSTRAINT "fichas_paciente_id_foreign" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("paciente_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

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
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_tratamiento_id_foreign" FOREIGN KEY ("tratamiento_id") REFERENCES "public"."tratamientos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."pacientes" ADD CONSTRAINT "fk_pacientes_personas" FOREIGN KEY ("paciente_id") REFERENCES "public"."personas"("ci") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."roles_permisos" ADD CONSTRAINT "fk_permisos" FOREIGN KEY ("permiso_id") REFERENCES "public"."permisos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."roles_permisos" ADD CONSTRAINT "fk_roles" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tratamientos" ADD CONSTRAINT "tratamientos_ficha_id_foreign" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tratamientos" ADD CONSTRAINT "tratamientos_esquema_id_foreign" FOREIGN KEY ("esquema_id") REFERENCES "public"."esquema_dosis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tratamientos" ADD CONSTRAINT "tratamientos_tratamiento_original_id_foreign" FOREIGN KEY ("tratamiento_original_id") REFERENCES "public"."tratamientos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "fk_usuarios_personas" FOREIGN KEY ("persona_ci") REFERENCES "public"."personas"("ci") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_rol_id_foreign" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_foreign" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_usuario" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doctores_especialidades" ADD CONSTRAINT "doctores_especialidades_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctores"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctores_especialidades" ADD CONSTRAINT "doctores_especialidades_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "public"."especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
