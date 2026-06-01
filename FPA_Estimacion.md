# Estimación de Software mediante Puntos de Función (FPA)

_Una guía paso a paso explicada desde cero_

---

## 1. Introducción y Objetivo de la Métrica

Imagina que eres un arquitecto y alguien te pide construir una casa. Antes de decirle cuánto le vas a cobrar, necesitas saber de qué tamaño será la casa (cuántos metros cuadrados). En el desarrollo de software ocurre lo mismo: no podemos calcular el precio ni el tiempo de desarrollo sin saber el "tamaño" del sistema.

Para medir el tamaño de un software, no usamos "metros cuadrados", usamos **Puntos de Función (Function Points)**.

**¿Para qué sirve exactamente esta métrica?**
Sirve para estimar **esfuerzo (horas de trabajo) y costos (presupuesto económico)** ANTES de empezar a programar o al finalizar el diseño. Se enfoca en contar las funcionalidades que el usuario final va a utilizar, sin importar si usas React, Node.js, Python o cualquier otro lenguaje.

Todo el proceso que verás a continuación no fue inventado al azar. Proviene de un estándar internacional creado por el **IFPUG** (International Function Point Users Group), una organización mundial que definió estas reglas para que todas las empresas de software midan los proyectos de la misma manera.

El cálculo se realiza en **3 grandes pasos**, como si estuviéramos cotizando la casa:

1. Contar cuántos "ladrillos y habitaciones" tiene (Componentes lógicos).
2. Evaluar qué tan difícil es el terreno donde construiremos (Factor de Ajuste).
3. Multiplicar el tamaño por la dificultad para obtener el costo final.

---

## 2. Paso 1: Identificación de los Componentes (Contar los ladrillos)

El estándar IFPUG nos dice que todo software en el mundo hace solo 5 cosas básicas. Nuestra primera tarea es revisar nuestro sistema (en este caso, el _"Software de gestión de fichas médicas y monitoreo de vacunación"_) y clasificar cada funcionalidad en una de estas 5 categorías:

### A. Almacenamiento de Datos (Lo que se guarda)

- **1. Archivos Lógicos Internos (ILF):**
  - **¿Qué es?** Son las tablas principales de tu base de datos. Información que TU sistema crea, guarda, modifica y elimina.
  - **Ejemplo en tu sistema:** La tabla `Pacientes`, la tabla `Fichas`, la tabla `Consultas` y la tabla `Tratamientos_Vacunacion`.
  - **¿Por qué se cuenta?** Porque programar la estructura para guardar estos datos toma tiempo.

- **2. Archivos de Interfaz Externa (EIF):**
  - **¿Qué es?** Son datos que tú necesitas leer, pero que están guardados en la base de datos de _otro_ sistema que tú no controlas. Solo los lees, no los modificas.
  - **Ejemplo en tu sistema:** Si tu software se conectara al sistema del **SEGIP** para autocompletar el nombre de un paciente ingresando solo su carnet. Esa conexión cuenta como un EIF.

### B. Transacciones (Lo que el usuario hace)

- **3. Entradas Externas (EI):**
  - **¿Qué es?** Son todos los formularios donde el usuario ingresa datos para guardarlos o modificarlos en tu base de datos. Los datos van de AFUERA hacia ADENTRO.
  - **Ejemplo en tu sistema:** El formulario donde el Doctor de Fichas hace clic en **"Registrar Paciente Nuevo"** o **"Crear Nueva Ficha de Atención"**.

- **4. Salidas Externas (EO):**
  - **¿Qué es?** Es cuando el sistema saca información de la base de datos, le hace **cálculos matemáticos complejos o cruces lógicos**, y se la muestra al usuario.
  - **Ejemplo en tu sistema:** Un **"Reporte estadístico mensual de Vacunas"**. ¿Por qué es una Salida (EO)? Porque el sistema no solo muestra datos, sino que suma cuántas vacunas de Covid se pusieron, cuántas de Tétanos, calcula porcentajes, etc.

