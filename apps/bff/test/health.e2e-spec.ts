import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap";

describe("BFF (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/health -> 200 {status:ok}", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health").expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /api/v1/nao-existe -> 404 com shape de erro", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/nao-existe").expect(404);
    expect(res.body).toEqual({
      statusCode: 404,
      error: "Not Found",
      message: expect.any(String),
      path: "/api/v1/nao-existe",
      timestamp: expect.any(String),
    });
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it("GET /api/docs -> 200 com UI do Swagger", async () => {
    const res = await request(app.getHttpServer()).get("/api/docs").expect(200);
    expect(res.text).toContain("swagger-ui");
  });

  it("GET /api/docs-json -> 200 e documenta /api/v1/health", async () => {
    const res = await request(app.getHttpServer()).get("/api/docs-json").expect(200);
    expect(res.body.paths).toHaveProperty("/api/v1/health");
  });
});
