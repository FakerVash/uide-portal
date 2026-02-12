#!/bin/bash

# Script de despliegue para producción - UIDE Student Services Portal
# Este script configura y despliega la aplicación en Docker con AWS Aurora

set -e

echo "🚀 Iniciando despliegue de UIDE Student Services Portal..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instale Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instale Docker Compose primero."
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Creando desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Por favor, configure las variables de entorno en el archivo .env antes de continuar."
        echo "   - DATABASE_URL: URL de conexión a AWS Aurora"
        echo "   - JWT_SECRET: Secreto para JWT"
        echo "   - EMAIL_*: Configuración de email"
        exit 1
    else
        echo "❌ Archivo .env.example no encontrado."
        exit 1
    fi
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p proyecto/uploads
mkdir -p logs

# Construir y levantar servicios
echo "🔨 Construyendo imágenes Docker..."
docker-compose build --no-cache

echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Verificar health checks
echo "🏥 Verificando health checks..."

# Backend health check
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend está saludable"
else
    echo "❌ Backend no está respondiendo"
fi

# Frontend health check
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend está saludable"
else
    echo "❌ Frontend no está respondiendo"
fi

# Verificar conexión a base de datos
if curl -f http://localhost:3000/health/db > /dev/null 2>&1; then
    echo "✅ Base de datos conectada"
else
    echo "❌ Error en la conexión a la base de datos"
fi

echo ""
echo "🎉 Despliegue completado!"
echo "📱 Frontend: http://localhost:80"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 API Documentation: http://localhost:3000/documentation"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Ver estado: docker-compose ps"
