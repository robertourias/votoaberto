import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { configureApp } from "./bootstrap";

const DEFAULT_PORT = 3401;

function resolvePort(raw: string | undefined): number {
  if (raw === undefined || raw === "") return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    new Logger("Bootstrap").warn(`PORT inválida "${raw}"; usando ${DEFAULT_PORT}`);
    return DEFAULT_PORT;
  }
  return port;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(resolvePort(process.env.PORT));
}

void bootstrap();
