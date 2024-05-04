import * as process from 'node:process';
import { EnvType } from './env-type';

export class Config {
  readonly cookieSecret: string;

  readonly appUrl: string;

  readonly clientAppUrl: string;

  private readonly env: EnvType;

  private readonly loggingDepth?: number;

  private readonly consoleLogLevel?: string;

  constructor() {
    this.appUrl = process.env.APP_URL;
    this.clientAppUrl = process.env.CLIENT_APP_URL;

    this.env = Object.values(EnvType).includes(process.env.NODE_ENV as EnvType)
      ? (process.env.ENV as EnvType)
      : EnvType.Local;

    const loggingDepth = Number(process.env.LOGGING_DEPTH);
    this.loggingDepth = Number.isNaN(loggingDepth) ? loggingDepth : undefined;

    this.consoleLogLevel = process.env.CONSOLE_LOG_LEVEL;
    this.cookieSecret = process.env.COOKIE_SECRET;
  }

  get isLocal(): boolean {
    return this.env === EnvType.Local;
  }

  get logging(): {
    depth?: number;
    console: { level?: string };
    domainLogsBufferSize: number;
  } {
    return {
      depth: this.loggingDepth,
      console: {
        level: this.consoleLogLevel,
      },
      domainLogsBufferSize: Number(process.env.DOMAIN_LOGS_BUFFER_SIZE),
    };
  }

  get emailBus(): {
    sender: string;
    apiKey: string;
  } {
    return {
      sender: process.env.EMAIL_SENDER_EMAIL,
      apiKey: process.env.EMAIL_API_KEY,
    };
  }

  get auth(): {
    refreshTokenExpiration: number;
    accessTokenExpiration: number;
    tokenSecret: string;
  } {
    return {
      accessTokenExpiration: Number(process.env.ACCESS_TOKEN_EXPIRATION),
      refreshTokenExpiration: Number(process.env.REFRESH_TOKEN_EXPIRATION),
      tokenSecret: process.env.TOKEN_SECRET,
    };
  }

  get content() {
    return {
      portalAuthToken: process.env.PARTNER_PORTAL_API_AUTH_TOKEN,
      apiUrl: process.env.CONTENT_API_URL,
    };
  }

  get aroyaContacts() {
    return {
      suggestionsApiUrl: process.env.AROYA_SUGGESTIONS_API_URL,
    };
  }
}
