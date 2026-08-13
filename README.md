# BR Events — Progressive Web App (PWA)

**BR Events** es una aplicación web progresiva (PWA) móvil y de escritorio diseñada exclusivamente para coordinar los eventos mensuales, encuestas de fechas, división de gastos en Colones costarricenses (CRC ₡), recuerdos y transporte del grupo de amigas **BR**.

Desarrollado por **[Teji](https://www.tejidev.com/)**.

---

## 🎨 Identidad Visual & Diseño
* **Logotipo:** **BR** (Blanco impoluto / Tipografía bold) + **events** (Degradado continuo `#D81E5B` ➔ `#FF4D7D` ➔ `#FDF0F5` ➔ `#2A9D8F`).
* **Estilo:** Permanent Sleek Dark Mode (`#12111A`), tarjetas con efecto glassmorphism, 100% iconos vectoriales SVG (`lucide-vue-next`), animaciones fluidas con **GSAP** y cero emojis.
* **Layout Responsivo:** Adaptado fluidamente a monitores de escritorio panorámicos y pantallas móviles.
* **Moneda:** Colones Costarricenses (`CRC ₡`).

---

## 🚀 Funcionalidades Principales

1. **Turnero de Meses (2026 / 2027):**
   * Tablero interactivo multiaño que filtra automáticamente los meses transcurridos del año actual.
   * La organizadora define el título, temática e imagen de su reunión al postularse.

2. **Módulo de Encuestas & Votación:**
   * Votación transparente de fechas con cálculo automático y fijación de la fecha ganadora.

3. **Ficha del Evento + Integración:**
   * Enlaces directos a **Waze** y **Google Maps** ("Cómo llegar").
   * Generador de archivo `.ics` y enlace directo a **Google Calendar**.
   * Interruptor de lista de compras (pública o de uso interno para la organizadora).

4. **Control de Gastos Compartidos (Splitwise CRC ₡):**
   * Registro de compras en Colones costarricenses con cálculo automático de deudas mínimas entre integrantes ("Quién le debe a quién").

5. **Coordinación de Transporte & Carpooling:**
   * Asignación de vehículos, choferes, rutas y espacios libres disponibles.

6. **Galería HD & Recuerdos:**
   * Álbum de fotos compartido con visor Lightbox y descarga en alta calidad.

7. **Reseñas & Calificaciones:**
   * Módulo de retroalimentación con valoración de 1 a 5 estrellas y comentarios sobre los eventos realizados.

8. **Autenticación & Perfil Extendido:**
   * Autenticación real de integrantes (sin usuarios quemados por defecto).
   * Perfil con Nombre, Correo, Celular, Talla de Camisa, Edad, Provincia, Cantón y Distrito.

9. **Conexión a Supabase:**
   * Integración lista con Supabase para almacenamiento persistente de datos.

---

## 💻 Instalación y Ejecución Local

Para ejecutar la aplicación localmente:

```bash
# 1. Entrar al directorio del proyecto
cd br_events

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173/**

---

## 🗄️ Base de Datos en Supabase

Copia el contenido del archivo [`supabase_schema.sql`](./supabase_schema.sql) y ejecútalo en el **SQL Editor** de tu proyecto en [Supabase](https://supabase.com/).

Crea un archivo `.env` en la raíz del proyecto `br_events` con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

---

## 🛠️ Tecnologías Utilizadas
* **Frontend:** Vue 3 (Composition API)
* **Animaciones:** GSAP (GreenSock Animation Platform)
* **Build Tool:** Vite
* **PWA:** Vite Plugin PWA (Service Worker instalable)
* **Iconos:** Lucide Icons & Iconos SVG personalizados
* **Base de Datos:** Supabase (PostgreSQL)

---

## 🏷️ Créditos
* **BR Events** — Desarrollado por **[Teji](https://www.tejidev.com/)**.