import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AllExceptionsFilter } from "./presentation/filters/all-exceptions.filter";

export const GLOBAL_PREFIX = "api/v1";

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("VotoAberto BFF").setVersion("1.0").build(),
  );
  SwaggerModule.setup("api/docs", app, document, { jsonDocumentUrl: "api/docs-json" });
}
