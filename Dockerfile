FROM node:20-bullseye

WORKDIR /app

# Copiamos package y prisma primero para aprovechar cache
COPY package*.json ./
COPY prisma ./prisma

# Instala TODAS las deps (incluye dev para prisma CLI)
RUN npm ci

# Genera Prisma Client
RUN npx prisma generate

# Copia el resto del código
COPY . .

# Puerto de la API
EXPOSE 4000

# Al arrancar el contenedor: aplicar migraciones y levantar el server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
