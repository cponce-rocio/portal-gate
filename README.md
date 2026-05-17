# 🚢 PortGate — Sistema de Control Logístico

Sistema completo de gestión de facturación y gates para operaciones portuarias.

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar (frontend + backend simultáneamente)
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## 👤 Usuarios de acceso

| Usuario      | Contraseña | Rol         |
|-------------|------------|-------------|
| facturacion | 1234       | Facturación |
| gaters      | 1234       | Gaters      |
| pregate     | 1234       | PreGate     |

## 📋 Funcionalidades por Rol

### Facturación
- Crear/Editar/Eliminar registros de facturación
- Campos: Cliente, Factura, Booking, Contenedor, Naviera, Cantidad, Importe, Estado de pago, Observación
- Búsqueda y filtros por estado
- **Exportar a Excel**

### Gaters
- Crear/Editar/Eliminar registros de gates
- Campos: Contenedor, Naviera, Booking, Autorización de línea
- Búsqueda y filtros
- **Exportar a Excel**

### PreGate (Solo Lectura)
- Vista automática cruzando datos de Facturación y Gaters
- Verificación visual de OK Pago + OK Autorización
- Actualización automática cada 30 segundos
- Filtros: Todos / Habilitados / Solo pago OK / Solo auth OK / Incompletos

## 🏗️ Arquitectura

```
portgate/
├── server/
│   └── index.js          # Express API + SQLite + JWT
├── src/
│   ├── assets/           # Imagen de fondo
│   ├── components/
│   │   ├── layout/       # DashboardLayout, Sidebar, Navbar
│   │   └── shared/       # Loader, Modal, Badge, StatCard
│   ├── pages/            # LoginPage, FacturacionPage, GatersPage, PregatePage
│   ├── services/         # Axios API client
│   ├── store/            # Zustand auth store
│   └── App.jsx           # Router + protección de rutas
```

## 🗄️ Base de datos

SQLite (`server/portgate.db`) — se crea automáticamente al iniciar el servidor.
