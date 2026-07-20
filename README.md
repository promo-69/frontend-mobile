# Cineflix - Frontend Mobile

App movil de Cineflix desarrollada con Expo SDK 54 y React Native.

## Stack

| Tecnologia | Version |
|-----------|---------|
| Expo SDK | 54 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| Expo Router | 6 (file-based routing) |
| Node.js | v22.22.0 |
| Yarn | 4.13.0 |

## Requisitos previos

- Node.js v22.22.0
- Yarn 4.13.0 (se instala automaticamente via corepack)
- Cuenta de Expo (para EAS builds)

## Inicio rapido

1. Clonar y entrar a la carpeta

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd frontend-mobile
   ```

2. Instalar dependencias

   ```bash
   yarn install
   ```

3. Configurar variables de entorno

   ```bash
   cp .env.example .env
   ```

   Editar `.env` con las URLs del backend (ver [Variables de entorno](#variables-de-entorno)).

4. Levantar el servidor de desarrollo

   ```bash
   yarn start
   ```

   Se abrira el servidor de Metro y mostrara un QR code.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| `EXPO_PUBLIC_DEV_URL` | URL base del backend en desarrollo |
| `EXPO_PUBLIC_PROD_URL` | URL base del backend en produccion |

La app selecciona automaticamente la URL segun el modo:

- `yarn start` usa `EXPO_PUBLIC_DEV_URL` (`__DEV__ = true`)
- EAS build (preview/production) usa `EXPO_PUBLIC_PROD_URL` (`__DEV__ = false`)

Los sockets derivan la URL del mismo `API_URL`, extrayendo solo el host.

## Identidad del dispositivo y cabeceras HTTP

Toda peticion al backend sale con dos cabeceras inyectadas globalmente por el
interceptor de Axios (`src/services/api.js`):

| Cabecera | Valor | Proposito |
|----------|-------|-----------|
| `x-client-channel` | `mobile` | El backend responde con tokens Bearer en el body (nunca cookies). |
| `x-device-id` | nanoid de 21 caracteres | Sesiones Unicas por Dispositivo: el backend asocia los tokens a este id y, al iniciar sesion de nuevo desde el MISMO aparato, revoca la sesion anterior (las de otros dispositivos siguen vivas). |

Reglas del `device_id` (`src/helper/device.helper.js`):

- Se genera UNA sola vez con `nanoid/non-secure` (21 caracteres) y se persiste
  en AsyncStorage bajo la clave `@device_id`.
- Es independiente de la cuenta: NO se borra al cerrar sesion. Por eso su clave
  vive fuera de `STORAGE_KEYS` y no debe agregarse a
  `storageHelper.clearSession()`.
- Solo desaparece si el usuario borra los datos de la app o la desinstala (en
  ese caso se genera uno nuevo en el proximo arranque).
- Se usa la variante `nanoid/non-secure` (JS puro) porque la estandar requiere
  `crypto.getRandomValues`, que en React Native implica un modulo nativo y
  recompilar el dev build. Para un identificador de dispositivo es suficiente.

## Ejecutar la app: Expo Go vs Development Build

`yarn start` levanta el bundler de Metro. Puedes escanear el QR con **Expo Go** o con un **development build** - ambos se conectan al mismo servidor.

### Con Expo Go (rapido, para pruebas basicas)

1. Instalar [Expo Go](https://expo.dev/go) en tu celular
2. Ejecutar `yarn start`
3. Escanear el QR con Expo Go

**Disponible:** Login, navegacion, peliculas, cines, chat del asistente, compras.

**No disponible:** Reconocimiento de voz del asistente (el boton de microfono no se mostrara).

### Con Development Build (recomendado, funcionalidad completa)

1. Tener una cuenta de Expo y estar logueado
2. Instalar EAS CLI: `npm i -g eas-cli`
3. Habilitar corepack: `corepack enable`
4. Generar el build:

   ```bash
   eas build --profile development --platform android
   ```

5. Instalar el `.apk` resultante en tu celular
6. Ejecutar `yarn start`
7. Escanear el QR con la app del development build

**Disponible:** Todo incluyendo reconocimiento de voz.

### Cuando usar cada uno

| Situacion | Usa |
|-----------|-----|
| Probar un feature rapido, login, UI | Expo Go |
| Usar reconocimiento de voz, camara, notificaciones push | Development build |
| Compartir APK con el equipo para testing | `eas build --profile preview` |
| Build para produccion | `eas build --profile production` |

## Estructura del proyecto

```
src/
├── app/                  # Rutas (Expo Router file-based)
│   ├── (main)/           # Tabs: home, concessions, rewards, purchases, profile, cinemas
│   ├── (auth)/           # Login, register, forgot-password
│   ├── (buy)/            # Flujo de compra: tickets, seats, checkout, payment
│   ├── (staff)/          # Scanner de empleados
│   └── content/          # Detalle de peliculas/eventos
├── components/           # Componentes reutilizables
├── screens/              # Pantallas
├── services/             # Servicios API (Axios)
├── context/              # Context providers (Auth, Cart)
├── hooks/                # Custom hooks
├── constants/            # Config, storage keys, headers
├── helper/               # Utilidades (storage, etc.)
├── utils/                # Funciones auxiliares
└── assets/               # Imagenes, fuentes, iconos
```

## Convenciones

### Nombres de archivos

- **Paginas/rutas**: `camelCase` - `homeScreen.jsx`, `loginScreen.jsx`
- **Componentes**: `PascalCase` - `MainCarousel.jsx`, `ChatAssistant.jsx`

### Imports

Rutas relativas. No se usan alias (`@`).

```js
import CustomButton from '../../components/CustomButton';
```

### Alertas

No usar `Alert.alert` de React Native (modal blanco del sistema). Usar el
sistema global con la estetica de la app:

```js
import { appAlert } from '../context/AlertContext';

// Aviso simple (boton "Entendido")
appAlert('Titulo', 'Mensaje');

// Confirmacion (misma firma que Alert.alert; style 'destructive' = alerta roja)
appAlert('Quitar marcador', 'Deseas continuar?', [
  { text: 'Cancelar', style: 'cancel' },
  { text: 'Quitar', style: 'destructive', onPress: () => {} },
]);
```

El `AlertProvider` ya esta montado en `src/app/_layout.jsx`; si no estuviera,
`appAlert` degrada al Alert nativo para no perder el aviso.

## Flujo de trabajo con Git

1. Clonar en la rama `development`

   ```bash
   git checkout development
   ```

2. Crear rama feature

   ```bash
   git checkout -b feature/nombre-del-feature
   ```

3. Hacer push y crear PR contra `development`

## Build con EAS

Perfiles disponibles en `eas.json`:

| Perfil | Comando | Uso |
|--------|---------|-----|
| `development` | `eas build --profile development --platform android` | Development build con dev client |
| `preview` | `eas build --profile preview --platform android` | APK interno para testing |
| `production` | `eas build --profile production --platform android` | Build para produccion |

Requiere estar logueado: `eas login`
