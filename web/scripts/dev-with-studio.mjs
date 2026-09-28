import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const isWindows = process.platform === 'win32';
const studioPort = 5555;

function run(command, args) {
  if (isWindows) {
    return spawn([command, ...args].join(' '), {
      stdio: 'inherit',
      shell: true,
    });
  }

  return spawn(command, args, { stdio: 'inherit' });
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
}

const processes = [];

function stopAll(signal) {
  for (const child of processes) {
    if (child.killed) {
      continue;
    }

    if (isWindows && child.pid) {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      child.kill(signal);
    }
  }
}

function watch(child) {
  child.on('exit', (code, signal) => {
    stopAll(signal ?? 'SIGTERM');
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}

function start(command, args) {
  const child = run(command, args);
  processes.push(child);
  watch(child);
}

process.on('SIGINT', () => {
  stopAll('SIGINT');
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
});

start('npm', ['run', 'dev']);

if (await isPortAvailable(studioPort)) {
  start('npx', ['prisma', 'studio', '--port', String(studioPort)]);
} else {
  console.log(`Prisma Studio ja esta rodando em http://localhost:${studioPort}`);
}
