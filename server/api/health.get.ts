/**
 * Health check endpoint
 * GET /api/health
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    rabbitmq: {
      host: config.rabbitmqHost,
      port: config.rabbitmqPort || 5672,
    },
  };
});
