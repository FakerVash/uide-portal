#!/bin/bash

# Script de Despliegue Automático para UIDE Portal

echo "=========================================="
echo "Iniciando Despliegue..."
echo "=========================================="

# 1. Obtener cambios más recientes del repositorio
echo "[1/4] Descargando código actualizado..."
git pull origin main

# 1.1 Crear carpeta de uploads y dar permisos
echo "[INFO] Asegurando carpeta de uploads..."
mkdir -p proyecto/uploads
sudo chmod 777 proyecto/uploads

# 2. Detener contenedores antiguos (opcional, para asegurar limpieza)
echo "[2/4] Deteniendo servicios anteriores..."
sudo docker compose down

# 3. Limpiar imágenes antiguas (MUY IMPORTANTE SI EL DISCO ESTA LLENO)
echo "[3/4] Limpiando imágenes en desuso para liberar espacio..."
sudo docker system prune -af

# 4. Construir e iniciar contenedores
echo "[4/4] Construyendo y levantando nuevos contenedores..."
sudo docker compose up -d --build

echo "=========================================="
echo "¡Despliegue Completado Exitosamente!"
echo "=========================================="
sudo docker compose ps
