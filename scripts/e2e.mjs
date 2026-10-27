import { spawnSync } from 'node:child_process';
import foundation from '../foundation.config.json' with { type: 'json' };

const environment = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
if (!['development', 'preview', 'production'].includes(environment))
  throw new Error('Invalid EXPO_PUBLIC_APP_ENV');
const suffix = environment === 'production' ? '' : `.${environment}`;
const appId = `${foundation.applicationId}${suffix}`;
const result = spawnSync('maestro', ['test', '.maestro/', '-e', `APP_ID=${appId}`, ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.error)
  throw result.error;
process.exit(result.status ?? 1);
