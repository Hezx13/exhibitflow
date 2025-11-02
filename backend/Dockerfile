FROM oven/bun:1

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

COPY . .
RUN bun run build-app

ENV PORT=8080
EXPOSE 8080

CMD ["bun", "start"]