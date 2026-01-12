FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# IMPORTANTE: --host es necesario para que Docker pueda mapear el puerto
CMD ["npm", "run", "dev", "--", "--host"]