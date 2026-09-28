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

if (await isPortAvailable(studioPort)) {
  const studio = run('npx', ['prisma', 'studio', '--port', String(studioPort)]);

  studio.on('exit', (code) => {
    process.exitCode = code ?? 0;
  });
} else {
  console.log(`Prisma Studio ja esta rodando em http://localhost:${studioPort}`);
}
