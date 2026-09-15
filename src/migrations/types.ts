export interface Migration {
  fromVersion: number;
  toVersion: number;
  migrate: (rawPayload: Record<string, any>) => Record<string, any>;
}
