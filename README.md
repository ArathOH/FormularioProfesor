# Sistema de Gestión de Certificados Académicos UABC

Sistema completo para la gestión de certificados de desarrollo profesional docente con reportes estadísticos y panel de administración.

## 🚀 Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS v4
- **Autenticación**: Firebase Auth (email/password + Google Sign-In)
- **Base de datos**: Cloud Firestore
- **Gráficas**: Recharts
- **Almacenamiento**: Base64 en Firestore (sin Storage, límite 0.9MB por archivo)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase con proyecto configurado
- Variables de entorno en `.env` (ver `.env.example`)
- **Correo institucional UABC** (@uabc.edu.mx o @uabc.mx) para registro

## 🔐 Restricciones de Acceso

- **Registro obligatorio**: Solo correos con dominios `@uabc.edu.mx` o `@uabc.mx`
- **Login requerido**: Todas las páginas (excepto login/registro) requieren autenticación
- **Google Sign-In**: También valida dominio institucional UABC

## 🛠️ Instalación

```bash
# Clonar e instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de Firebase

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 🎯 Funcionalidades Principales

### 1. Perfil Profesional (`/profile`)
- Avatar con compresión automática a Base64 (256×256px, ~128KB)
- Campos: nombre, teléfono, biografía, rol (admin/docente/estudiante/invitado)
- Validaciones en tiempo real
- Colores institucionales UABC (verde #007A33, ocre #CC8A00)

### 2. Gestión de Certificados (`/certificates`)
- **Formulario completo** con 13 campos:
  - Título (obligatorio)
  - Tipo (12 categorías predefinidas + "Otro")
  - **Departamento** (10 opciones UABC + "Otro")
  - Descripción, emisor, modalidad
  - Horas, semestre, año, fecha de emisión
  - Archivo PDF/imagen ≤ 0.9MB (Base64)
  
- **Filtros avanzados**: tipo, semestre, año, búsqueda de texto
- **Grid de tarjetas** con preview y acciones
- **Modal de confirmación** para eliminar
- Almacenamiento: `certificates/{uid}/items/{docId}`

### 3. Reportes Estadísticos (`/reports`)
- **KPIs**: Total certificados, # departamentos, rango de años
- **Gráficas interactivas**:
  - Gráfica de barras: Certificados por departamento (Recharts BarChart)
  - Gráfica de pastel: Distribución por tipo (Recharts PieChart)
- **Filtros**: año, semestre, departamento, tipo, búsqueda
- **Tabla paginada** (20 filas por página)
- **Exportación CSV** con BOM para Excel
- Usa `collectionGroup()` para leer certificados de todos los usuarios

### 4. Panel de Administración (`/admin`)
- Acceso exclusivo para usuarios con rol `admin`
- Gestión de usuarios y certificados (en desarrollo)
- Protegido por AuthGate + verificación de rol

## 🔒 Seguridad - Firestore Rules

Las siguientes reglas deben configurarse en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función helper para verificar si el usuario es admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Usuarios: todos pueden leer, pero solo el dueño o admin pueden escribir
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Certificados docentes: propietario puede leer/escribir, admin puede leer/eliminar
    match /certificates/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      match /items/{itemId} {
        allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
        allow write: if request.auth != null && request.auth.uid == userId;
        allow delete: if request.auth != null && (request.auth.uid == userId || isAdmin());
      }
    }
    
    // Certificados legacy (uploads): todos pueden leer, solo el dueño puede escribir
    match /uploads/{userId}/items/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── reports/               # Componentes de reportes
│   │   ├── ReportFilters.tsx  # Filtros (año, semestre, dept, tipo, búsqueda)
│   │   ├── ReportKPIs.tsx     # Tarjetas de KPIs
│   │   ├── DeptBarChart.tsx   # Gráfica de barras (Recharts)
│   │   ├── TypePieChart.tsx   # Gráfica de pastel (Recharts)
│   │   └── ReportTable.tsx    # Tabla paginada
│   ├── AuthGate.tsx           # Protección de rutas
│   ├── NavBar.tsx             # Navegación con links condicionales
│   ├── CertificateForm.tsx    # Formulario de certificados
│   ├── CertificateCard.tsx    # Tarjeta de certificado
│   └── ...
├── contexts/
│   └── AuthContext.tsx        # Context con user + userRole
├── lib/
│   ├── types.ts               # Tipos TypeScript (Certificate, DepartmentType, etc.)
│   ├── role.ts                # Utilidades de roles (isAdmin, canEditUsers, etc.)
│   ├── csv.ts                 # Exportación a CSV
│   ├── file.ts                # Manejo de archivos Base64
│   └── firebase.ts            # Configuración Firebase
├── pages/
│   ├── Home.tsx
│   ├── Profile.tsx
│   ├── Certificates.tsx
│   ├── Reports.tsx            # Página de reportes estadísticos
│   ├── Admin.tsx              # Panel de administración
│   └── ...
└── App.tsx                    # Rutas y layout principal
```

## 🎨 Diseño y UX

- **Colores UABC**: Verde #007A33, Ocre #CC8A00
- **Tema**: Solo modo claro (sin dark mode)
- **Responsive**: Mobile-first con breakpoints Tailwind
- **Accesibilidad**: ARIA labels, navegación por teclado, contraste WCAG AA
- **Animaciones**: Progress bars, transitions suaves

## 🔑 Roles de Usuario

- **admin**: Acceso completo (gestión usuarios, certificados, reportes)
- **docente**: Gestión de sus propios certificados, visualización de reportes
- **estudiante**: Visualización de reportes
- **invitado**: Acceso limitado (rol por defecto)

## 📊 Tipos de Certificados

1. 🎓 Diplomado
2. 📘 Curso de actualización
3. 🧩 Taller didáctico
4. 🔬 Seminario de investigación
5. 🏛️ Congreso/Simposio
6. 🗣️ Ponencia/Cartel
7. 📰 Publicación
8. ✅ Certificación de competencias
9. 💻 Curso en línea (MOOC)
10. 📑 Asesoría/Comité de tesis
11. 🏅 Reconocimiento UABC
12. 📝 Otro (con descripción personalizada)

## 🏛️ Departamentos UABC

1. Ciencias de la Educación
2. Ingeniería
3. Humanidades
4. Ciencias de la Salud
5. Artes
6. Deportes
7. Administración
8. Economía
9. Jurídicas
10. Otro (con descripción personalizada)

## 🚢 Despliegue en Firebase Hosting

```bash
# Build de producción
npm run build

# Instalar Firebase CLI (si no está instalada)
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar hosting (primera vez)
firebase init hosting
# Seleccionar: dist como directorio público, SPA: Sí

# Desplegar
firebase deploy
```

## 📝 Variables de Entorno (.env)

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🐛 Solución de Problemas

### Error: "Missing or insufficient permissions"
- Verificar que las reglas de Firestore estén actualizadas en Firebase Console
- Asegurarse de que el usuario tenga el rol correcto en la colección `users`

### Error: "Document too large"
- Los archivos Base64 deben ser ≤ 0.9MB antes de codificar
- El límite de Firestore es 1MB por documento

### Error: "Port 5173 is in use"
- El servidor automáticamente usará otro puerto (5174, 5175, etc.)
- O detén otros procesos: `npx kill-port 5173`

## 🤝 Contribuciones

Este es un proyecto académico para UABC. Las contribuciones deben seguir:
- Convenciones de código TypeScript/React
- Mantener colores institucionales
- Documentar nuevas funcionalidades

## 📄 Licencia

Proyecto académico - UABC © 2024

---

**Desarrollado con 💚💛 para la Universidad Autónoma de Baja California**
