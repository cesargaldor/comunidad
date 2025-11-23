# Comunidad

Sistema de gestión integral para comunidades, diseñado para facilitar la administración de reservas, votaciones y usuarios.

## 🛠️ Tecnologías

Este proyecto utiliza un stack moderno y robusto:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (gestionada con [Prisma ORM](https://www.prisma.io/))
- **Autenticación**: [Better Auth](https://better-auth.com/)
- **Pagos**: [Stripe](https://stripe.com/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [Shadcn UI](https://ui.shadcn.com/)
- **Validación**: Zod
- **Gestión de Estado/Data**: TanStack Query

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v20 o superior recomendado)
- [pnpm](https://pnpm.io/) (Gestor de paquetes)
- Una base de datos PostgreSQL (local o en la nube, ej. Neon, Supabase, Railway)

## ⚙️ Configuración e Instalación

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd comunidad
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente esquema. Necesitarás obtener las API Keys de los servicios respectivos.

```env
# -----------------------------------------------------------------------------
# BASE DE DATOS (Prisma)
# -----------------------------------------------------------------------------
# URL de conexión a tu base de datos PostgreSQL.
DATABASE_URL="postgresql://usuario:password@host:port/db_name?schema=public"

# -----------------------------------------------------------------------------
# AUTENTICACIÓN (Better Auth)
# -----------------------------------------------------------------------------
# URL base de la aplicación (http://localhost:3000 en desarrollo)
BETTER_AUTH_URL="http://localhost:3000"

# Secreto para firmar tokens y sesiones. Puedes generar uno aleatorio.
# Generar con: openssl rand -base64 32
BETTER_AUTH_SECRET="tu_secreto_super_seguro"

# -----------------------------------------------------------------------------
# PROVEEDORES DE OAUTH (Google)
# -----------------------------------------------------------------------------
# Obtén estas credenciales en Google Cloud Console -> APIs & Services -> Credentials
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# -----------------------------------------------------------------------------
# PAGOS (Stripe)
# -----------------------------------------------------------------------------
# Clave secreta de Stripe (Dashboard -> Developers -> API keys)
STRIPE_SECRET_KEY="sk_test_..."

# Secreto del Webhook para verificar eventos de Stripe.
# En local, se obtiene al ejecutar `stripe listen`.
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Configurar la Base de Datos

Ejecuta las migraciones de Prisma para crear las tablas en tu base de datos:

```bash
pnpm prisma migrate dev
```

### 5. Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## 💳 Configuración de Webhooks de Stripe (Local)

Para que la aplicación reciba confirmaciones de pago en entorno local, necesitas reenviar los eventos de Stripe a tu localhost.

1.  Instala la [Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Loguéate con tu cuenta:
    ```bash
    stripe login
    ```
3.  Inicia el reenvío de webhooks:
    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    ```
4.  Copia el `webhook signing secret` (empieza por `whsec_`) que aparece en la terminal y pégalo en tu variable `STRIPE_WEBHOOK_SECRET` en el archivo `.env`.

## 📜 Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo.
- `pnpm build`: Construye la aplicación para producción.
- `pnpm start`: Inicia el servidor de producción (requiere `build` previo).
- `pnpm lint`: Ejecuta el linter (ESLint) para verificar la calidad del código.
- `pnpm prisma studio`: Abre una interfaz web para ver y editar tu base de datos.
