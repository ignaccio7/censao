-- This is an empty migration.
-- 1. Crear la función de auditoría
-- Función mejorada que detecta la PK según la tabla
CREATE OR REPLACE FUNCTION auditoria_generica()
RETURNS TRIGGER
AS $$
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
$$ LANGUAGE plpgsql;

-- Lista de triggers para tus tablas
CREATE TRIGGER trg_fichas_audit AFTER INSERT OR UPDATE OR DELETE ON fichas FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_pacientes_audit AFTER INSERT OR UPDATE OR DELETE ON pacientes FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_citas_audit AFTER INSERT OR UPDATE OR DELETE ON citas FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_doctores_audit AFTER INSERT OR UPDATE OR DELETE ON doctores FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_consultas_audit AFTER INSERT OR UPDATE OR DELETE ON consultas FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_usuarios_audit AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_vacunas_audit AFTER INSERT OR UPDATE OR DELETE ON vacunas FOR EACH ROW EXECUTE FUNCTION auditoria_generica();
CREATE TRIGGER trg_tratamientos_audit AFTER INSERT OR UPDATE OR DELETE ON tratamientos FOR EACH ROW EXECUTE FUNCTION auditoria_generica();