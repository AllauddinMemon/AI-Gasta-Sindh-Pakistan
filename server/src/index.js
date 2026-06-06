const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(env.port, () => {
  console.log(`\n  GASTA AI API running on http://localhost:${env.port}`);
  console.log(`  Environment: ${env.nodeEnv}`);
  console.log(`  AI provider: ${env.ai.provider}`);
  console.log(`  Storage driver: ${env.storage.driver}\n`);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received. Closing server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
