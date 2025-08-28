const core = require('@actions/core');
const { execSync } = require('child_process');

function getFlag(name, value, type = 'boolean') {
  if (type === 'boolean') {
    if (value === undefined || value === null) {
      return '';
    }
    if (value === 'true') {
      return ` --${name}`;
    }
    if (value === 'false') {
      return '';
    }
    core.warning(`Unexpected value for boolean flag '${name}': ${value}`);
    return '';
  }
  if (type === 'string' && value) {
    return ` --${name}=${value}`;
  }
  return '';
}

function getRepeatableFlag(name, value) {
  if (!value) return [];
  return value.split(',').map(v => ` --${name}=${v.trim()}`);
}

async function run() {
  try {
    const workingDir = core.getInput('working-directory') || process.cwd();
    let cmdParts = ['tofu', 'init'];

    // Global option
    const chdir = core.getInput('chdir');
    if (chdir) {
      cmdParts = ['tofu', `-chdir=${chdir}`, 'init'];
    }

    // Flags

  cmdParts.push(getFlag('input', core.getInput('input'), 'string'));
  cmdParts.push(getFlag('lock', core.getInput('lock'), 'string'));
  cmdParts.push(getFlag('lock-timeout', core.getInput('lock-timeout'), 'string'));
  if (core.getInput('no-color') === 'true') cmdParts.push(' --no-color');
  if (core.getInput('upgrade') === 'true') cmdParts.push(' --upgrade');
  if (core.getInput('json') === 'true') cmdParts.push(' --json');
  cmdParts = cmdParts.concat(getRepeatableFlag('var', core.getInput('var')));
  cmdParts = cmdParts.concat(getRepeatableFlag('var-file', core.getInput('var-file')));
  cmdParts.push(getFlag('from-module', core.getInput('from-module'), 'string'));
  cmdParts.push(getFlag('backend', core.getInput('backend'), 'string'));
  cmdParts = cmdParts.concat(getRepeatableFlag('backend-config', core.getInput('backend-config')));
  if (core.getInput('reconfigure') === 'true') cmdParts.push(' --reconfigure');
  if (core.getInput('migrate-state') === 'true') cmdParts.push(' --migrate-state');
  if (core.getInput('force-copy') === 'true') cmdParts.push(' --force-copy');
  cmdParts.push(getFlag('get', core.getInput('get'), 'string'));
  cmdParts.push(getFlag('plugin-dir', core.getInput('plugin-dir'), 'string'));
  cmdParts.push(getFlag('lockfile', core.getInput('lockfile'), 'string'));


    // Remove empty strings
    cmdParts = cmdParts.filter(Boolean);

    const cmd = cmdParts.join(' ');
    core.info(`Running: ${cmd}`);
    const output = execSync(cmd, { cwd: workingDir, encoding: 'utf-8' });
    core.setOutput('init-output', output);
    core.info('tofu init completed successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
