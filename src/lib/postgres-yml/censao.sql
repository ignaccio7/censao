-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP TYPE public."EstadoFicha";

CREATE TYPE public."EstadoFicha" AS ENUM (
	'ADMISION',
	'ENFERMERIA',
	'EN_ESPERA',
	'ATENDIENDO',
	'ATENDIDA',
	'CANCELADA');

-- DROP SEQUENCE public.auditoria_log_id_seq;

CREATE SEQUENCE public.auditoria_log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.auditoria_log_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.auditoria_log_id_seq TO postgres;
-- public._prisma_migrations definition

-- Drop table

-- DROP TABLE public._prisma_migrations;

CREATE TABLE public._prisma_migrations ( id varchar(36) NOT NULL, checksum varchar(64) NOT NULL, finished_at timestamptz NULL, migration_name varchar(255) NOT NULL, logs text NULL, rolled_back_at timestamptz NULL, started_at timestamptz DEFAULT now() NOT NULL, applied_steps_count int4 DEFAULT 0 NOT NULL, CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public._prisma_migrations OWNER TO postgres;
GRANT ALL ON TABLE public._prisma_migrations TO postgres;


-- public.especialidades definition

-- Drop table

-- DROP TABLE public.especialidades;

CREATE TABLE public.especialidades ( id uuid DEFAULT gen_random_uuid() NOT NULL, nombre text NOT NULL, descripcion text NULL, estado bool DEFAULT true NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT especialidades_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.especialidades OWNER TO postgres;
GRANT ALL ON TABLE public.especialidades TO postgres;


-- public.permisos definition

-- Drop table

-- DROP TABLE public.permisos;

CREATE TABLE public.permisos ( id uuid DEFAULT gen_random_uuid() NOT NULL, nombre text NOT NULL, tipo text NOT NULL, ruta text NOT NULL, metodos _text NULL, icono text NULL, descripcion text NULL, modulo text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT permisos_pkey PRIMARY KEY (id));
CREATE UNIQUE INDEX permisos_ruta_metodos_unique ON public.permisos USING btree (ruta, metodos);

-- Permissions

ALTER TABLE public.permisos OWNER TO postgres;
GRANT ALL ON TABLE public.permisos TO postgres;


-- public.personas definition

-- Drop table

-- DROP TABLE public.personas;

CREATE TABLE public.personas ( ci text NOT NULL, nombres text NOT NULL, paterno text NULL, materno text NULL, telefono text NULL, correo varchar(255) NULL, direccion text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT personas_pkey PRIMARY KEY (ci));
CREATE UNIQUE INDEX personas_correo_unique ON public.personas USING btree (correo);

-- Permissions

ALTER TABLE public.personas OWNER TO postgres;
GRANT ALL ON TABLE public.personas TO postgres;


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles ( id uuid DEFAULT gen_random_uuid() NOT NULL, nombre text NOT NULL, descripcion text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT roles_pkey PRIMARY KEY (id));
CREATE UNIQUE INDEX roles_nombre_unique ON public.roles USING btree (nombre);

-- Permissions

ALTER TABLE public.roles OWNER TO postgres;
GRANT ALL ON TABLE public.roles TO postgres;


-- public.turnos_catalogo definition

-- Drop table

-- DROP TABLE public.turnos_catalogo;

CREATE TABLE public.turnos_catalogo ( codigo text NOT NULL, nombre text NOT NULL, hora_inicio time(0) NOT NULL, hora_fin time(0) NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT turnos_catalogo_pkey PRIMARY KEY (codigo));

-- Permissions

ALTER TABLE public.turnos_catalogo OWNER TO postgres;
GRANT ALL ON TABLE public.turnos_catalogo TO postgres;


-- public.vacunas definition

-- Drop table

-- DROP TABLE public.vacunas;

CREATE TABLE public.vacunas ( id uuid DEFAULT gen_random_uuid() NOT NULL, nombre text NOT NULL, descripcion text NULL, fabricante text NULL, activo bool DEFAULT true NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT vacunas_pkey PRIMARY KEY (id));
CREATE UNIQUE INDEX vacunas_nombre_unique ON public.vacunas USING btree (nombre);

-- Table Triggers

create trigger trg_vacunas_audit after
insert
    or
delete
    or
update
    on
    public.vacunas for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.vacunas OWNER TO postgres;
GRANT ALL ON TABLE public.vacunas TO postgres;


-- public.doctores definition

-- Drop table

-- DROP TABLE public.doctores;

CREATE TABLE public.doctores ( doctor_id text NOT NULL, matricula text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT doctores_pkey PRIMARY KEY (doctor_id), CONSTRAINT fk_doctores_personas FOREIGN KEY (doctor_id) REFERENCES public.personas(ci) ON DELETE CASCADE);

-- Table Triggers

create trigger trg_doctores_audit after
insert
    or
delete
    or
update
    on
    public.doctores for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.doctores OWNER TO postgres;
GRANT ALL ON TABLE public.doctores TO postgres;


-- public.doctores_especialidades definition

-- Drop table

-- DROP TABLE public.doctores_especialidades;

CREATE TABLE public.doctores_especialidades ( id uuid DEFAULT gen_random_uuid() NOT NULL, doctor_id text NOT NULL, especialidad_id uuid NOT NULL, CONSTRAINT doctores_especialidades_pkey PRIMARY KEY (id), CONSTRAINT doctores_especialidades_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctores(doctor_id), CONSTRAINT doctores_especialidades_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id));
CREATE UNIQUE INDEX doctores_especialidades_doctor_id_especialidad_id_key ON public.doctores_especialidades USING btree (doctor_id, especialidad_id);

-- Permissions

ALTER TABLE public.doctores_especialidades OWNER TO postgres;
GRANT ALL ON TABLE public.doctores_especialidades TO postgres;


-- public.esquema_dosis definition

-- Drop table

-- DROP TABLE public.esquema_dosis;

CREATE TABLE public.esquema_dosis ( id uuid DEFAULT gen_random_uuid() NOT NULL, vacuna_id uuid NOT NULL, numero int4 NOT NULL, intervalo_dias int4 NOT NULL, edad_min_meses int4 NULL, notas text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT esquema_dosis_pkey PRIMARY KEY (id), CONSTRAINT esquema_dosis_vacuna_id_foreign FOREIGN KEY (vacuna_id) REFERENCES public.vacunas(id));

-- Permissions

ALTER TABLE public.esquema_dosis OWNER TO postgres;
GRANT ALL ON TABLE public.esquema_dosis TO postgres;


-- public.pacientes definition

-- Drop table

-- DROP TABLE public.pacientes;

CREATE TABLE public.pacientes ( paciente_id text NOT NULL, nro_historia_clinica text NULL, fecha_nacimiento date NULL, sexo text NULL, grupo_sanguineo text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT pacientes_pkey PRIMARY KEY (paciente_id), CONSTRAINT fk_pacientes_personas FOREIGN KEY (paciente_id) REFERENCES public.personas(ci) ON DELETE CASCADE);
CREATE UNIQUE INDEX pacientes_nro_historia_clinica_unique ON public.pacientes USING btree (nro_historia_clinica);

-- Table Triggers

create trigger trg_pacientes_audit after
insert
    or
delete
    or
update
    on
    public.pacientes for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.pacientes OWNER TO postgres;
GRANT ALL ON TABLE public.pacientes TO postgres;


-- public.roles_permisos definition

-- Drop table

-- DROP TABLE public.roles_permisos;

CREATE TABLE public.roles_permisos ( rol_id uuid NOT NULL, permiso_id uuid NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por uuid NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por uuid NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT roles_permisos_pkey PRIMARY KEY (rol_id, permiso_id), CONSTRAINT fk_permisos FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON DELETE CASCADE, CONSTRAINT fk_roles FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.roles_permisos OWNER TO postgres;
GRANT ALL ON TABLE public.roles_permisos TO postgres;


-- public.tratamientos definition

-- Drop table

-- DROP TABLE public.tratamientos;

CREATE TABLE public.tratamientos ( id uuid DEFAULT gen_random_uuid() NOT NULL, paciente_id text NOT NULL, estado text DEFAULT 'EN_CURSO'::text NOT NULL, observaciones text NULL, esquema_id uuid NOT NULL, fecha_aplicacion timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT tratamientos_pkey PRIMARY KEY (id), CONSTRAINT tratamientos_esquema_id_foreign FOREIGN KEY (esquema_id) REFERENCES public.esquema_dosis(id), CONSTRAINT tratamientos_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(paciente_id));

-- Table Triggers

create trigger trg_tratamientos_audit after
insert
    or
delete
    or
update
    on
    public.tratamientos for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.tratamientos OWNER TO postgres;
GRANT ALL ON TABLE public.tratamientos TO postgres;


-- public.usuarios definition

-- Drop table

-- DROP TABLE public.usuarios;

CREATE TABLE public.usuarios ( usuario_id uuid DEFAULT gen_random_uuid() NOT NULL, persona_ci text NOT NULL, username text NOT NULL, password_hash text NOT NULL, activo bool DEFAULT true NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id), CONSTRAINT fk_usuarios_personas FOREIGN KEY (persona_ci) REFERENCES public.personas(ci) ON DELETE CASCADE);
CREATE UNIQUE INDEX usuarios_username_unique ON public.usuarios USING btree (username);

-- Table Triggers

create trigger trg_usuarios_audit after
insert
    or
delete
    or
update
    on
    public.usuarios for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.usuarios OWNER TO postgres;
GRANT ALL ON TABLE public.usuarios TO postgres;


-- public.usuarios_roles definition

-- Drop table

-- DROP TABLE public.usuarios_roles;

CREATE TABLE public.usuarios_roles ( usuario_id uuid NOT NULL, rol_id uuid NOT NULL, desde date DEFAULT CURRENT_DATE NOT NULL, hasta date NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT usuarios_roles_pkey PRIMARY KEY (usuario_id, rol_id), CONSTRAINT usuarios_roles_rol_id_foreign FOREIGN KEY (rol_id) REFERENCES public.roles(id), CONSTRAINT usuarios_roles_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id));

