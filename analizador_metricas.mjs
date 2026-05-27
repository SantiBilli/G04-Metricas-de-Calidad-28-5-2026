import fs from 'fs';
import path from 'path';

const directoriosAAnalizar = ['app', 'components', 'services', 'types'];
const extensionesValidas = ['.ts', '.tsx'];

let totalLineas = 0;
let totalArchivos = 0;
let totalDefectos = 0;
let archivosComplejos = 0;
let totalImports = 0;
let totalDeudaTecnica = 0;
let lineasProfundas = 0;

function analizarDirectorio(dir) {
  const archivos = fs.readdirSync(dir);

  archivos.forEach((archivo) => {
    const rutaCompleta = path.join(dir, archivo);
    const stat = fs.statSync(rutaCompleta);

    if (stat.isDirectory()) {
      analizarDirectorio(rutaCompleta);
    } else if (extensionesValidas.includes(path.extname(archivo))) {
      analizarArchivo(rutaCompleta);
    }
  });
}

function analizarArchivo(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf-8');
  const lineas = contenido.split('\n');

  totalArchivos++;
  totalLineas += lineas.length;

  // Evaluar Métrica 2: Mantenibilidad (Longitud del archivo)
  if (lineas.length > 200) {
    archivosComplejos++;
  }

  // Evaluar Metricas
  lineas.forEach((linea) => {
    const trimmed = linea.trim();

    // Métrica 1: Defectos Estáticos
    if (
      linea.includes('console.log') ||
      linea.includes('console.error') ||
      linea.match(/\bany\b/) ||
      linea.includes('@ts-ignore')
    ) {
      totalDefectos++;
    }

    // Métrica 3: Acoplamiento (Dependencias)
    if (trimmed.startsWith('import ')) {
      totalImports++;
    }

    // Métrica 4: Deuda Técnica Explícita
    if (trimmed.includes('TODO:') || trimmed.includes('FIXME:')) {
      totalDeudaTecnica++;
    }

    // Métrica 5: Complejidad estructural (Indentación > 12 espacios)
    const leadingSpaces = linea.search(/\S/);
    if (leadingSpaces > 12) {
      lineasProfundas++;
    }
  });
}

// Ejecución principal
console.log('==================================================');
console.log('ANALISIS DE CALIDAD DE SOFTWARE');
console.log('==================================================');

directoriosAAnalizar.forEach((dir) => {
  if (fs.existsSync(dir)) {
    analizarDirectorio(dir);
  }
});

const densidadDefectos = ((totalDefectos / totalLineas) * 1000).toFixed(2);
const porcentajeArchivosComplejos = ((archivosComplejos / totalArchivos) * 100).toFixed(2);
const promedioImports = (totalImports / totalArchivos).toFixed(1);
const porcentajeAnidamiento = ((lineasProfundas / totalLineas) * 100).toFixed(2);

console.log(`\nRESULTADOS DEL ANÁLISIS DE CÓDIGO FUENTE:`);
console.log(`   - Total de archivos analizados: ${totalArchivos}`);
console.log(`   - Líneas de código (LOC) totales: ${totalLineas}`);

console.log(`\nMÉTRICA 1: Densidad de Defectos Estáticos`);
console.log(`   - Total de defectos encontrados: ${totalDefectos}`);
console.log(`   - Resultado: ${densidadDefectos} defectos / 1000 LOC`);
if (densidadDefectos < 10) {
  console.log(`   - Evaluación: EXCELENTE. El código es muy limpio.`);
} else {
  console.log(`   - Evaluación: ALERTA. Se recomienda refactorizar y tipar mejor.`);
}

console.log(`\nMÉTRICA 2: Índice de Complejidad Modular (Archivos > 200 líneas)`);
console.log(`   - Archivos muy extensos: ${archivosComplejos}`);
console.log(`   - Resultado: ${porcentajeArchivosComplejos}% del sistema es de alta complejidad.`);
if (porcentajeArchivosComplejos < 15) {
  console.log(`   - Evaluación: ÓPTIMA. El software está bien modularizado.`);
} else {
  console.log(`   - Evaluación: REGULAR. Hay archivos que concentran demasiada lógica.`);
}

console.log(`\nMÉTRICA 3: Nivel de Acoplamiento (Dependencias)`);
console.log(`   - Total de imports detectados: ${totalImports}`);
console.log(`   - Resultado: ${promedioImports} dependencias en promedio por archivo.`);
if (promedioImports <= 8) {
  console.log(`   - Evaluación: EXCELENTE. Bajo acoplamiento y alta cohesión.`);
} else {
  console.log(`   - Evaluación: REGULAR. Los archivos dependen de demasiados módulos externos.`);
}

console.log(`\nMÉTRICA 4: Deuda Técnica Explícita`);
console.log(`   - Etiquetas TODO/FIXME pendientes: ${totalDeudaTecnica}`);
if (totalDeudaTecnica === 0) {
  console.log(`   - Evaluación: ÓPTIMA. No hay deuda técnica explícita registrada.`);
} else {
  console.log(
    `   - Evaluación: ALERTA. Existen tareas sin resolver directamente en el código de producción.`
  );
}

console.log(`\nMÉTRICA 5: Complejidad Estructural (Anidamiento Profundo)`);
console.log(`   - Líneas con más de 6 niveles de indentación: ${lineasProfundas}`);
console.log(`   - Resultado: ${porcentajeAnidamiento}% del código es estructuralmente complejo.`);
if (porcentajeAnidamiento < 10) {
  console.log(`   - Evaluación: EXCELENTE. Estructuras planas, legibles y fáciles de testear.`);
} else {
  console.log(`   - Evaluación: REGULAR. Sugiere extraer sub-componentes para aplanar la lógica.`);
}

console.log('\n==================================================');
