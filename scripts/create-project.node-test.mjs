import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createProject } from './create-project.mjs';

function fixture(t) {
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'foundation-generator-'));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const source = path.join(temporary, 'template');
  mkdirSync(source);
  writeFileSync(path.join(source, 'package.json'), JSON.stringify({ name: 'template', version: '1.0.0', repository: { url: 'upstream' } }));
  writeFileSync(path.join(source, 'foundation.config.json'), '{}');
  writeFileSync(path.join(source, '.env.example'), 'EXPO_PUBLIC_API_URL=https://example.com/\n');
  return { source, destination: path.join(temporary, 'shop'), name: 'My Shop', slug: 'my-shop', applicationId: 'com.example.shop' };
}

test('exports a renamed project without credentials, native output or template history', (t) => {
  const options = fixture(t);
  for (const directory of ['.git', 'node_modules', 'ios', 'artifacts']) {
    mkdirSync(path.join(options.source, directory));
    writeFileSync(path.join(options.source, directory, 'private'), 'do not copy');
  }
  for (const name of ['.env', '.env.production', 'credentials.json', 'upload.jks', 'upload.pfx', 'google-services.json'])
    writeFileSync(path.join(options.source, name), 'do not copy');
  symlinkSync(path.join(options.source, '.env.production'), path.join(options.source, 'secret-link'));
  const target = createProject(options);
  const config = JSON.parse(readFileSync(path.join(target, 'foundation.config.json'), 'utf8'));
  assert.equal(config.applicationId, options.applicationId);
  assert.equal(config.scheme, options.slug);
  const packageJSON = JSON.parse(readFileSync(path.join(target, 'package.json'), 'utf8'));
  assert.equal(packageJSON.name, options.slug);
  assert.equal(packageJSON.repository, undefined);
  assert.equal(readFileSync(path.join(target, '.env'), 'utf8'), readFileSync(path.join(target, '.env.example'), 'utf8'));
  for (const name of ['.git', 'node_modules', 'ios', 'artifacts', '.env.production', 'credentials.json', 'upload.jks', 'upload.pfx', 'google-services.json', 'secret-link'])
    assert.equal(existsSync(path.join(target, name)), false, name);
});

test('refuses to overwrite an existing project', (t) => {
  const options = fixture(t);
  mkdirSync(options.destination);
  writeFileSync(path.join(options.destination, 'existing'), 'keep');
  assert.throws(() => createProject(options), /must be empty/);
  assert.equal(readFileSync(path.join(options.destination, 'existing'), 'utf8'), 'keep');
});

test('rejects invalid identifiers and recursive copies', (t) => {
  const options = fixture(t);
  assert.throws(() => createProject({ ...options, slug: 'My App' }), /slug/);
  assert.throws(() => createProject({ ...options, applicationId: 'invalid' }), /applicationId/);
  assert.throws(() => createProject({ ...options, destination: path.join(options.source, 'nested') }), /outside/);
});

test('rejects destinations hidden inside the template through a directory alias', (t) => {
  const options = fixture(t);
  const alias = path.join(path.dirname(options.source), 'template-alias');
  symlinkSync(options.source, alias, 'dir');
  assert.throws(() => createProject({ ...options, destination: path.join(alias, 'nested') }), /outside/);
  assert.equal(existsSync(path.join(options.source, 'nested')), false);
});