-- Permissions

ALTER TABLE public.usuarios_roles OWNER TO postgres;
GRANT ALL ON TABLE public.usuarios_roles TO postgres;


-- public.auditoria_log definition

-- Drop table

-- DROP TABLE public.auditoria_log;

CREATE TABLE public.auditoria_log ( id bigserial NOT NULL, nombre_tabla varchar(255) NOT NULL, registro_id text NOT NULL, accion varchar(255) NOT NULL, registro_antiguo jsonb NOT NULL, registro_nuevo jsonb NOT NULL, fecha_cambio timestamp(0) NOT NULL, usuario_id uuid NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT auditoria_log_pkey PRIMARY KEY (id), CONSTRAINT auditoria_log_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE SET NULL);

-- Permissions

ALTER TABLE public.auditoria_log OWNER TO postgres;
GRANT ALL ON TABLE public.auditoria_log TO postgres;


-- public.disponibilidades definition

-- Drop table

-- DROP TABLE public.disponibilidades;

CREATE TABLE public.disponibilidades ( id uuid DEFAULT gen_random_uuid() NOT NULL, turno_codigo text NOT NULL, cupos int4 DEFAULT 0 NOT NULL, observacion text NULL, estado bool DEFAULT true NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, doctor_especialidad_id uuid NOT NULL, CONSTRAINT disponibilidades_pkey PRIMARY KEY (id), CONSTRAINT disponibilidades_doctor_especialidad_id_fkey FOREIGN KEY (doctor_especialidad_id) REFERENCES public.doctores_especialidades(id), CONSTRAINT disponibilidades_turno_codigo_foreign FOREIGN KEY (turno_codigo) REFERENCES public.turnos_catalogo(codigo));

