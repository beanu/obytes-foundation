import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excludedDirectories = new Set(['.git', '.expo', '.build', '.argent', 'node_modules', 'ios', 'android', 'artifacts', 'coverage', 'dist', 'web-build', '.expo-shared']);
const excludedFiles = new Set(['.DS_Store', '.eslintcache']);
const credentialFile = /\.(?:jks|keystore|p8|p12|pfx|key|mobileprovision)$|^(?:credentials|google-services)\.json$|^GoogleService-Info\.plist$/i;

const slugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const applicationIdPattern = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/;

const lockfileNamePattern = /("workspaces":\s*\{\s*"":\s*\{\s*"name":\s*)"[^"]+"/;

function canonicalDestination(destination) {
  let existing = path.resolve(destination);
  const segments = [];
  while (!existsSync(existing)) {
    segments.unshift(path.basename(existing));
    existing = path.dirname(existing);
  }
  return path.resolve(realpathSync(existing), ...segments);
}

export function createProject(options) {
  const { destination, name, slug, applicationId, source = templateRoot } = options;
  if (!slugPattern.test(slug ?? ''))
    throw new Error('slug must be lowercase and contain only letters, numbers and single hyphens');
  if (!applicationIdPattern.test(applicationId ?? ''))
    throw new Error('applicationId must be a reverse-domain identifier, for example com.example.shop');
  if (typeof name !== 'string' || !name.trim())
    throw new Error('name is required');
  const target = canonicalDestination(destination);
  const sourceRoot = realpathSync(source);
  const sourceRelative = path.relative(sourceRoot, target);
  if (!sourceRelative || (!sourceRelative.startsWith(`..${path.sep}`) && sourceRelative !== '..' && !path.isAbsolute(sourceRelative)))
    throw new Error('destination must be outside the template directory');
  if (existsSync(target) && readdirSync(target).length)
    throw new Error('destination must be empty; existing files will not be overwritten');
  mkdirSync(target, { recursive: true });
  cpSync(sourceRoot, target, {
    recursive: true,
    filter: (entry) => {
      const parts = path.relative(sourceRoot, entry).split(path.sep);
      const basename = path.basename(entry);
      return !lstatSync(entry).isSymbolicLink()
        && !parts.some(part => excludedDirectories.has(part))
        && !excludedFiles.has(basename)
        && !(basename.startsWith('.env') && basename !== '.env.example')
        && !credentialFile.test(basename);
    },
  });
  const config = { name: name.trim(), slug, scheme: slug, applicationId };
  writeFileSync(path.join(target, 'foundation.config.json'), `${JSON.stringify(config, null, 2)}\n`);
  const packagePath = path.join(target, 'package.json');
  const packageJSON = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJSON.name = slug;
  packageJSON.version = '0.1.0';
  delete packageJSON.repository;
  writeFileSync(packagePath, `${JSON.stringify(packageJSON, null, 2)}\n`);
  const lockfile = path.join(target, 'bun.lock');
  if (existsSync(lockfile)) {
    const contents = readFileSync(lockfile, 'utf8');
    writeFileSync(lockfile, contents.replace(lockfileNamePattern, (_match, prefix) => `${prefix}${JSON.stringify(slug)}`));
  }
  cpSync(path.join(target, '.env.example'), path.join(target, '.env'));
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { positionals, values } = parseArgs({
      allowPositionals: true,
      options: { name: { type: 'string' }, slug: { type: 'string' }, id: { type: 'string' } },
    });
    if (positionals.length !== 1)
      throw new Error('Usage: bun run template:create ../my-app --name "My App" --slug my-app --id com.example.myapp');
    const target = createProject({ destination: positionals[0], name: values.name, slug: values.slug, applicationId: values.id });
    console.log(`Created ${target}. Next: cd into the project, run bun install --frozen-lockfile, then bun run check-all.`);
  }
  catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
