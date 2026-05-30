# 🎟️ Julio Té Monta — Plataforma de Rifas y Sorteos

Plataforma premium para rifas y sorteos dominicana desarrollada en HTML puro, CSS y JavaScript vanilla (sin frameworks, sin dependencias complejas ni backend). Diseñada para un rendimiento excepcional y lista para producción en GitHub Pages o cualquier hosting estático.

## 🚀 Demo

Puedes visualizar la demo abriendo el archivo `index.html` directamente en tu navegador, o desplegándola en GitHub Pages.

## ✨ Características

- **Selección de Boletos Virtualizada**: Soporta rangos extensos de boletos sin degradar el rendimiento gracias a un sistema de scroll virtual optimizado (CSS Grid virtual).
- **Selección Automática y Manual**: El usuario puede elegir sus propios números de la suerte (con límite configurable) o generarlos de forma aleatoria con una vistosa animación interactiva.
- **Formulario de Participación Validado**: Formulario completo que captura Nombre, Teléfono dominicano validado por regex, Email, Dirección, Método de pago y comprobante de transferencia.
- **Modal de Resumen**: Paso previo que muestra un resumen detallado para confirmar la información antes de enviar.
- **Integración con WhatsApp**: Generación automática de plantillas de WhatsApp con los datos formateados para finalizar la compra sin necesidad de base de datos.
- **Boleto Digital Fotorrealista**: Emisión de un comprobante virtual detallado con la información del participante, método de pago, número(s) y código serial único.
- **Descarga de Boleto**: Descarga automática de la imagen del boleto utilizando la librería `html2canvas` integrada localmente.
- **Persistencia**: Registro local en `localStorage` de los boletos reservados para inhabilitarlos si el usuario vuelve a cargar el sitio.

## 📦 Estructura del Proyecto

```plaintext
JulioTeMonta/
├── css/
│   ├── animations.css     # Animaciones del sitio principal
│   ├── components.css     # Estilos de botones, tarjetas, inputs
│   ├── intro.css          # Estilos de la intro cinematográfica
│   ├── main.css           # Estilos generales y variables
│   ├── responsive.css     # Media queries responsivas del landing
│   └── ticket-selector.css # Estilos complementarios para la selección de boletos
├── js/
│   ├── animations.js      # Animaciones de la home
│   ├── app.js             # Lógica complementaria de la aplicación
│   ├── intro.js           # Animación de la llave y entrada cinematográfica
│   ├── main.js            # Lógica principal del Landing Page y Countdown
│   └── ticket.js          # Lógica de respaldo del boleto (referencia)
├── images/                # Assets gráficos, logotipos, imágenes de premios
├── index.html             # Landing page principal
├── Boleto.html            # Interfaz de selección de boletos y formulario de compra
├── .gitignore             # Configuración de exclusiones de Git
└── README.md              # Documentación técnica
```

## ⚙️ Cómo Configurar (Personalización)

Tanto la página principal como el selector de boletos se controlan mediante un bloque de configuración centralizado en el JS.

Para realizar cambios de configuración, edita la constante `CONFIG` en los siguientes archivos:

1. **[Boleto.html](file:///c:/Users/UserGPC/OneDrive/Desktop/DS%20Projects/Websites/JulioTeMonta/Boleto.html)** (al inicio de la etiqueta `<script>`)
2. **[js/main.js](file:///c:/Users/UserGPC/OneDrive/Desktop/DS%20Projects/Websites/JulioTeMonta/js/main.js)** (al inicio del archivo)

```javascript
const CONFIG = {
  boletos: { inicio: 40001, fin: 40999 },       // Rango de números disponibles en el grid
  whatsapp: "18091234567",                     // Número del administrador para recibir pedidos (con código de país sin +)
  nombreRifa: "Julio Té Monta",                // Nombre comercial del sorteo
  precioBoletoPesos: 100,                      // Costo de cada boleto en pesos dominicanos (RD$)
  maxBoletosPerParticipante: 10,               // Cap máximo de boletos que puede elegir un participante
  fechaSorteo: "2025-08-15",                   // Fecha del sorteo en formato YYYY-MM-DD para el countdown
};
```

## 💻 Cómo Usar (Instrucciones para el Cliente)

1. **Entrada al Sitio**: Ingresa a `index.html`. Observa la introducción cinematográfica interactiva y pulsa **ACCEDER AL SITIO**.
2. **Seleccionar Premio**: Haz clic en **PARTICIPAR** o **COMPRAR BOLETO**. Serás redirigido a `Boleto.html`.
3. **Completar Datos**:
   - Rellena tu Nombre, Cédula, WhatsApp y Dirección.
   - Selecciona la cantidad de boletos que deseas.
   - Elige los números de la suerte desde el Grid de Selección Manual o haz clic en **Selección Automática** para generarlos.
4. **Subir Comprobante**: Realiza la transferencia a cualquiera de las cuentas indicadas en el lateral derecho, toma una captura y súbela en la zona de carga de comprobantes.
5. **Enviar y Descargar**:
   - Presiona **ENVIAR POR WHATSAPP**.
   - Revisa tus datos en el **Modal de Resumen**.
   - Haz clic en **CONFIRMAR**. Se abrirá una pestaña de WhatsApp Web o la App con tu mensaje listo para enviar, y en pantalla se presentará el boleto digital fotorrealista para descargar.

## 🌐 Despliegue (GitHub Pages)

El proyecto es 100% estático y se despliega en segundos de forma gratuita:

1. Crea un repositorio en GitHub.
2. Sube todos los archivos de la carpeta del proyecto a la rama `main` o `master`.
3. Dirígete a **Settings** -> **Pages** en tu repositorio de GitHub.
4. En la sección **Build and deployment**, selecciona la rama `main` o `master` y la carpeta `/root` (`/`).
5. Guarda la configuración. En unos instantes obtendrás la URL pública de producción (`https://usuario.github.io/nombre-repositorio/`).
