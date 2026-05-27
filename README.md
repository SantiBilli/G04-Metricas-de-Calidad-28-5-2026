# 📊 Prototipo de Sistema de Métricas para Control de Calidad

**Materia:** Calidad de Software  
**Proyecto Evaluado:** Panel de Administración Médica
**Lenguaje del Prototipo Analizador:** Node.js (JavaScript)

---

## 📝 Descripción del Ejercicio

Este proyecto implementa un prototipo de automatización diseñado para extraer y analizar métricas de calidad directamente desde el código fuente del software. El objetivo es identificar la "Deuda Técnica" y la complejidad estructural sin intervención manual, promoviendo prácticas de integración continua.

El prototipo consiste en un script (`analizador_metricas.mjs`) que procesa todo el árbol de directorios del software y evalúa sus reglas de negocio contra **2 métricas fundamentales de calidad**.

## Métricas Seleccionadas y Justificación

### Métrica 1: Densidad de Defectos Estáticos

- **Definición:** Número de defectos detectados por cada 1,000 líneas de código (LOC).
- **Criterio del Prototipo:** El script busca de forma automatizada "Code Smells" o malas prácticas. En este entorno (TypeScript), se penaliza la presencia de logs olvidados (`console.log`, `console.error`), tipos inseguros (`any`) y evasiones del compilador (`@ts-ignore`).
- **Justificación de Calidad:** Una densidad alta de defectos estáticos indica una baja madurez del desarrollo, haciéndolo vulnerable a errores en producción por falta de tipado estricto o fugas de información en logs.

### Métrica 2: Índice de Complejidad Modular (Proporción de Archivos Complejos)

- **Definición:** Porcentaje del código fuente que excede el límite recomendado de mantenibilidad (establecido en 200 líneas por archivo).
- **Justificación de Calidad:** Archivos extremadamente largos (a menudo llamados _God Objects_ o Archivos Dios) violan el "Principio de Responsabilidad Única" (SRP). Un índice alto advierte a los arquitectos de software que el sistema es frágil, difícil de probar (baja testabilidad) y complejo para que los nuevos programadores lo entiendan.

### Métrica 3: Nivel de Acoplamiento (Dependencias por Archivo)

- **Definición:** Promedio de importaciones (`import`) que realiza cada archivo del proyecto.
- **Justificación de Calidad:** Un buen diseño debe tener "Alta Cohesión y Bajo Acoplamiento". Si un archivo tiene demasiadas dependencias, significa que está fuertemente acoplado a otros módulos. Un cambio en cualquier otra parte del sistema podría romper este módulo, disminuyendo la robustez del software.

### Métrica 4: Deuda Técnica Explícita (Tareas Pendientes)

- **Definición:** Conteo absoluto de etiquetas de desarrollo postergado (como `TODO:` o `FIXME:`) presentes en el código fuente.
- **Justificación de Calidad:** Permite cuantificar la "Deuda Técnica". Un código de producción limpio no debería tener recordatorios de código sin terminar. Identificarlos automáticamente ayuda a los Quality Assurance (QA) a saber si el equipo de desarrollo está enviando características a medias.

### Métrica 5: Complejidad Estructural (Anidamiento Profundo)

- **Definición:** Porcentaje de líneas de código que poseen múltiples niveles de indentación o "sangría" (más de 6 niveles).
- **Justificación de Calidad:** Mide directamente la Complejidad Ciclomática visual. Un código muy indentado suele indicar presencia de "Código Espagueti" (muchos bucles `for` e `if` anidados). Esto aumenta radicalmente la carga cognitiva para el programador que debe mantenerlo y multiplica los posibles flujos de error.

---

## Instrucciones de Ejecución

Para realizar la demostración en clase, abre la terminal en la raíz del proyecto y ejecuta el analizador con Node.js:

```bash
node analizador_metricas.mjs
```

## 📋 Ejemplo de Salida Esperada

```text
==================================================
🚀 INICIANDO ANÁLISIS DE CALIDAD DE SOFTWARE 🚀
==================================================

📊 RESULTADOS DEL ANÁLISIS DE CÓDIGO FUENTE:
   - Total de archivos analizados: 24
   - Líneas de código (LOC) totales: 2150

📌 MÉTRICA 1: Densidad de Defectos (Code Smells por 1000 LOC)
   - Total de defectos encontrados: 15
   - Resultado: 6.97 defectos / 1000 LOC
   - Evaluación: EXCELENTE. El código es muy limpio.

📌 MÉTRICA 2: Índice de Complejidad (Archivos > 200 líneas)
   - Archivos muy extensos: 3
   - Resultado: 12.50% del sistema es de alta complejidad.
   - Evaluación: ÓPTIMA. El software está bien modularizado.
```

---

## 📈 Conclusiones

A través de este prototipo validamos que la creación de un sistema de métricas no requiere necesariamente software comercial costoso; mediante herramientas de análisis estático construidas a medida podemos obtener radiografías instantáneas del estado del proyecto e integrarlas en pipelines de CI/CD para detener pases a producción si las métricas no cumplen con los estándares del equipo.

---

## 📝 Notas y Glosario (Defensa del Proyecto)

- **LOC (Lines of Code / Líneas de Código):** Es la unidad de medida base del tamaño de un software. Al estandarizar las métricas a "por cada 1000 LOC", aseguramos que el sistema de medición sea justo y escalable, permitiendo comparar objetivamente la calidad de un módulo gigantesco frente a uno muy pequeño.
- **Code Smells (Olores en el Código):** Término acuñado por Martin Fowler. A diferencia de un _bug_ (un error que rompe la aplicación), un _Code Smell_ es un código que funciona perfectamente pero que presenta síntomas de un mal diseño o malas prácticas (por ejemplo, dejar logs de depuración en producción o evadir el tipado estricto). Medirlos permite gestionar la "Deuda Técnica" de forma preventiva antes de que evolucionen a errores críticos.
