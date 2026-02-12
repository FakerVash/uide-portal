#!/bin/bash

# Script de configuración para AWS Aurora - UIDE Student Services Portal
# Endpoint: database-1.cgfqom6awot1.us-east-1.rds.amazonaws.com

set -e

echo "🔧 Configurando conexión a AWS Aurora..."

# Variables de conexión
AURORA_ENDPOINT="database-1.cgfqom6awot1.us-east-1.rds.amazonaws.com"
AURORA_PORT="3306"
AURORA_REGION="us-east-1"

echo "📍 Endpoint Aurora: $AURORA_ENDPOINT"
echo "🌍 Región: $AURORA_REGION"
echo "🔌 Puerto: $AURORA_PORT"

# Solicitar credenciales
echo ""
echo "Por favor, ingrese las credenciales de la base de datos:"

read -p "👤 Usuario de BD: " DB_USER
read -s -p "🔒 Contraseña de BD: " DB_PASS
echo ""
read -p "📊 Nombre de la base de datos: " DB_NAME

# Construir URL de conexión
DATABASE_URL="mysql://$DB_USER:$DB_PASS@$AURORA_ENDPOINT:$AURORA_PORT/$DB_NAME"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
fi

# Actualizar DATABASE_URL en .env
sed -i "s|DATABASE_URL=\".*\"|DATABASE_URL=\"$DATABASE_URL\"|g" .env

echo ""
echo "✅ Configuración completada!"
echo "📋 URL de conexión configurada:"
echo "   $DATABASE_URL"
echo ""
echo "🔍 Para verificar la conexión:"
echo "   docker-compose exec backend npm run db:generate"
echo "   docker-compose exec backend npm run db:push"
echo ""
echo "⚠️  Asegúrese de que:"
echo "   - El Security Group de Aurora permita conexiones desde su servidor"
echo "   - Las credenciales sean correctas"
echo "   - La base de datos exista en Aurora"
