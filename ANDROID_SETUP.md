# 📱 Guía para Ejecutar en Android Studio

## ✅ Estado del Proyecto

Tu proyecto **está completamente listo** para funcionar en Android. Ya tienes:

- ✅ **Capacitor instalado** (`@capacitor/android` v7.0.1)
- ✅ **Configuración de Capacitor** (`capacitor.config.ts`)
- ✅ **Plugins de Capacitor** instalados (App, Haptics, Keyboard, Status Bar)
- ✅ **Ionic Angular** configurado correctamente
- ✅ **App ID configurado**: `com.onlytips.app`

## 🚀 Pasos para Ejecutar en Android Studio

### Paso 1: Construir la aplicación web

Primero, construye tu aplicación Angular para producción:

```bash
npm run build:prod
```

Esto genera los archivos optimizados en la carpeta `www/`.

### Paso 2: Agregar plataforma Android (Solo la primera vez)

Si aún no has agregado Android, ejecuta:

```bash
npx cap add android
```

Esto creará la carpeta `android/` con el proyecto nativo de Android.

### Paso 3: Sincronizar con Capacitor

Sincroniza el código web con el proyecto Android:

```bash
npm run cap:sync:android
```

O manualmente:

```bash
npx cap sync android
```

**Importante:** Cada vez que hagas cambios en tu código web, ejecuta este comando para sincronizarlos.

### Paso 4: Abrir en Android Studio

Abre el proyecto en Android Studio:

```bash
npm run cap:open:android
```

O manualmente:

```bash
npx cap open android
```

### Paso 5: Ejecutar en Android Studio

1. Espera a que Android Studio termine de sincronizar el proyecto (Gradle Sync)
2. Conecta un dispositivo Android o inicia un emulador
3. Selecciona tu dispositivo/emulador en la barra superior
4. Haz clic en el botón ▶️ "Run" (o presiona `Shift + F10`)

## 📝 Scripts Útiles Agregados

Se han agregado scripts convenientes en `package.json`:

- `npm run cap:android` - Construye, sincroniza y abre Android Studio (todo en uno)
- `npm run cap:sync:android` - Construye y sincroniza con Android
- `npm run cap:open:android` - Solo abre Android Studio

## 🔧 Requisitos Previos

Asegúrate de tener instalado:

- ✅ **Node.js** y npm
- ✅ **Android Studio** (última versión recomendada)
- ✅ **Java JDK 11 o superior**
- ✅ **Android SDK** (se instala con Android Studio)

### Verificar instalación de Android SDK:

1. Abre Android Studio
2. Ve a `Tools` > `SDK Manager`
3. Asegúrate de tener instalado:
   - Android SDK Platform
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

## ⚠️ Problemas Comunes

### Error: "Command not found: npx"

Instala las dependencias del proyecto:

```bash
npm install
```

### Error al sincronizar

Asegúrate de haber construido el proyecto primero:

```bash
npm run build:prod
npx cap sync android
```

### Android Studio no encuentra el proyecto

Verifica que la carpeta `android/` exista. Si no existe, ejecuta:

```bash
npx cap add android
```

### Problemas con Gradle

1. En Android Studio, ve a `File` > `Invalidate Caches / Restart`
2. Selecciona "Invalidate and Restart"
3. Espera a que se reconstruya el proyecto

## 📦 Configuración Actual

- **App ID**: `com.onlytips.app`
- **App Name**: `Only Tips`
- **Capacitor Version**: 7.0.1
- **Web Directory**: `www`

## 🔄 Flujo de Trabajo Recomendado

1. Desarrollo: `npm start` (desarrollo web)
2. Pruebas en Android:
   ```bash
   npm run build:prod
   npm run cap:sync:android
   npm run cap:open:android
   ```
3. O usa el comando todo-en-uno: `npm run cap:android`

## 📚 Recursos

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Documentación de Ionic](https://ionicframework.com/docs)
- [Guía de Capacitor Android](https://capacitorjs.com/docs/android)

---

**¡Tu proyecto está listo para Android! 🎉**
