import { spawn } from 'node:child_process';

const children = [];

function shutdown() {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
}

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      return;
    }

    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code;
      shutdown();
    }
  });

  children.push(child);
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(143);
});

run('websocket server', process.execPath, ['main.mjs']);
run('static client server', process.execPath, [
  './node_modules/http-server/bin/http-server',
  './client',
  '-p',
  '3000',
]);
