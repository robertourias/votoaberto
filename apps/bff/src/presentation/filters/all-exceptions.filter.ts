import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

const GENERIC_MESSAGE = "Erro interno do servidor";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly _logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.buildBody(exception, request.url);

    if (body.statusCode >= 500) {
      // Stack só no log do servidor; nunca na resposta.
      this._logger.error(
        `${request.method} ${request.path}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private buildBody(exception: unknown, path: string): ErrorResponseBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      if (statusCode < 500) {
        return {
          statusCode,
          error: this.statusName(statusCode),
          message: this.extractMessage(exception),
          path,
          timestamp,
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      message: GENERIC_MESSAGE,
      path,
      timestamp,
    };
  }

  private statusName(statusCode: number): string {
    const name = HttpStatus[statusCode] ?? "Error";
    return name
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private extractMessage(exception: HttpException): string {
    const res = exception.getResponse();
    if (typeof res === "string") return res;
    if ("message" in res) {
      const { message } = res;
      return Array.isArray(message) ? message.join("; ") : String(message);
    }
    return exception.message;
  }
}
