#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Deploying Kholasa (el-kholasa.online)   "
echo "  Port: 127.0.0.1:3025 (Zero Conflict)    "
echo "=========================================="

if [ ! -f .env ]; then
  echo "Error: .env file not found."
  echo "Please create a .env file based on .env.example with your production credentials."
  exit 1
fi

echo "1. Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "2. Waiting for database to be healthy..."
sleep 5

echo "3. Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

echo "4. Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo "=========================================="
echo "Deployment successful!"
echo "Next step: If you haven't set up Nginx yet:"
echo "  sudo cp nginx-el-kholasa.conf /etc/nginx/sites-available/el-kholasa.online"
echo "  sudo ln -sf /etc/nginx/sites-available/el-kholasa.online /etc/nginx/sites-enabled/"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo "  sudo certbot --nginx -d el-kholasa.online -d www.el-kholasa.online"
echo "=========================================="
