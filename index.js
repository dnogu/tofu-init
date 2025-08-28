const core = require('@actions/core');
const { execSync } = require('child_process');

function getFlag(name, value, type = 'boolean') {
  if (type === 'boolean') {
    return value === 'true' ? `--${name}` : value === 'false' ? '' : '';
  }
  if (type === 'string' && value) {
    return `--${name}=${value}`;
  }
  return '';
}

function getRepeatableFlag(name, value) {
  if (!value) return '';
  return value.split(',').map(v => `--${name}=${v.trim()}`).join(' ');
}

async function run() {
  try {
    const workingDir = core.getInput('working-directory') || process.cwd();
    let cmd = 'tofu init';

    // Global option
    const chdir = core.getInput('chdir');
    if (chdir) cmd = `tofu -chdir=${chdir} init`;

    // Flags
    cmd += getFlag('input', core.getInput('input'), 'string');
    cmd += getFlag('lock', core.getInput('lock'), 'string');
    cmd += getFlag('lock-timeout', core.getInput('lock-timeout'), 'string');
    cmd += core.getInput('no-color') === 'true' ? ' --no-color' : '';
    cmd += core.getInput('upgrade') === 'true' ? ' --upgrade' : '';
    cmd += core.getInput('json') === 'true' ? ' --json' : '';
    cmd += getRepeatableFlag('var', core.getInput('var'));
    cmd += getRepeatableFlag('var-file', core.getInput('var-file'));
    cmd += getFlag('from-module', core.getInput('from-module'), 'string');
    cmd += getFlag('backend', core.getInput('backend'), 'string');
    cmd += getRepeatableFlag('backend-config', core.getInput('backend-config'));
    cmd += core.getInput('reconfigure') === 'true' ? ' --reconfigure' : '';
    cmd += core.getInput('migrate-state') === 'true' ? ' --migrate-state' : '';
    cmd += core.getInput('force-copy') === 'true' ? ' --force-copy' : '';
    cmd += getFlag('get', core.getInput('get'), 'string');
    cmd += getFlag('plugin-dir', core.getInput('plugin-dir'), 'string');
    cmd += getFlag('lockfile', core.getInput('lockfile'), 'string');

    core.info(`Running: ${cmd}`);
    const output = execSync(cmd, { cwd: workingDir, encoding: 'utf-8' });
    core.setOutput('init-output', output);
    core.info('tofu init completed successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
