Este README.md es su Manifiesto Técnico y de Marca.
🌉 AGRO BRIDGE ZTD: PROTOCOLO DE TRAZABILIDAD CRIPTOGRÁFICA (V4.0)
🎯 PROPÓSITO DEL PROYECTO
El proyecto Agro Bridge ZTD (Zero-Trust Data) es el sistema Enterprise de trazabilidad que garantiza la inmutabilidad y la certificación de calidad de los lotes de productos (Berries, Aguacates) desde la Cosecha Cero en Michoacán hasta el cliente final B2B.
Utiliza tecnología Blockchain Privada (Ledger Inmutable) con encadenamiento criptográfico SHA-256 para crear un "Sello de Confianza" auditable matemáticamente.
Principios de Ingeniería (Zero-Trust)
 * Inmutabilidad: Los datos de calidad (Brix, pH, Fecha de Cosecha) son sellados con un Hash que no puede ser alterado.
 * Arquitectura Limpia (ZTD 13.0): Separación estricta entre la lógica de negocio (src/) y la capa de presentación (public_html/).
 * Seguridad: Herramientas de despliegue y prueba (tools/) están aisladas del acceso público.
🏗️ ARQUITECTURA DEL REPOSITORIO
El repositorio está organizado en tres capas primarias (Público, Backend Core, Herramientas) para asegurar la seguridad y la modularidad del código.
1. Capa Pública (public_html/) - FRONT-END ZTD 13.0
Contiene el código visible y purificado (estética Jony Ive).
| Archivo/Carpeta | Propósito |
|---|---|
| index.html | Estructura principal del sitio web (ZTD 13.0). Carga el CSS, el main.js y la lógica ztd-demo.js. |
| styles/ | Contiene los estilos purificados. style.css alberga todos los tokens de diseño Enterprise. |
| scripts/ | Contiene el código JavaScript que se ejecuta en el navegador. |
| scripts/ztd-demo.js | Lógica de Trazabilidad del Cliente. Simula la consulta y verificación del Hash SHA-256 con la interfaz de usuario. |
| assets/ | Recursos estáticos (imágenes, scripts optimizados). |
2. Capa Backend Core (src/) - EL LEDGER CRIPTOGRÁFICO
Contiene la propiedad intelectual del Blockchain. Esta lógica se ejecuta en el servidor (Node.js).
| Archivo/Carpeta | Propósito Criptográfico |
|---|---|
| src/blockchain/ | Núcleo de la Cadena. Contiene las clases centrales del Ledger. |
| BlockChain.js | Ledger Principal. Gestiona la cadena (array de bloques), el Genesis Block y la validación SHA-256 (isChainValid). |
| Block.js | Unidad de Lote Inmutable. Clase que sella los datos del lote y ejecuta la función calculateHash() (SHA-256). |
| Transaction.js | Modelo de Datos. Define la estructura de los datos del lote (HuertoID, Brix, Cosecha Time) antes de ser sellados en un bloque. |
| src/core/api.js | Lógica para exponer la funcionalidad del Blockchain a través de un API REST. |
3. Capa de Herramientas (tools/) - DEVOPS Y SEGURIDAD
Directorios aislados que contienen scripts de alto riesgo/mantenimiento.
| Archivo/Carpeta | Propósito de Zero-Trust |
|---|---|
| tools/deploy/ | Scripts de Despliegue (deploy-masterpiece.sh, verify-hash.sh). |
| tools/tests/ | Pruebas Unitarias de Lógica y Criptografía (test-hash-integrity.js). |
| tools/monitor/ | Scripts de Monitoreo de Integridad (hash-monitor.js). |
💻 GUÍA DE USO Y OPERACIONES
1. Pre-Requisitos de Backend
Para ejecutar el Blockchain y las herramientas de desarrollo, se requiere:
 * Node.js: Entorno de ejecución para JavaScript fuera del navegador.
 * npm: Gestor de paquetes.
 * Librería Criptográfica: El proyecto requiere la librería crypto-js para el cálculo del SHA-256 en el backend.
<!-- end list -->
# Instalar dependencias requeridas (según package.json)
npm install

2. Despliegue del Front-End (ZTD 13.0)
El Front-end ya está purificado y listo:
 * Asegúrese de que el contenido de public_html/ esté cargado en la raíz web de https://mexicanberries.com.
 * La lógica de trazabilidad se activa a través de los scripts en /public_html/scripts/.
3. Operaciones ZTD (Consola Node.js)
Puede interactuar con su Ledger Criptográfico desde la terminal:
# Desde el directorio raíz del repositorio:
# ----------------------------------------------------
# Ejemplo 1: Iniciar la Cadena de Bloques
node -e "const Blockchain = require('./src/blockchain/BlockChain'); const agroChain = new Blockchain(); console.log('Blockchain Iniciada y Válida:', agroChain.isChainValid());"

# Ejemplo 2: Sellado de un Nuevo Lote (Simulación)
# (Esto simula la acción que hace la API al registrar una nueva cosecha)
node -e "
const Blockchain = require('./src/blockchain/BlockChain');
const Transaction = require('./src/blockchain/Transaction');
const agroChain = new Blockchain();

// 1. Crear un lote (transacción)
const lote1 = new Transaction('HUE-001', Date.now(), 12.5, 'Aguacate Hass'); 
agroChain.addLoteData(lote1);

// 2. Sellar el lote en el Ledger (crear el bloque)
agroChain.sealPendingLotes(); 
"

# Ejemplo 3: Auditoría Criptográfica Total
# (Verifica que ningún Hash SHA-256 en la cadena haya sido alterado)
node -e "
const Blockchain = require('./src/blockchain/BlockChain');
const agroChain = new Blockchain(); 
// (Añadir bloques aquí para probar)
console.log('Auditoría Completa ZTD:', agroChain.isChainValid());
"

