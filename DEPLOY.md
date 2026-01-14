# Guía de Deploy a Firebase Hosting

## 📋 Pasos para hacer Deploy

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Iniciar Sesión en Firebase

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Google.

### 3. Crear un Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project" o "Crear un proyecto"
3. Ingresa el nombre del proyecto (ej: `only-tips-frontend`)
4. Desactiva Google Analytics si no lo necesitas (o actívalo si lo quieres)
5. Click en "Create project"

### 4. Configurar el Proyecto ID en `.firebaserc`

Edita el archivo `.firebaserc` y reemplaza `your-project-id` con el ID de tu proyecto de Firebase:

```json
{
  "projects": {
    "default": "tu-proyecto-id-aqui"
  }
}
```

**Nota:** El ID del proyecto lo encuentras en Firebase Console > Project Settings > General

### 5. Configurar la URL del Backend en Producción

Edita `src/environments/environment.prod.ts` y reemplaza la URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-url.com' // URL de tu backend en producción
};
```

### 6. Configurar URLs de Éxito de Pago en el Backend

Asegúrate de que en tu backend, las constantes de URLs de éxito apunten a tu dominio de Firebase:

```typescript
// En desarrollo
paymentSuccessUrl: 'http://localhost:8100/payment/success'

// En producción
paymentSuccessUrl: 'https://tu-proyecto-id.web.app/payment/success'
// o
paymentSuccessUrl: 'https://tu-dominio-custom.com/payment/success'
```

### 7. Inicializar Firebase Hosting (si es la primera vez)

```bash
firebase init hosting
```

Cuando te pregunte:
- **¿Qué directorio público usar?** → `www` (presiona Enter)
- **¿Configurar como SPA?** → `Yes` (ya está configurado en firebase.json)
- **¿Configurar GitHub Actions?** → `No` (opcional)

### 8. Construir el Proyecto para Producción

```bash
npm run build:prod
```

Esto generará los archivos optimizados en la carpeta `www/`.

### 9. Hacer Deploy

```bash
firebase deploy --only hosting
```

O usa el script que agregamos:

```bash
npm run deploy
```

### 10. Verificar el Deploy

Después del deploy, Firebase te dará una URL como:
- `https://tu-proyecto-id.web.app`
- `https://tu-proyecto-id.firebaseapp.com`

Visita la URL para verificar que todo funciona correctamente.

---

## 🔧 Configuraciones Adicionales

### Configurar Dominio Personalizado (Opcional)

1. En Firebase Console, ve a **Hosting**
2. Click en **Add custom domain**
3. Ingresa tu dominio
4. Sigue las instrucciones para verificar el dominio
5. Configura los registros DNS según las instrucciones

### Configurar Variables de Entorno

Si necesitas diferentes configuraciones por ambiente, puedes usar:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com',
  firebase: {
    // Configuración de Firebase si la necesitas
  }
};
```

### Scripts Útiles

```bash
# Build para producción
npm run build:prod

# Deploy solo hosting
firebase deploy --only hosting

# Deploy con mensaje
firebase deploy --only hosting --message "Descripción del deploy"

# Ver logs
firebase hosting:channel:list
```

---

## 🚨 Troubleshooting

### Error: "No se encuentra el directorio www"

Asegúrate de haber ejecutado `npm run build:prod` antes del deploy.

### Error: "Firebase project not found"

Verifica que el ID del proyecto en `.firebaserc` sea correcto.

### Error: CORS en producción

Asegúrate de que tu backend tenga configurado CORS para permitir tu dominio de Firebase.

### Las rutas no funcionan (404)

Verifica que `firebase.json` tenga la configuración de rewrites para SPA (ya está incluida).

---

## 📝 Checklist Pre-Deploy

- [ ] Instalar Firebase CLI
- [ ] Iniciar sesión en Firebase
- [ ] Crear proyecto en Firebase Console
- [ ] Configurar `.firebaserc` con el Project ID
- [ ] Actualizar `environment.prod.ts` con URL del backend
- [ ] Actualizar URLs de éxito de pago en el backend
- [ ] Ejecutar `npm run build:prod` exitosamente
- [ ] Probar localmente la build de producción
- [ ] Ejecutar `firebase deploy --only hosting`
- [ ] Verificar que la aplicación funciona en producción

---

## 🔄 Deploy Automático con GitHub Actions (Opcional)

Puedes configurar CI/CD para que se despliegue automáticamente cuando hagas push a la rama main.

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: tu-proyecto-id
```

---

¡Listo! Tu aplicación debería estar desplegada en Firebase Hosting. 🚀

