import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  NotFoundException,
} from "@nestjs/common";

import { AllExceptionsFilter, ErrorResponseBody } from "./all-exceptions.filter";

function buildHost(url = "/api/v1/x") {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url, path: url.split("?")[0], method: "GET" }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let errorLog: jest.SpyInstance;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    errorLog = jest.spyOn(filter["_logger"], "error").mockImplementation(() => undefined);
  });

  it("responde 500 com message genérica e sem stack trace para erro inesperado", () => {
    const { host, status, json } = buildHost();

    filter.catch(new Error("segredo interno: senha=123"), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0] as ErrorResponseBody;
    expect(body).toEqual({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erro interno do servidor",
      path: "/api/v1/x",
      timestamp: expect.any(String),
    });
    expect(JSON.stringify(body)).not.toMatch(/segredo|senha|stack|\bat\b.*\.ts/);
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it("converte HttpException 5xx em 500 genérico, sem vazar detalhe, e loga", () => {
    const { host, status, json } = buildHost();

    filter.catch(new HttpException("detalhe interno", 503), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0] as ErrorResponseBody;
    expect(body.statusCode).toBe(500);
    expect(body.message).toBe("Erro interno do servidor");
    expect(JSON.stringify(body)).not.toContain("detalhe interno");
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it("trata valores lançados que não são Error como 500 genérico", () => {
    const { host, status, json } = buildHost();

    filter.catch("boom", host);

    expect(status).toHaveBeenCalledWith(500);
    expect((json.mock.calls[0][0] as ErrorResponseBody).message).toBe("Erro interno do servidor");
  });

  it("preserva status e message de HttpException 4xx no shape padrão", () => {
    const { host, status, json } = buildHost("/api/v1/nao-existe");

    filter.catch(new NotFoundException("Cannot GET /api/v1/nao-existe"), host);

    expect(status).toHaveBeenCalledWith(404);
    const body = json.mock.calls[0][0] as ErrorResponseBody;
    expect(body).toEqual({
      statusCode: 404,
      error: "Not Found",
      message: "Cannot GET /api/v1/nao-existe",
      path: "/api/v1/nao-existe",
      timestamp: expect.any(String),
    });
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it("junta mensagens de validação em array", () => {
    const { host, json } = buildHost();

    filter.catch(new BadRequestException({ message: ["a inválido", "b inválido"] }), host);

    expect((json.mock.calls[0][0] as ErrorResponseBody).message).toBe("a inválido; b inválido");
  });
});
