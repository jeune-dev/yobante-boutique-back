FROM node:22-slim

WORKDIR /app

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev

# Copier le code source
COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
