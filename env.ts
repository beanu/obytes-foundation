import z from 'zod';
import foundation from './foundation.config.json';
import packageJSON from './package.json';

const appEnvironment = z.enum(['development', 'preview', 'production'])
  .parse(process.env.EXPO_PUBLIC_APP_ENV ?? 'development');
const suffix = appEnvironment === 'production' ? '' : `.${appEnvironment}`;

// Only public values belong here: this module is also bundled into the app.
const Env = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
  EXPO_PUBLIC_NAME: z.string().min(1),
  EXPO_PUBLIC_SCHEME: z.string().regex(/^[a-z][a-z0-9+.-]*$/),
  EXPO_PUBLIC_BUNDLE_ID: z.string().min(1),
  EXPO_PUBLIC_PACKAGE: z.string().min(1),
  EXPO_PUBLIC_VERSION: z.string().min(1),
  EXPO_PUBLIC_API_URL: z.url(),
}).parse({
  EXPO_PUBLIC_APP_ENV: appEnvironment,
  EXPO_PUBLIC_NAME: foundation.name,
  EXPO_PUBLIC_SCHEME: `${foundation.scheme}${suffix}`,
  EXPO_PUBLIC_BUNDLE_ID: `${foundation.applicationId}${suffix}`,
  EXPO_PUBLIC_PACKAGE: `${foundation.applicationId}${suffix}`,
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'https://dummyjson.com/',
});

export default Env;
