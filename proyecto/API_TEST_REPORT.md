# API Test Report
**Date:** 18/2/2026, 12:24:57 a. m.
**Summary:** 6/6 User Endpoints Passed

| Method | Endpoint | Status | Duration | Result |
|--------|----------|--------|----------|--------|
| GET | /health | 200 | 41ms | ✅ PASS |
| POST | /auth/login | 200 | 113ms | ✅ PASS |
| GET | /usuarios/me | 200 | 8ms | ✅ PASS |
| GET | /categorias | 200 | 4ms | ✅ PASS |
| GET | /servicios | 200 | 9ms | ✅ PASS |
| GET | /facultades | 200 | 6ms | ✅ PASS |

## Details
### GET /health
- **Status**: 200
- **Data**: ```json
{
  "status": "ok",
  "timestamp": "2026-02-18T05:24:57.612Z",
  "uptime": 30994.0134307,
  "environment": "development"
}
```
### POST /auth/login
- **Status**: 200
- **Data**: ```json
{
  "token": "***",
  "usuario": {
    "id_usuario": 1,
    "email": "admin@uide.edu.ec",
    "nombre": "Administrador",
    "rol": "ADMIN",
    "foto_perfil": "https://ui-avatars.com/api/?name=Admin+Sistema&background=870a42&color=fff",
    "calificacion_promedio": 0,
    "fecha_registro": "2026-02-13T16:39:21.000Z",
    "activo": true
  }
}
```
### GET /usuarios/me
- **Status**: 200
- **Data**: ```json
{
  "id_usuario": 1,
  "email": "admin@uide.edu.ec",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "telefono": null,
  "id_carrera": null,
  "rol": "ADMIN",
  "foto_perfil": "https://ui-avatars.com/api/?name=Admin+Sistema&background=870a42&color=fff",
  "calificacion_promedio": "0",
  "fecha_registro": "2026-02-13T16:39:21.000Z",
  "activo": true,
  "banner": null,
  "bio": "Cuenta administrativa del sistema",
  "career": null,
  "university": null,
  "skills": null,
  "carrera": null,
  "habilidades": []
}
```
### GET /categorias
- **Status**: 200
- **Data**: ```json
"Count: 10"
```
### GET /servicios
- **Status**: 200
- **Data**: ```json
"Count: 7"
```
### GET /facultades
- **Status**: 200
- **Data**: ```json
"Count: 1"
```
