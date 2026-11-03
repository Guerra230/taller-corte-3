# Reservas de Canchas — Frontend

Aplicación web desarrollada para consultar canchas deportivas, revisar su disponibilidad, guardar canchas y gestionar el acceso de usuarios mediante autenticación.

## Contenido

1. [Tecnologías utilizadas](#1-tecnologías-utilizadas)
2. [Enlaces del proyecto](#2-enlaces-del-proyecto)
3. [Arquitectura del proyecto](#3-arquitectura-del-proyecto)
4. [Instalación y ejecución](#4-instalación-y-ejecución)
5. [Integración con el Backend](#5-integración-con-el-backend)
6. [Estrategia de paginación](#6-estrategia-de-paginación)
7. [Almacenamiento local](#7-almacenamiento-local)
8. [Documentación de componentes y props](#8-documentación-de-componentes-y-props)
9. [Consideraciones finales](#9-consideraciones-finales)

## 1. Tecnologías utilizadas

- **Next.js 15 (App Router):** framework y sistema de enrutamiento de la aplicación.
- **React 19:** construcción de interfaces mediante componentes.
- **TypeScript 5:** tipado estático.
- **CSS plano:** organizado por capas en `src/styles`, con tokens en variables CSS.
- **Fuentes Barlow y Barlow Condensed:** cargadas mediante `next/font/google`.
- **LocalStorage:** almacenamiento del token JWT y de las canchas guardadas.
- **ESLint 9:** revisión estática del código con `eslint-config-next`.

El proyecto no utiliza librerías externas de estado, formularios, peticiones HTTP ni estilos: todo se implementa con React, `fetch` y CSS.

## 2. Enlaces del proyecto

| Recurso | Enlace |
| --- | --- |
| Diseño en Figma | https://www.figma.com/design/m5uDge2NmyWRNr1ktRSCdO |
| Frontend en Vercel | [REEMPLAZAR POR URL REAL] |
| Backend en producción | [REEMPLAZAR POR URL REAL] |
| Repositorio GitHub | https://github.com/Guerra230/taller-corte-3 |

Si el repositorio es privado, se debe otorgar acceso al profesor antes de la entrega.

## 3. Arquitectura del proyecto

El proyecto utiliza una arquitectura modular que separa las responsabilidades de interfaz, autenticación, funcionalidades, servicios y lógica reutilizable.

```
src/
├── app/                 # Rutas y layouts de Next.js
│   ├── (auth)/          # Grupo de rutas para invitados: /login y /register
│   └── (app)/           # Grupo de rutas privadas: /feed
├── components/
│   ├── ui/              # Componentes reutilizables
│   └── layout/          # Elementos de estructura visual
├── context/             # Contexto global de autenticación
├── features/
│   ├── auth/            # Autenticación y protección de rutas
│   └── courts/          # Funcionalidades de canchas
├── hooks/               # Hooks personalizados
├── lib/                 # Utilidades (JWT, validaciones, paginación, formato)
├── services/            # Comunicación con el backend
├── styles/              # Estilos CSS y variables
└── types/               # Interfaces y tipos TypeScript
```

### 3.1. Organización de estilos

Los estilos están organizados por capas:

| Archivo | Función |
| --- | --- |
| `tokens.css` | Variables CSS de colores, tipografía, espaciado y radio. |
| `base.css` | Estilos generales y configuración base. |
| `components.css` | Estilos de componentes reutilizables. |
| `features.css` | Estilos específicos de las funcionalidades. |
| `globals.css` | Archivo principal que importa las capas en ese orden. Se carga en `src/app/layout.tsx`. |

### 3.2. Autenticación

La autenticación se administra mediante `AuthProvider`, ubicado en `src/context/auth-context.tsx`, que utiliza React Context para compartir el estado de sesión con los componentes de la aplicación. El proveedor envuelve toda la aplicación desde `src/app/layout.tsx`.

El proceso funciona de la siguiente manera:

1. El usuario ingresa sus credenciales en el formulario de inicio de sesión.
2. El frontend envía una solicitud `POST` al endpoint `/auth/login`.
3. El backend valida las credenciales y devuelve un token JWT.
4. El frontend comprueba que el token tenga una estructura JWT válida y lo almacena en LocalStorage.
5. El token se utiliza en las solicitudes protegidas mediante el encabezado `Authorization: Bearer`.
6. El usuario puede acceder a las pantallas privadas mientras su sesión sea válida.

El registro se realiza mediante `/auth/register`. Si el backend devuelve un JWT, la sesión se inicia automáticamente. Si no devuelve un token, el usuario es redirigido a `/login?registered=1`, donde se muestra un mensaje de cuenta creada para que inicie sesión.

**Validaciones de los formularios** (`src/lib/validation.ts`):

| Formulario | Campo | Reglas |
| --- | --- | --- |
| Inicio de sesión | Correo | Obligatorio y con formato de correo válido. |
| Inicio de sesión | Contraseña | Obligatoria. |
| Registro | Nombre | Obligatorio, mínimo 2 caracteres. |
| Registro | Correo | Obligatorio y con formato de correo válido. |
| Registro | Contraseña | Obligatoria, mínimo 8 caracteres. |
| Registro | Repetir contraseña | Obligatoria y debe coincidir con la contraseña. |

**Almacenamiento del JWT:**

| Característica | Descripción |
| --- | --- |
| Tecnología | LocalStorage |
| Clave | `reservas.auth.token` |
| Lectura y escritura | `src/services/token-storage.ts` |
| Comunicación con API | `src/services/http-client.ts` |

Cuando el usuario cierra sesión, el token se elimina. También se elimina cuando expira o cuando el backend responde con un error `401` en una solicitud autenticada.

El frontend decodifica las declaraciones (claims) del JWT en `src/lib/jwt.ts` para obtener información del usuario:

| Dato | Claims que se leen (en orden) |
| --- | --- |
| Identificador | `sub`, `id`, `userId` |
| Nombre | `name`, `nombre`, `username`, `fullName`. Si no existe, se usa la parte del correo antes de `@`. |
| Correo | `email`, `correo` |
| Rol | Primer valor de `roles`, o `role`, `rol` |
| Expiración | `exp` |

> **Importante:** la decodificación del JWT en el frontend permite leer sus datos, pero no verifica criptográficamente su firma. Esa validación corresponde al backend.

El rol del usuario se muestra en el menú de usuario (`UserMenu`), pero actualmente no se utiliza para restringir pantallas ni controlar el acceso según roles.

### 3.3. Autorización y protección de rutas

La protección de navegación se implementa mediante `AuthGate.tsx`, ubicado en `src/features/auth`.

Se utilizan dos componentes:

- **`PrivateGate`:** permite visualizar las pantallas privadas únicamente cuando el usuario está autenticado. Si no existe una sesión válida, redirige a `/login?next=<ruta actual>` para volver a esa ruta después de iniciar sesión. Si la sesión expiró, añade `expired=1` y se muestra un aviso. Si el usuario cerró sesión, redirige a `/login` sin parámetros.
- **`GuestGate`:** permite acceder a las pantallas de inicio de sesión y registro únicamente a usuarios no autenticados. Si ya existe una sesión, redirige a la ruta indicada en `next` o, por defecto, a `/feed`. Solo se aceptan rutas internas en `next`, para evitar redirecciones a sitios externos.

Mientras se resuelve el estado de la sesión, ambos componentes muestran un indicador de carga de pantalla completa.

Las rutas están organizadas mediante grupos de Next.js App Router:

| Ruta | Acceso | Función |
| --- | --- | --- |
| `/` | Todos | Redirige a `/feed`. |
| `/login` | Invitados | Inicio de sesión. |
| `/register` | Invitados | Registro de usuarios. |
| `/feed` | Usuarios autenticados | Listado de canchas. |

**Diferencia entre protección frontend y backend:**

Los componentes `PrivateGate` y `GuestGate` controlan la navegación y la visualización de las pantallas, pero no protegen por sí solos los datos ni los endpoints.

La seguridad real de los recursos protegidos la aplica el `AuthGuard` del backend, que valida el JWT recibido en las solicitudes y determina si el usuario tiene autorización para acceder al recurso solicitado.

Por lo tanto, aunque un usuario intente acceder directamente a un endpoint desde fuera de la interfaz, el backend debe validar su autenticación y permisos antes de entregar información.

### 3.4. Gestión y sincronización del estado de autenticación

El estado global se administra mediante `AuthProvider`, React Context y el hook `useSyncExternalStore`.

El almacenamiento del token funciona como una fuente externa de estado, implementada en `src/services/token-storage.ts`.

**¿Cómo funciona?**

1. `useSyncExternalStore` se suscribe a los cambios del almacenamiento mediante `tokenStorage.subscribe`.
2. Cuando el usuario inicia sesión o cierra sesión en la pestaña actual, `tokenStorage` notifica directamente a sus suscriptores.
3. Cuando el token cambia desde otra pestaña, el navegador genera un evento `storage`, que es escuchado por `tokenStorage`.
4. React recibe la notificación y actualiza el estado del contexto.
5. Los componentes que utilizan `useAuth` reaccionan al cambio y actualizan la navegación según corresponda.

Esto permite mantener sincronizado el estado de autenticación entre diferentes pestañas del mismo navegador.

**Estados de autenticación:**

| Estado | Descripción |
| --- | --- |
| `resolving` | La aplicación está comprobando si existe una sesión guardada. |
| `authenticated` | Existe un JWT válido y el usuario tiene una sesión activa. |
| `anonymous` | No existe una sesión válida o el token expiró. |

También se controla la expiración del JWT mediante su fecha de vencimiento (`exp`). Al cargar la aplicación se descarta un token ya vencido, y mientras la sesión está activa un temporizador cierra la sesión en el momento exacto en que el token expira. En ambos casos el token se elimina del almacenamiento y el estado pasa a `anonymous`.

### 3.5. AppShell

`AppShell.tsx` organiza la estructura principal de las pantallas privadas.

Incluye:

- Barra superior de navegación (`Navbar`).
- Nombre de la aplicación.
- Menú de usuario (`UserMenu`).
- Información del usuario autenticado.
- Rol del usuario, cuando está disponible.
- Acción para cerrar sesión.

## 4. Instalación y ejecución

### 4.1. Requisitos

- Node.js 20 o superior.
- npm.
- Acceso al backend de la aplicación.

### 4.2. Clonar el repositorio

```bash
git clone https://github.com/Guerra230/taller-corte-3.git
```

Ingresar a la carpeta:

```bash
cd taller-corte-3
```

Instalar las dependencias:

```bash
npm install
```

### 4.3. Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto. Se puede partir del archivo de ejemplo incluido:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Valor local |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base del backend al que se conecta el frontend. | `http://localhost:3000` |

Contenido del archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Si la variable no está definida, se usa `http://localhost:3000`. Las barras `/` finales de la URL se eliminan automáticamente.

Para producción, esta variable debe configurarse en Vercel con la URL real del backend desplegado. Como es una variable `NEXT_PUBLIC_`, su valor se incorpora al compilar: después de cambiarla se debe volver a desplegar.

### 4.4. Ejecutar el proyecto

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:3001
```

El puerto `3001` está configurado directamente en los scripts `dev` y `start` de `package.json`, para no chocar con el backend en el puerto `3000`.

### 4.5. Otros comandos

```bash
npm run build      # Compilar para producción
npm run start      # Ejecutar la versión compilada (puerto 3001)
npm run lint       # Revisar el código con ESLint
npm run typecheck  # Verificar los tipos de TypeScript
```

> `next.config.ts` desactiva ESLint durante `npm run build`, por lo que se recomienda ejecutar `npm run lint` y `npm run typecheck` antes de desplegar.

## 5. Integración con el Backend

La comunicación con el backend está centralizada en `src/services`.

| Archivo | Función |
| --- | --- |
| `endpoints.ts` | Rutas del backend. |
| `http-client.ts` | Cliente HTTP basado en `fetch`: encabezados, tiempo límite, reintentos y errores. |
| `api.ts` | Instancia del cliente configurada con la URL base y el token. |
| `auth.service.ts` | Inicio de sesión y registro. |
| `courts.service.ts` | Consulta del feed de canchas. |
| `page-normalizer.ts` | Adapta la respuesta paginada del backend al formato `Page`. |
| `api-error.ts` | Errores tipados y mensajes para el usuario. |
| `token-storage.ts` | Lectura, escritura y suscripción al token en LocalStorage. |

El frontend tiene configuradas las siguientes rutas:

| Funcionalidad | Método HTTP | Endpoint | Cuerpo |
| --- | --- | --- | --- |
| Inicio de sesión | `POST` | `/auth/login` | `{ email, password }` |
| Registro de usuarios | `POST` | `/auth/register` | `{ name, email, password }` |
| Feed de canchas | `GET` | `/courts` | — |

Estas rutas corresponden a las definidas en `src/services/endpoints.ts`. Deben coincidir con las rutas expuestas por el backend.

El feed utiliza parámetros de consulta para recuperar las canchas de forma paginada.

Ejemplo:

```http
GET /courts?page=1&limit=9
```

Las solicitudes autenticadas incluyen el JWT en el encabezado:

```http
Authorization: Bearer TOKEN_JWT
```

### 5.1. Formato de las respuestas

El frontend acepta varios nombres de campo para adaptarse al backend:

| Respuesta | Formatos aceptados |
| --- | --- |
| Token (login y registro) | `access_token`, `accessToken`, `token` o `jwt`, en la raíz o dentro de `data`. |
| Lista paginada | Un objeto con los elementos en `items`, `data`, `results`, `content` o `rows`, y los datos de paginación en la raíz o en `meta`. También se acepta un arreglo simple; en ese caso el frontend pagina localmente. |
| Total de registros | `total`, `totalItems`, `count`, `totalElements` |
| Total de páginas | `totalPages`, `lastPage`, `pageCount`. Si no existe, se calcula con el total y el límite. |
| Cancha | `id` es obligatorio. El tipo de cancha se deduce de `type`, `tipo`, `sport`, `deporte`, `kind` o del nombre. Los demás campos también aceptan nombres en español, como `nombre`, `ubicacion`, `precio` o `capacidad`. |

Si la respuesta no tiene un formato reconocible, se muestra el mensaje "El servidor respondió con un formato inesperado."

### 5.2. Manejo de errores

`http-client.ts` convierte cada fallo en un `ApiError` con un mensaje en español para el usuario:

| Situación | Código | Comportamiento |
| --- | --- | --- |
| Sin conexión | `network` | Se reintenta en solicitudes `GET`. |
| Sin respuesta en 20 segundos | `timeout` | Se reintenta en solicitudes `GET`. |
| `400` / `422` | `bad-request` | Se muestra el mensaje del backend si lo envía. |
| `401` | `unauthorized` | Se elimina el token y se redirige al inicio de sesión. En el login se muestra "El correo o la contraseña no coinciden." |
| `403` | `forbidden` | Sin permiso para la acción. |
| `404` | `not-found` | Recurso no encontrado. |
| `409` | `conflict` | En el registro se muestra "Ya existe una cuenta con ese correo." |
| `429` | `rate-limited` | Demasiados intentos. |
| `5xx` | `server` | Se reintenta en solicitudes `GET`. |

Las solicitudes `GET` se reintentan hasta 2 veces ante errores de red, tiempo límite o servidor, con esperas de 300 ms y 600 ms. Las solicitudes `POST` no se reintentan para no duplicar registros.

### 5.3. Configuración CORS

El backend debe permitir mediante CORS las solicitudes provenientes del dominio del frontend desplegado en Vercel.

Se deben permitir como mínimo:

- El origen local de desarrollo: `http://localhost:3001`.
- El dominio real de producción de Vercel.
- Los métodos HTTP utilizados por la aplicación: `GET`, `POST` y `OPTIONS` (petición previa del navegador).
- Los encabezados `Authorization` y `Content-Type`.

Los orígenes deben configurarse explícitamente en el backend. No se debe utilizar `*` como sustituto de una configuración segura cuando se utilizan credenciales.

## 6. Estrategia de paginación

El feed de canchas utiliza una paginación basada en páginas numeradas.

Su funcionamiento se implementa mediante `usePaginatedResource.ts` y `CourtFeed.tsx`.

Características principales:

- **page:** indica el número de página que se solicita.
- **limit:** determina la cantidad de registros por página. La aplicación utiliza 9 canchas.
- **URL:** la página actual se conserva mediante el parámetro `?page=`. Si el valor no es un entero positivo, se usa la página 1. Si supera el total de páginas, se redirige a la última.
- **Caché:** cada página se almacena en memoria utilizando una clave formada por `page` y `limit`.
- **Navegación:** el componente `Pagination` permite avanzar y retroceder entre páginas. Con muchas páginas muestra la primera, la última, las cercanas a la actual y puntos suspensivos (`src/lib/pagination.ts`).
- **Actualización:** al ejecutar `reload`, se limpia la caché y se solicita nuevamente la información.
- **Cancelación:** se utiliza `AbortController` para cancelar solicitudes cuando cambia la página o se desmonta el componente.
- **Estados de carga:** en la primera carga se muestran tarjetas `Skeleton`. Al cambiar de página se mantienen las canchas anteriores atenuadas hasta recibir las nuevas.

Ejemplo de navegación:

```
/feed?page=1
/feed?page=2
/feed?page=3
```

Esta estrategia permite conservar la página seleccionada en la URL, compartir enlaces y evitar solicitudes repetidas cuando se vuelve a consultar una página almacenada en caché.

## 7. Almacenamiento local

La aplicación utiliza LocalStorage para conservar información entre sesiones del navegador.

| Información | Clave | Formato | Función |
| --- | --- | --- | --- |
| Token JWT | `reservas.auth.token` | Texto | Mantiene la sesión autenticada. |
| Canchas guardadas | `reservas.saved-courts` | Arreglo JSON de identificadores | Conserva los identificadores de las canchas guardadas. |

Las canchas guardadas se gestionan mediante `useSavedCourts.ts`, mientras que el token se administra mediante `token-storage.ts`. Si LocalStorage no está disponible (por ejemplo, en navegación privada con almacenamiento bloqueado), la aplicación sigue funcionando sin conservar estos datos.

El historial de actividad reciente se mantiene en el estado del componente y conserva las últimas seis actividades durante la sesión actual. No se guarda en LocalStorage, por lo que se reinicia al recargar la página.

## 8. Documentación de componentes y props

Los componentes están desarrollados en TypeScript. Las props permiten configurar su contenido, apariencia y comportamiento.

Las props obligatorias deben enviarse siempre, mientras que las opcionales pueden omitirse. `ReactNode` permite enviar texto, elementos JSX u otros componentes.

### 8.1. Componentes UI (`src/components/ui`)

#### Button

Botón reutilizable con diferentes estilos y tamaños. También acepta las propiedades nativas de HTML `button`.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "outline"` | No | Estilo visual. Por defecto: `"primary"`. |
| `size` | `"sm" \| "md" \| "lg"` | No | Tamaño del botón. Por defecto: `"md"`. |
| `isLoading` | `boolean` | No | Muestra el indicador de carga y deshabilita el botón. Por defecto: `false`. |
| `fullWidth` | `boolean` | No | Ocupa todo el ancho disponible. Por defecto: `false`. |
| `leadingIcon` | `ReactNode` | No | Elemento antes del texto. |
| `children` | `ReactNode` | No | Contenido del botón. |
| `className` | `string` | No | Clase CSS adicional. |
| `disabled` | `boolean` | No | Deshabilita la interacción. |
| `type` | `"button" \| "submit" \| "reset"` | No | Tipo HTML del botón. Por defecto: `"button"`. |
| Otras props | `ButtonHTMLAttributes<HTMLButtonElement>` | No | Atributos y eventos nativos. |

```tsx
<Button variant="outline" size="sm" onClick={reload}>
  Reintentar
</Button>
```

#### Card

Contenedor visual semántico basado en `article`.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | Contenido de la tarjeta. |
| `className` | `string` | No | Clases CSS adicionales. |
| Otras props | `HTMLAttributes<HTMLElement>` | No | Atributos y eventos HTML. |

#### CardHeader

Encabezado de una tarjeta.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | Sí | Título principal. |
| `subtitle` | `string \| null` | No | Texto secundario. |
| `aside` | `ReactNode` | No | Contenido adicional alineado a la derecha. |

#### CardBody

Contenedor del contenido interno de una tarjeta.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | Contenido interno. |
| `className` | `string` | No | Clases CSS adicionales. |
| Otras props | `HTMLAttributes<HTMLDivElement>` | No | Atributos y eventos HTML. |

```tsx
<Card>
  <CardHeader title="Cancha 1" subtitle="Sede norte" aside={<Badge tone="pitch">Fútbol</Badge>} />
  <CardBody>Contenido</CardBody>
</Card>
```

#### Badge

Insignia visual para representar estados o categorías.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `tone` | `"neutral" \| "success" \| "danger" \| "pitch" \| "hardwood"` | No | Variante visual. Por defecto: `"neutral"`. |
| `children` | `ReactNode` | Sí | Texto o contenido de la insignia. |

#### Alert

Componente para mostrar mensajes de error o éxito.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `tone` | `"danger" \| "success"` | Sí | Tipo de alerta. |
| `children` | `ReactNode` | Sí | Mensaje principal. |
| `action` | `ReactNode` | No | Acción adicional. |

#### Avatar

Representa visualmente a un usuario mediante sus iniciales.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `name` | `string` | Sí | Nombre del usuario. |
| `size` | `"sm" \| "md"` | No | Tamaño del avatar. Por defecto: `"md"`. |
| `className` | `string` | No | Clase CSS adicional. |

#### EmptyState

Se muestra cuando no existen elementos para presentar.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | Sí | Título del estado vacío. |
| `description` | `string` | Sí | Descripción de la situación. |
| `action` | `ReactNode` | No | Acción opcional. |

#### InputText

Campo de texto reutilizable con etiqueta y validación.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `label` | `string` | Sí | Etiqueta del campo. |
| `error` | `string` | No | Mensaje de error. |
| `hint` | `string` | No | Texto de ayuda. |
| `trailing` | `ReactNode` | No | Elemento al final del campo. |
| `id` | `string` | No | Identificador HTML. |
| `className` | `string` | No | Clase CSS adicional. |
| Otras props | `InputHTMLAttributes<HTMLInputElement>` | No | Propiedades nativas como `value`, `onChange`, `placeholder` y `required`. |

```tsx
<InputText label="Correo" type="email" autoComplete="email" {...field("email")} />
```

#### InputPassword

Campo de contraseña con opción para mostrar u ocultar su contenido. Hereda las propiedades de `InputText`, excepto `type` y `trailing`, que administra internamente.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `label` | `string` | Sí | Etiqueta del campo. |
| `error` | `string` | No | Mensaje de error. |
| `hint` | `string` | No | Texto de ayuda. |
| `id` | `string` | No | Identificador HTML. |
| `className` | `string` | No | Clase CSS adicional. |
| Otras props | `Omit<InputTextProps, "type" \| "trailing">` | No | Propiedades compatibles heredadas de `InputText`. |

#### ListItem

Elemento reutilizable para presentar información en listas.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | Sí | Texto principal. |
| `meta` | `string` | No | Información secundaria. |
| `leading` | `ReactNode` | No | Elemento al inicio. |
| `trailing` | `ReactNode` | No | Elemento al final. |

#### Modal

Ventana emergente controlada mediante propiedades.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | Sí | Controla su visibilidad. |
| `title` | `string` | Sí | Título del modal. |
| `onClose` | `() => void` | Sí | Función para cerrar. |
| `children` | `ReactNode` | Sí | Contenido principal. |
| `footer` | `ReactNode` | No | Contenido del pie. |

```tsx
<Modal isOpen={isOpen} title="Detalle" onClose={() => setOpen(false)} footer={<Button>Guardar</Button>}>
  Contenido del modal
</Modal>
```

#### Pagination

Control de navegación entre páginas.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `page` | `number` | Sí | Página actual. |
| `totalPages` | `number` | Sí | Total de páginas. |
| `onPageChange` | `(page: number) => void` | Sí | Función ejecutada al cambiar de página. |
| `isBusy` | `boolean` | No | Deshabilita los controles durante la carga. Por defecto: `false`. |

#### Skeleton

Representación visual del contenido mientras se carga.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `className` | `string` | No | Clase CSS adicional. |

#### Spinner

Indicador visual de carga.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `label` | `string` | No | Texto accesible. Por defecto: `"Cargando"`. |
| `className` | `string` | No | Clase CSS adicional. |

### 8.2. Componentes de Layout (`src/components/layout`)

#### Navbar

Barra superior de navegación.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | Sí | Logotipo o nombre de la aplicación. |
| `children` | `ReactNode` | No | Contenido adicional de navegación. |

#### Sidebar

Barra lateral para organizar secciones.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `label` | `string` | Sí | Nombre accesible de la barra lateral. |
| `children` | `ReactNode` | Sí | Contenido de la barra. |

#### SidebarSection

Sección interna de la barra lateral.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | Sí | Título de la sección. |
| `children` | `ReactNode` | Sí | Elementos de la sección. |

#### UserMenu

Menú desplegable con información y acciones del usuario. Se cierra al hacer clic fuera o al presionar Escape (`useDismissable`).

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `name` | `string` | Sí | Nombre del usuario. |
| `email` | `string \| null` | No | Correo electrónico. |
| `role` | `string \| null` | No | Rol mostrado en el menú. |
| `onLogout` | `() => void` | Sí | Función para cerrar sesión. |

### 8.3. Componentes de funcionalidades (`src/features`)

#### Canchas (`src/features/courts`)

##### CourtLines

Representación gráfica de una cancha mediante SVG.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `kind` | `"soccer" \| "basketball" \| "other"` | Sí | Tipo de cancha que determina el dibujo. |
| `className` | `string` | No | Clase CSS adicional. |

##### AvailabilityBadge

Insignia que representa el estado de disponibilidad.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `isAvailable` | `boolean \| null` | Sí | Indica si está disponible, no disponible o si se desconoce el estado. |

##### CourtCard

Tarjeta que presenta la información de una cancha.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `court` | `Court` | Sí | Información de la cancha. |
| `isSaved` | `boolean` | Sí | Indica si está guardada. |
| `onOpen` | `(court: Court) => void` | Sí | Función para abrir los detalles. |
| `onToggleSaved` | `(court: Court) => void` | Sí | Función para guardar o quitar de guardadas. |

##### CourtDetailModal

Ventana con información ampliada de una cancha. Se muestra cuando `court` no es `null`.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `court` | `Court \| null` | Sí | Cancha seleccionada. |
| `isSaved` | `boolean` | Sí | Estado de guardada. |
| `onClose` | `() => void` | Sí | Función para cerrar. |
| `onToggleSaved` | `(court: Court) => void` | Sí | Función para cambiar el estado de guardada. |

##### CourtFeed

Componente principal del feed de canchas. No recibe props públicas. Gestiona la paginación, las canchas guardadas, la actividad reciente y la visualización de detalles. Muestra un `EmptyState` cuando no hay canchas y un `Alert` con botón "Reintentar" cuando falla la carga.

#### Autenticación (`src/features/auth`)

##### AuthShell

Contenedor visual para las pantallas de autenticación.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Sí | Contenido de autenticación. |

##### AppShell

Estructura principal de las pantallas privadas.

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Sí | Contenido de la aplicación. |

##### PrivateGate y GuestGate

Componentes de protección y control de navegación (ver [3.3](#33-autorización-y-protección-de-rutas)).

| Prop | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Sí | Contenido que se muestra según el estado de autenticación. |

##### LoginForm y RegisterForm

Formularios de inicio de sesión y registro. No reciben props públicas. Gestionan sus valores, validaciones y envío mediante `useForm` y `useAuth`.

### 8.4. Hooks personalizados (`src/hooks`)

| Hook | Parámetros | Retorna | Función |
| --- | --- | --- | --- |
| `useAuth()` | Ninguno | `{ status, user, login, register, logout }` | Obtiene el estado del usuario y las funciones de autenticación. Debe usarse dentro de `AuthProvider`. |
| `useSavedCourts()` | Ninguno | `{ saved, toggle }` | Gestiona las canchas guardadas mediante LocalStorage. |
| `useActivityLog()` | Ninguno | `{ entries, record }` | Registra las últimas seis actividades de la sesión. |
| `useDismissable(isActive, onDismiss)` | `boolean`, callback | `ref` del contenedor | Detecta clics externos y pulsaciones de Escape. |
| `usePaginatedResource(fetcher, request)` | `PageFetcher`, `PageRequest` | `{ data, error, isFetching, reload }` | Gestiona solicitudes paginadas, estados de carga, errores y caché. |
| `useForm(schema, initialValues, onValid)` | Esquema, valores iniciales y callback asíncrono | `{ field, handleSubmit, isSubmitting, formError }` | Gestiona formularios, validaciones y envío. `field(nombre)` devuelve las props listas para un `InputText`. |

### 8.5. Interfaces y tipos de TypeScript (`src/types`)

#### Court (`court.ts`)

Representa una cancha deportiva.

```ts
type CourtKind = "soccer" | "basketball" | "other";

interface Court {
  id: string;
  name: string;
  kind: CourtKind;
  location: string | null;
  description: string | null;
  pricePerHour: number | null;
  capacity: number | null;
  isAvailable: boolean | null;
}

interface ActivityEntry {
  id: string;
  message: string;
  at: number; // marca de tiempo en milisegundos
}
```

#### Paginación (`api.ts`)

```ts
interface PageRequest {
  page: number;
  limit: number;
}

interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Page<TItem> {
  items: TItem[];
  meta: PageMeta;
}
```

#### Autenticación (`auth.ts`)

```ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginCredentials {
  name: string;
}

interface SessionUser {
  id: string | null;
  name: string;
  email: string | null;
  role: string | null;
}

type AuthStatus = "resolving" | "authenticated" | "anonymous";

type RegisterOutcome = "signed-in" | "needs-login";
```

## 9. Consideraciones finales

- Los componentes UI están diseñados para reutilizarse en diferentes pantallas.
- La autenticación se administra mediante `AuthProvider`, React Context y `useSyncExternalStore`.
- El JWT se almacena en LocalStorage y se utiliza para las solicitudes protegidas.
- Los cambios del token se sincronizan entre pestañas mediante el evento `storage`.
- Las rutas privadas requieren una sesión autenticada.
- La autorización real de los recursos corresponde al `AuthGuard` del backend.
- El rol se muestra en el menú del usuario, pero no restringe pantallas.
- Las canchas guardadas se conservan en el navegador.
- La comunicación con el backend está centralizada en los servicios.
- La paginación utiliza parámetros de URL y caché por página.
- Las props permiten mantener los componentes configurables y desacoplados.

### Limitaciones conocidas

- Guardar el JWT en LocalStorage lo deja expuesto si la página sufre un ataque XSS. Una alternativa más segura sería una cookie `HttpOnly` emitida por el backend.
- Las canchas guardadas y la actividad reciente se guardan solo en el navegador: no se sincronizan entre dispositivos.
- La caché de páginas vive en memoria y se pierde al recargar la página.
