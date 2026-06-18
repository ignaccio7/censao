# Cálculo Real de Puntos de Función (FPA) - Proyecto Censao

A continuación, aplicaremos la teoría del FPA **directamente a tu proyecto (Centro de Salud Alto Obrajes - Censao)**. Dado que utilizaste la metodología Cascada, estructuraremos el recuento de las funcionalidades transaccionales exactamente en los 6 módulos que definiste para tu desarrollo.

---

## PASO 1: Identificación de Archivos de Datos (ILF y EIF)

Primero, debemos contar las tablas principales de la base de datos de tu sistema. Estos son los **Archivos Lógicos Internos (ILF)** que tu sistema mantiene.

_Nota: Asumiremos que no hay **Archivos de Interfaz Externa (EIF)** ya que todos los datos (doctores, pacientes, turnos) se gestionan internamente en tu base de datos de PostgreSQL._

| Componente (ILF)           | Descripción en tu Arquitectura                                              | Complejidad | Puntos |
| :------------------------- | :-------------------------------------------------------------------------- | :---------: | :----: |
| **Usuarios y Seguridad**   | Tablas `usuarios`, `roles`, `permisos`, `usuarios_roles` (RBAC+ABAC).       |    Alta     |   15   |
| **Pacientes**              | Tablas `pacientes` y `personas`.                                            |    Alta     |   15   |
| **Fichas de Atención**     | Tabla `fichas` (Estados: ADMISION, ENFERMERIA, EN_ESPERA, etc).             |    Media    |   10   |
| **Consultas Médicas**      | Tabla `consultas` (Jerarquía padre-hijo, seguimientos).                     |    Media    |   10   |
| **Tratamientos y Vacunas** | Tablas `tratamientos` (esquemas) y `vacunas` (catálogo).                    |    Media    |   10   |
| **Citas Programadas**      | Tabla `citas` (Relacionada a tratamientos o consultas).                     |    Media    |   10   |
| **Doctores y Turnos**      | Tablas `doctores`, `especialidades`, `disponibilidades`, `turnos_catalogo`. |    Alta     |   15   |
| **Total Puntos de Datos**  |                                                                             |             | **85** |

---

## PASO 2: Identificación de Transacciones por Módulo

Ahora, desglosaremos las acciones que los usuarios (Administrador, Doctor General, Enfermería, Doctor Fichas, Paciente) realizan en el sistema, divididas en los 6 módulos de tu diseño en Cascada.

### Módulo 1: Control de acceso

Todo lo relacionado al ingreso y validación del sistema (NextAuth).

- **Login de credenciales** (Entrada - EI): Complejidad Baja -> **3 pts**
- **Cerrar Sesión** (Entrada - EI): Complejidad Baja -> **3 pts**
- **Total Módulo 1: 6 puntos**

### Módulo 2: Administrar usuarios

Acciones que realiza el rol `ADMINISTRADOR`.

- **Crear Usuario multipaso** (Entrada - EI): Formulario complejo con @stepperize. Complejidad Alta -> **6 pts**
- **Editar Usuario / Rol** (Entrada - EI): Complejidad Alta -> **6 pts**
- **Inactivar Usuario (Soft Delete)** (Entrada - EI): Complejidad Baja -> **3 pts**
- **Listar Usuarios paginado con búsqueda** (Consulta - EQ): Complejidad Media -> **4 pts**
- **Asignar Especialidades a Doctor** (Entrada - EI): Complejidad Media -> **4 pts**
- **Total Módulo 2: 23 puntos**

### Módulo 3: Gestionar fichas

El núcleo del sistema, operado por el `DOCTOR_FICHAS` y `ENFERMERIA`.

- **Registrar Paciente Nuevo** (Entrada - EI): Complejidad Media -> **4 pts**
- **Crear Ficha Presencial (Estado ADMISION)** (Entrada - EI): Complejidad Media -> **4 pts**
- **Generar Lote de Fichas desde Citas** (Entrada - EI): Algoritmo de números negativos. Complejidad Alta -> **6 pts**
- **Llamar Paciente (Triage Enfermería)** (Entrada - EI): Cambio de estado. Complejidad Baja -> **3 pts**
- **Asignar Médico Disponible** (Entrada - EI): Filtra doctores activos. Complejidad Media -> **4 pts**
- **Reasignar Ficha a otro médico** (Entrada - EI): Complejidad Media -> **4 pts**
- **Listar Fichas por Rol** (Consulta - EQ): Dashboard del doctor de fichas. Complejidad Media -> **4 pts**
- **Pantalla Pública de Fichas** (Consulta - EQ): Polling en vivo para pacientes. Complejidad Baja -> **3 pts**
- **Total Módulo 3: 32 puntos**

### Módulo 4: Gestión de consultas y tratamientos

Operado por `DOCTOR_GENERAL` y `ENFERMERIA`.

- **Registrar Tratamiento de Vacunación** (Entrada - EI): Realizado por enfermería. Complejidad Media -> **4 pts**
- **Registrar Consulta Padre** (Entrada - EI): Realizado por el Doctor General. Complejidad Alta -> **6 pts**
- **Registrar Consulta de Seguimiento** (Entrada - EI): Aplica lógica de absorción de citas. Complejidad Media -> **4 pts**
- **Ver Historial Clínico completo** (Consulta - EQ): Línea de tiempo de 3 niveles. Complejidad Alta -> **6 pts**
- **Ver Lista de Mis Pacientes** (Consulta - EQ): Vista exclusiva del doctor. Complejidad Media -> **4 pts**
- **Finalizar Atención (Estado ATENDIDA)** (Entrada - EI): Complejidad Baja -> **3 pts**
- **Total Módulo 4: 27 puntos**