-- Permissions

ALTER TABLE public.disponibilidades OWNER TO postgres;
GRANT ALL ON TABLE public.disponibilidades TO postgres;


-- public.citas definition

-- Drop table

-- DROP TABLE public.citas;

CREATE TABLE public.citas ( id uuid DEFAULT gen_random_uuid() NOT NULL, paciente_id text NOT NULL, doctor_id text NOT NULL, tratamiento_id uuid NULL, consulta_id uuid NULL, fecha_programada timestamptz(0) NOT NULL, tipo text NOT NULL, estado text DEFAULT 'PENDIENTE'::text NOT NULL, turno_codigo text DEFAULT 'AM'::text NOT NULL, observaciones text NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT citas_pkey PRIMARY KEY (id));

-- Table Triggers

create trigger trg_citas_audit after
insert
    or
delete
    or
update
    on
    public.citas for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.citas OWNER TO postgres;
GRANT ALL ON TABLE public.citas TO postgres;


-- public.consultas definition

-- Drop table

-- DROP TABLE public.consultas;

CREATE TABLE public.consultas ( id uuid DEFAULT gen_random_uuid() NOT NULL, ficha_origen_id uuid NOT NULL, consulta_padre_id uuid NULL, motivo_consulta text NOT NULL, observaciones text NULL, requiere_retorno bool DEFAULT false NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT consultas_pkey PRIMARY KEY (id));

