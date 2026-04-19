# Proyecto: Aplicación Compra tu Hogar (CTH)
**Prácticas de Desarrollo de Software - 1er Cuatrimestre, 2026**

## 1. Introducción
La Cámara Inmobiliaria Argentina ha solicitado el desarrollo de la aplicación web **Compra Tu Hogar (CTH)**. El objetivo es ayudar a clientes e inmobiliarias en el seguimiento de sus compras para maximizar las ventas.

### Aclaraciones importantes:
* Las compras se realizan de a una propiedad por vez.
* Cada propiedad es única.
* Una propiedad puede ser ofrecida por más de una inmobiliaria.

## 2. Perfiles de Usuario
1. **Comprador Habitual:** Consulta propiedades, realiza compras y gestiona sus favoritos.
2. **Inmobiliaria:** Administra su listado de propiedades (ABM) y consulta sus ventas realizadas.
3. **Administrador:** Gestiona usuarios, inmobiliarias y consulta datos globales.

## 3. Requerimientos Funcionales
* Registro de usuarios y autenticación obligatoria.
* Buscador avanzado con filtros.
* Reseñas: Puntaje (0 a 10) y comentarios.
* Reportes Top 5: Compradores, Propiedades y Ventas.

## 4. Requerimientos Técnicos (Backend/Frontend)
* **Backend:** Base de datos, API REST, Autenticación y Autorización por roles.
* **Frontend:** Comunicación vía JSON.

## 5. Requerimientos No Funcionales
* Diagrama de Clases / MER.
* Fixtures y Tests (Unitarios, Integración, Interfaz, Arquitectura).
* CI Pipeline, Docker Compose y Deploy Cloud.
* Documentación de API (Swagger) y monitoreo (logs/métricas).