- **5. Consultas Externas (EQ):**
  - **¿Qué es?** Es cuando el usuario busca información y el sistema solo se la muestra en pantalla, **sin hacer ningún cálculo matemático**. Es una simple lectura.
  - **Ejemplo en tu sistema:** Cuando el Doctor escribe un Carnet de Identidad en el buscador y el sistema le muestra los datos del paciente. O la **"Pantalla Pública de Fichas"** que solo lee quién sigue en la fila y lo muestra.

---

## 3. Paso 2: Cálculo de Puntos de Función Sin Ajustar (UFP)

Una vez que listamos todos nuestros ILF, EIF, EI, EO y EQ, no podemos decir que todos valen lo mismo. Un formulario con 2 campos es fácil de programar; un formulario con 50 campos es muy difícil.

**¿De dónde sale la tabla de puntajes?**
El estándar mundial IFPUG creó una tabla estricta. Te dice que debes evaluar cada componente como: **Bajo, Medio o Alto**.

- _¿Cómo sabes si es Bajo o Alto?_ Cuentas los campos que tiene. Por ejemplo, si la tabla `Pacientes` tiene menos de 19 campos (nombre, CI, edad, etc.), el IFPUG dice que es de complejidad "Baja". Si tiene 50 campos, es "Alta".

Aquí está la tabla oficial del IFPUG con los puntos que se otorgan:

| Tipo de Componente           | Complejidad Baja | Complejidad Media | Complejidad Alta |
| :--------------------------- | :--------------: | :---------------: | :--------------: |
| **Tablas Internas (ILF)**    |     7 puntos     |     10 puntos     |    15 puntos     |
| **Tablas Externas (EIF)**    |     5 puntos     |     7 puntos      |    10 puntos     |
| **Formularios (EI)**         |     3 puntos     |     4 puntos      |     6 puntos     |
| **Reportes Calculados (EO)** |     4 puntos     |     5 puntos      |     7 puntos     |
| **Búsquedas Simples (EQ)**   |     3 puntos     |     4 puntos      |     6 puntos     |

### Ejemplo Práctico de Cálculo:

Vamos a sumar los puntos (a esta suma se le llama **UFP**, que en inglés significa _Unadjusted Function Points_ o Puntos Sin Ajustar).

1. Tienes 4 tablas principales (ILF) de complejidad Media: `4 tablas x 10 puntos = 40`
2. Tienes 1 conexión al SEGIP (EIF) complejidad Baja: `1 conexión x 5 puntos = 5`
3. Tienes 10 formularios (EI) de complejidad Baja: `10 formularios x 3 puntos = 30`
4. Tienes 2 reportes (EO) de complejidad Media: `2 reportes x 5 puntos = 10`
5. Tienes 5 búsquedas simples (EQ) complejidad Baja: `5 búsquedas x 3 puntos = 15`

**Fórmula y resultado:**
$$UFP = 40 + 5 + 30 + 10 + 15 = 100 \text{ Puntos}$$
Nuestro software, en "tamaño bruto", mide **100 Puntos de Función**.

---

## 4. Paso 3: Factor de Ajuste de Valor (VAF)

Ya sabemos que la casa mide "100 puntos". Pero no es lo mismo construir esa casa en un terreno plano que en la punta de un cerro rocoso. En el software, la "dificultad del terreno" se llama **Factor de Ajuste de Valor (VAF)**.

El IFPUG estableció **14 preguntas estándar** (Características Generales del Sistema) que debes responder. A cada pregunta le das una nota del **0 al 5**:
_(0 = No aplica, 1 = Muy poco importante ... 5 = Crítico para el sistema)._

**¿Cuáles son las 14 preguntas que nos hace el IFPUG?**

