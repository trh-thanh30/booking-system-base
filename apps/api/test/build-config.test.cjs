const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { test } = require('node:test');
const ts = require('typescript');

const apiRoot = path.resolve(__dirname, '..');
const configPath = path.join(apiRoot, 'tsconfig.build.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
assert.equal(config.error, undefined);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, apiRoot);
assert.equal(parsed.errors.length, 0);
const program = ts.createProgram(parsed.fileNames, parsed.options);

test('incremental build cache is cleaned together with build output', () => {
  assert.equal(
    path.dirname(parsed.options.tsBuildInfoFile),
    parsed.options.outDir,
  );
});

if (process.argv.includes('--built')) {
  test('built API and worker entrypoints exist without nested workspace output', () => {
    for (const entry of ['main.js', 'workers/email/worker.main.js']) {
      assert.ok(fs.existsSync(path.join(parsed.options.outDir, entry)), entry);
    }
    assert.equal(
      fs.existsSync(path.join(parsed.options.outDir, 'apps/api/src/main.js')),
      false,
    );
  });
}

test('production compilation excludes Jest-only helpers and external shared source', () => {
  const files = program.getSourceFiles().map((file) => file.fileName);
  assert.equal(
    files.some((file) => file.endsWith('/src/test/repo-shared.jest.ts')),
    false,
  );
  assert.equal(
    files.some((file) =>
      file.endsWith('/packages/shared/src/utils/admin-navigation.ts'),
    ),
    false,
  );
});

test('API and email worker emit at the paths used by Nest and Docker', () => {
  const sourceRoot = program.getCommonSourceDirectory();
  assert.equal(path.resolve(sourceRoot), path.join(apiRoot, 'src'));
  for (const entry of ['main.ts', 'workers/email/worker.main.ts']) {
    const sourcePath = path.join(apiRoot, 'src', entry);
    assert.ok(program.getSourceFile(sourcePath));
    assert.equal(
      path.relative(sourceRoot, sourcePath).replace(/\.ts$/, '.js'),
      entry.replace(/\.ts$/, '.js'),
    );
  }
});
