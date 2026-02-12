# UIDE Student Services Portal - Guía de Producción

## 🏗️ Arquitectura

- **Frontend**: React + Vite + Material-UI desplegado en Nginx
- **Backend**: Fastify + TypeScript + Prisma desplegado en Node.js
- **Base de Datos**: AWS Aurora (MySQL compatible)
- **Containerización**: Docker + Docker Compose
- **Proxy**: Nginx para servir frontend y redirigir API

## 📋 Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+
- Acceso a cluster AWS Aurora
- Dominio configurado (opcional)

## 🔧 Configuración

### 1. Variables de Entorno

Copie y configure el archivo `.env`:

```bash
cp .env.example .env
```

Configure las siguientes variables:

```env
# Base de Datos (AWS Aurora)
DATABASE_URL="mysql://username:password@your-aurora-cluster.cluster-xxxxx.region.rds.amazonaws.com:3306/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Producción
NODE_ENV="production"
PORT=3000
FRONTEND_URL="https://your-domain.com"
```

### 2. Configuración de AWS Aurora

**Endpoint del cluster**: `database-1.cgfqom6awot1.us-east-1.rds.amazonaws.com`

Asegúrese de que su cluster Aurora tenga:

- **Motor**: MySQL 8.0+
- **Región**: us-east-1
- **VPC Security Group**: Permitir conexiones desde el servidor (puerto 3306)
- **Parámetros**: 
  - `max_connections`: 100+
  - `innodb_buffer_pool_size`: 70% de RAM
  - `query_cache_size`: 64MB

**Configuración rápida**:
```bash
# Ejecutar script de configuración
chmod +x setup-aurora.sh
./setup-aurora.sh

# Probar conexión
node test-aurora-connection.js
```

## 🚀 Despliegue

### Opción 1: Script Automático

```bash
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Manual

```bash
# Construir imágenes
docker-compose build --no-cache

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

## 🔍 Verificación

### Health Checks

- **Frontend**: `http://localhost:80`
- **Backend**: `http://localhost:3000/health`
- **Base de Datos**: `http://localhost:3000/health/db`
- **API Docs**: `http://localhost:3000/documentation`

### Logs

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📊 Monitoreo

### Métricas Importantes

- **Uso de CPU**: < 70%
- **Uso de Memoria**: < 80%
- **Conexiones a BD**: < 80% del límite
- **Disco**: < 85%

### Alertas

Configure alertas para:
- Caída de servicios (health check falla)
- Alta utilización de recursos
- Errores de conexión a base de datos

## 🔒 Seguridad

### Configuración de Seguridad

1. **HTTPS**: Configure SSL/TLS en producción
2. **CORS**: Configure orígenes permitidos
3. **Rate Limiting**: Implementado en el backend
4. **JWT**: Tokens con expiración
5. **Passwords**: Encriptados con bcrypt

### Headers de Seguridad

Nginx incluye headers de seguridad:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

## 🔄 Actualizaciones

### Para actualizar la aplicación:

```bash
# Hacer backup de la base de datos
mysqldump -h aurora-cluster... -u user -p database > backup.sql

# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a BD**
   ```bash
   # Verificar URL de conexión
   docker-compose logs backend | grep -i database
   ```

2. **Frontend no carga**
   ```bash
   # Verificar configuración de Nginx
   docker-compose logs frontend
   ```

3. **High Memory Usage**
   ```bash
   # Reiniciar servicios
   docker-compose restart
   ```

### Comandos de Debug

```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Verificar conexión a BD
docker-compose exec backend npm run db:generate

# Probar API
curl http://localhost:3000/health
```

## 📈 Optimización

### Base de Datos

- **Connection Pooling**: Configurado en Prisma (20 conexiones)
- **Query Caching**: Habilitado (1000 queries)
- **Binary Protocol**: Habilitado para mejor rendimiento

### Frontend

- **Gzip Compression**: Habilitado en Nginx
- **Static Caching**: 1 año para assets
- **Code Splitting**: Configurado en Vite

### Backend

- **Compression**: Habilitado en Fastify
- **Rate Limiting**: 100 requests/15min
- **Health Checks**: Automáticos

## 📞 Soporte

Para problemas de producción:

1. Verificar logs: `docker-compose logs -f`
2. Verificar health checks: `curl http://localhost:3000/health`
3. Revisar configuración de AWS Aurora
4. Validar variables de entorno

## 🔄 Backup y Recovery

### Backup Automático

Configure backups automáticos en AWS Aurora:
- **Daily Backups**: Habilitados
- **Point-in-Time Recovery**: 35 días
- **Cross-Region Backup**: Opcional

### Recovery

```bash
# Restaurar desde snapshot
aws rds restore-db-cluster-from-snapshot \
    --db-cluster-identifier uide-portal-restore \
    --snapshot-identifier your-snapshot \
    --engine mysql \
    --region us-east-1
```
