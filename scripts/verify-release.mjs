import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.argv[2];
if (!['ios', 'ios-simulator', 'android'].includes(platform))
  throw new Error('Usage: node scripts/verify-release.mjs ios|ios-simulator|android');
const environment = { ...process.env, EXPO_PUBLIC_APP_ENV: 'production', CI: '1' };
mkdirSync(path.join(root, 'artifacts', 'logs'), { recursive: true });

function run(command, args, cwd = root) {
  console.log(`Running: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, env: environment, stdio: 'inherit' });
  if (result.error)
    throw result.error;
  if (result.status !== 0)
    process.exit(result.status ?? 1);
}

if (platform === 'android') {
  run('bunx', ['expo', 'prebuild', '--platform', 'android', '--no-install']);
  run('./gradlew', ['assembleRelease', 'bundleRelease', '--no-daemon'], path.join(root, 'android'));
  console.log('Release APK/AAB: android/app/build/outputs/. The default verification build uses the generated debug key; configure product signing before store upload.');
}
else {
  run('bunx', ['expo', 'prebuild', '--platform', 'ios']);
  const workspace = readdirSync(path.join(root, 'ios')).find(name => name.endsWith('.xcworkspace'));
  if (!workspace)
    throw new Error('iOS workspace not generated');
  const scheme = path.basename(workspace, '.xcworkspace');
  const common = ['-workspace', path.join(root, 'ios', workspace), '-scheme', scheme, '-configuration', 'Release', '-derivedDataPath', path.join(root, '.build', platform), 'CODE_SIGNING_ALLOWED=NO'];
  if (platform === 'ios') {
    run('xcodebuild', [...common, '-sdk', 'iphoneos', '-destination', 'generic/platform=iOS', '-archivePath', path.join(root, 'artifacts', 'ios', `${scheme}.xcarchive`), 'archive']);
    console.log('Unsigned device release archive: artifacts/ios/. Product distribution signing is required before App Store upload.');
  }
  else {
    run('xcodebuild', [...common, '-sdk', 'iphonesimulator', '-destination', 'generic/platform=iOS Simulator', 'build']);
    console.log('Simulator release app: .build/ios-simulator/Build/Products/Release-iphonesimulator/.');
  }
}
