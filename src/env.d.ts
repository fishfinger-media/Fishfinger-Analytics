/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PLAUSIBLE_API_KEY: string;
  readonly SLACK_CLIENT_ID: string;
  readonly SLACK_CLIENT_SECRET: string;
  readonly APP_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