-- Table Triggers

create trigger trg_consultas_audit after
insert
    or
delete
    or
update
    on
    public.consultas for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.consultas OWNER TO postgres;
GRANT ALL ON TABLE public.consultas TO postgres;


-- public.fichas definition

-- Drop table

-- DROP TABLE public.fichas;

CREATE TABLE public.fichas ( id uuid DEFAULT gen_random_uuid() NOT NULL, paciente_id text NOT NULL, disponibilidad_id uuid NULL, turno_codigo text NOT NULL, fecha_ficha timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, motivo text NULL, estado public."EstadoFicha" DEFAULT 'ADMISION'::"EstadoFicha" NULL, orden_turno int4 NULL, cita_origen_id uuid NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT fichas_pkey PRIMARY KEY (id));
CREATE UNIQUE INDEX fichas_turno_codigo_fecha_ficha_orden_turno_key ON public.fichas USING btree (turno_codigo, fecha_ficha, orden_turno);

-- Table Triggers

create trigger trg_fichas_audit after
insert
    or
delete
    or
update
    on
    public.fichas for each row execute function auditoria_generica();

-- Permissions

ALTER TABLE public.fichas OWNER TO postgres;
GRANT ALL ON TABLE public.fichas TO postgres;


-- public.notificaciones definition

-- Drop table

-- DROP TABLE public.notificaciones;