### Módulo 5: Gestionar citas

Planificación de futuras atenciones.

- **Programar Cita de Retorno** (Entrada - EI): Complejidad Media -> **4 pts**
- **Programar Siguiente Dosis** (Entrada - EI): Complejidad Media -> **4 pts**
- **Reprogramar Cita (Estado VENCIDA/CANCELADA)** (Entrada - EI): Complejidad Media -> **4 pts**
- **Cancelar Cita** (Entrada - EI): Complejidad Baja -> **3 pts**
- **Listar Agenda de Citas** (Consulta - EQ): Complejidad Media -> **4 pts**
- **Total Módulo 5: 19 puntos**

### Módulo 6: Gestionar notificaciones

- **Cronjob de Recordatorios Automáticos Diarios** (Salida - EO): Calcula quién tiene cita mañana y envía correo. Complejidad Media -> **5 pts**
- **Notificación Manual al generar lotes** (Salida - EO): Notifica números de turno. Complejidad Media -> **5 pts**
- **Total Módulo 6: 10 puntos**

---

## PASO 3: Cálculo del UFP (Puntos Sin Ajustar)

Sumamos todo lo que hemos contabilizado:

- Datos Lógicos (ILF): 85
- Módulo 1: 6
- Módulo 2: 23
- Módulo 3: 32
- Módulo 4: 27
- Módulo 5: 19
- Módulo 6: 10

**UFP Total = 85 + 6 + 23 + 32 + 27 + 19 + 10 = 202 Puntos de Función Sin Ajustar.**

---

## PASO 4: Factor de Ajuste (VAF) para el Proyecto Censao

Evaluamos las 14 preguntas de IFPUG para tu sistema específico (del 0 al 5):

1. **Comunicación de Datos (3):** Es una aplicación web moderna (Next.js) accesible por red local o internet.
2. **Proceso Distribuido (1):** Centralizado en un backend/PostgreSQL.
3. **Rendimiento (3):** Importante, especialmente para la pantalla pública (polling) y carga de médicos.
4. **Hardware Restringido (1):** Corre en navegadores estándar.
5. **Transacciones (2):** Volumen moderado de un centro de salud.
6. **Ingreso de Datos en Línea (5):** El 100% de la gestión es en línea (formularios de historias médicas).
7. **Eficiencia del Usuario (4):** Muy importante. Los doctores y enfermeras necesitan UI rápida para no retrasar a los pacientes.
8. **Actualizaciones en Línea (5):** Los cambios de estado de fichas (Llamar, Atender) se reflejan inmediatamente.
9. **Lógica Compleja (3):** Lógica híbrida RBAC+ABAC, jerarquías de consultas padre-hijo, números negativos para turnos.
10. **Reusabilidad (2):** Estructura modular (Screaming Architecture), pero específica al centro.
11. **Instalación (2):** Despliegue típico de Next.js/Docker.
12. **Operatividad Fácil (3):** Interfaz administrativa clara.
13. **Múltiples Sitios (1):** Solo para el Centro Alto Obrajes.
14. **Facilidad de Cambios (3):** Estructurado con React Hook Form, Zod y Prisma, permitiendo adaptabilidad.

**Suma (TDI) = 3 + 1 + 3 + 1 + 2 + 5 + 4 + 5 + 3 + 2 + 2 + 3 + 1 + 3 = 38**

Aplicamos la fórmula:
$$VAF = 0.65 + (0.01 \times 38) = 0.65 + 0.38 = \mathbf{1.03}$$

_Nota: Un VAF de 1.03 significa que el proyecto es un 3% más complejo que el promedio debido a que es 100% online y requiere actualizaciones en vivo para los turnos._

---

## PASO 5: Resultado Final, Horas y Presupuesto

**1. Puntos de Función Finales (FP)**
$$FP = 202 \times 1.03 = \mathbf{208 \text{ Puntos de Función}}$$
El tamaño funcional real de tu sistema "Censao" es de 208 Puntos.

**2. Conversión a Esfuerzo (Horas)**
Utilizando la métrica industrial promedio para tecnologías modernas (Next.js, TypeScript, Node) donde 1 Punto = 10 horas de desarrollo (incluyendo diseño, BD, backend, frontend y pruebas):
$$Esfuerzo = 208 \text{ FP} \times 10 \text{ hrs/FP} = \mathbf{2,080 \text{ Horas de Trabajo}}$$
_Si una persona trabaja 8 hrs al día (160 hrs al mes), este proyecto equivale a aproximadamente **13 meses de trabajo continuo** para un solo desarrollador._

**3. Valoración Económica**
Si el costo promedio por hora de un Ingeniero de Software Junior/Mid-level en tu región fuera de, por ejemplo, **$15 USD/hora**:
$$Presupuesto = 2,080 \text{ horas} \times \$15 = \mathbf{\$31,200 \text{ USD}}$$

### Conclusión para tu Documento de Grado:

Mediante la métrica de Puntos de Función evaluando los 6 módulos bajo la metodología Cascada, se demuestra que el proyecto **"Censao" tiene un tamaño de 208 Puntos de Función**. Esto representa un esfuerzo ingenieril de **2,080 horas**, valuadas comercialmente en más de **$30,000 USD**. Este análisis justifica la magnitud del aporte tecnológico y la donación que se realiza al Centro de Salud Alto Obrajes.
