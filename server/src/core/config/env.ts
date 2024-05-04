/* eslint-disable @typescript-eslint/no-namespace */
declare namespace NodeJS {
  export interface ProcessEnv {
    APP_URL: string;
    CLIENT_APP_URL: string;
    LOGGING_DEPTH: string | undefined;
    CONSOLE_LOG_LEVEL: string | undefined;
    EMAIL_TRANSPORT_HOST: string;
    EMAIL_SENDER_EMAIL: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
    EMAIL_API_KEY: string;
    COOKIE_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_EXPIRATION: string;
    TOKEN_SECRET: string;
    PARTNER_PORTAL_API_AUTH_TOKEN: string;
    CONTENT_API_URL: string;
    DOMAIN_LOGS_BUFFER_SIZE: string;
    AROYA_SUGGESTIONS_API_URL: string;
  }
}