CREATE TABLE public.notificaciones ( id uuid DEFAULT gen_random_uuid() NOT NULL, paciente_id text NOT NULL, titulo varchar(255) NOT NULL, mensaje varchar(255) NOT NULL, fecha_envio timestamp(0) NOT NULL, leido bool DEFAULT false NOT NULL, medio varchar(255) NOT NULL, cita_id uuid NOT NULL, creado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, creado_por text NULL, actualizado_en timestamptz(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, actualizado_por text NULL, eliminado_en timestamptz(0) NULL, eliminado_por text NULL, CONSTRAINT notificaciones_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.notificaciones OWNER TO postgres;
GRANT ALL ON TABLE public.notificaciones TO postgres;


-- public.citas foreign keys

ALTER TABLE public.citas ADD CONSTRAINT citas_consulta_id_fkey FOREIGN KEY (consulta_id) REFERENCES public.consultas(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.citas ADD CONSTRAINT citas_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctores(doctor_id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.citas ADD CONSTRAINT citas_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(paciente_id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.citas ADD CONSTRAINT citas_tratamiento_id_fkey FOREIGN KEY (tratamiento_id) REFERENCES public.tratamientos(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.citas ADD CONSTRAINT citas_turno_codigo_fkey FOREIGN KEY (turno_codigo) REFERENCES public.turnos_catalogo(codigo);


-- public.consultas foreign keys

ALTER TABLE public.consultas ADD CONSTRAINT consultas_consulta_padre_id_fkey FOREIGN KEY (consulta_padre_id) REFERENCES public.consultas(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.consultas ADD CONSTRAINT consultas_ficha_origen_id_fkey FOREIGN KEY (ficha_origen_id) REFERENCES public.fichas(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.fichas foreign keys

ALTER TABLE public.fichas ADD CONSTRAINT fichas_cita_origen_id_fkey FOREIGN KEY (cita_origen_id) REFERENCES public.citas(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.fichas ADD CONSTRAINT fichas_disponibilidad_id_foreign FOREIGN KEY (disponibilidad_id) REFERENCES public.disponibilidades(id);
ALTER TABLE public.fichas ADD CONSTRAINT fichas_paciente_id_foreign FOREIGN KEY (paciente_id) REFERENCES public.pacientes(paciente_id);


-- public.notificaciones foreign keys

ALTER TABLE public.notificaciones ADD CONSTRAINT notificaciones_cita_id_foreign FOREIGN KEY (cita_id) REFERENCES public.citas(id);
ALTER TABLE public.notificaciones ADD CONSTRAINT notificaciones_paciente_id_foreign FOREIGN KEY (paciente_id) REFERENCES public.pacientes(paciente_id);



-- DROP FUNCTION public.auditoria_generica();

CREATE OR REPLACE FUNCTION public.auditoria_generica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario_id TEXT;
    v_registro_id TEXT;
    v_old_json JSONB := NULL;
    v_new_json JSONB := NULL;
BEGIN
    -- 1. Convertir la fila entera a formato JSON de forma segura
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_new_json := to_jsonb(NEW);
    END IF;
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        v_old_json := to_jsonb(OLD);
    END IF;

    -- 2. Buscar cuál es el ID del registro probando todos tus posibles nombres de PK
    IF TG_OP = 'DELETE' THEN
        v_registro_id := COALESCE(
            v_old_json->>'id',
            v_old_json->>'usuario_id',
            v_old_json->>'paciente_id',
            v_old_json->>'doctor_id',
            v_old_json->>'codigo',
            'SIN_ID'
        );
        v_usuario_id := v_old_json->>'eliminado_por';
    ELSE
        v_registro_id := COALESCE(
            v_new_json->>'id',
            v_new_json->>'usuario_id',
            v_new_json->>'paciente_id',
            v_new_json->>'doctor_id',
            v_new_json->>'codigo',
            'SIN_ID'
        );

        IF TG_OP = 'INSERT' THEN
            v_usuario_id := v_new_json->>'creado_por';
        ELSE
            v_usuario_id := v_new_json->>'actualizado_por';
        END IF;
    END IF;

    -- 3. Insertar en el log de auditoría
    INSERT INTO auditoria_log (
        nombre_tabla,
        registro_id,
        accion,
        usuario_id,
        registro_antiguo,
        registro_nuevo,
        fecha_cambio
    )
    VALUES (
        TG_TABLE_NAME,
        v_registro_id,
        TG_OP,
        NULLIF(v_usuario_id, '')::uuid, 
        COALESCE(v_old_json, '{}'::jsonb),
        COALESCE(v_new_json, '{}'::jsonb),
        NOW()
    );

    -- 4. Retornar la fila intacta para que la operación original continúe
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.auditoria_generica() OWNER TO postgres;
GRANT ALL ON FUNCTION public.auditoria_generica() TO postgres;


-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;