1. ¿El sistema se comunica por redes con otros servidores?
2. ¿El procesamiento de datos está distribuido en varias computadoras?
3. **¿El rendimiento y la velocidad son críticos?** (Para un hospital, sí = 4 o 5).
4. ¿El equipo de hardware donde va a correr es muy viejo o limitado?
5. ¿Habrá miles de transacciones por segundo al mismo tiempo?
6. ¿Se ingresan datos online masivamente?
7. **¿El diseño debe ser extremadamente fácil de usar para el usuario final?** (Para enfermeras ocupadas, sí = 5).
8. ¿Las tablas se actualizan en vivo constantemente? (Ej. La pantalla pública).
9. ¿Tiene algoritmos matemáticos complejos?
10. ¿El código se está escribiendo para revenderlo a otros centros de salud?
11. ¿El sistema debe ser fácil de instalar?
12. ¿Debe tener respaldos (backups) automáticos muy seguros?
13. ¿Se va a usar en múltiples sucursales a la vez?
14. ¿Debe ser fácil cambiar la lógica en el futuro?

Supongamos que al responder las 14 preguntas y sumar sus notas del 0 al 5, obtienes un total de **40**. Este número se llama **TDI (Total Degree of Influence)**.

### ¿Por qué existe una fórmula matemática aquí?

La fórmula oficial del IFPUG es:
$$VAF = 0.65 + (0.01 \times TDI)$$

**¿De dónde sale el 0.65 y el 0.01?**
El IFPUG decidió matemáticamente que:

- Si tu sistema es lo más básico del mundo (todas las respuestas fueron cero), la dificultad del terreno es tan baja que te descuentan el 35% del tamaño (0.65).
- Si tu sistema es complejísimo (todas las respuestas fueron cinco, 14 x 5 = 70), el cálculo sería `0.65 + (0.01 * 70) = 1.35`. Esto significa que te premian aumentándole un 35% al tamaño de tu proyecto por su alta dificultad técnica.

**Calculando nuestro ejemplo:**
$$VAF = 0.65 + (0.01 \times 40) = 0.65 + 0.40 = \mathbf{1.05}$$
Nuestro Factor de Ajuste es **1.05** (significa que el proyecto tiene un 5% extra de dificultad técnica por encima del promedio).

---

## 5. Paso 4: El Cálculo Final del Costo (FP)

Ahora juntamos el Paso 2 y el Paso 3.

**Fórmula Final:**
$$Puntos\_De\_Funcion\_Finales (FP) = UFP \times VAF$$

$$FP = 100 \times 1.05 = \mathbf{105 \text{ Puntos de Función}}$$

¡Listo! El tamaño oficial, estándar y auditado de tu software es de **105 Puntos de Función**.

### ¿Cómo traduzco los Puntos a Dinero y Tiempo?

Para esto usamos métricas históricas de la industria del software. Hay tablas famosas, como las de _Capers Jones_, que analizaron miles de proyectos y determinaron promedios.

**1. Calculando las Horas de Trabajo:**
La industria indica que, en lenguajes modernos (como TypeScript/React/Node), programar **1 Punto de Función toma alrededor de 10 horas de trabajo** (esto incluye reunir requisitos, diseñar, programar y probar).

- Cálculo de esfuerzo: `105 Puntos x 10 horas = 1,050 horas de trabajo`.
- Si tú trabajaras 8 horas al día de lunes a viernes (160 horas al mes), terminar esto te tomaría unos **6.5 meses** a ti solo.

**2. Calculando el Presupuesto (Dinero):**
Una vez que tienes las horas, simplemente multiplicas por lo que cuesta la hora de un Ingeniero de Software en tu país.

- Supongamos que tu hora de trabajo cuesta **$15 USD**.
- Cálculo de dinero: `1,050 horas x $15 USD = $15,750 USD`.

**Conclusión Final:**
Cuando tu docente te dice "esta métrica no aplica porque no les vas a cobrar al Centro de Salud", se refiere a que el Centro de Salud Alto Obrajes no tiene el presupuesto para pagarte **$15,750 USD** por el desarrollo comercial del software. Al ser un proyecto de grado, donación o práctica académica, el "costo" real no se factura al cliente, pero el ejercicio de FPA demuestra matemáticamente **cuánto valor comercial real estás donando a la institución.**
