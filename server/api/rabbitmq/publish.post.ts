/**
 * API endpoint for publishing to RabbitMQ
 * POST /api/rabbitmq/publish
 * 
 * Body: { routingKey: string, message: string }
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.routingKey || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      data: { error: "Missing routingKey or message" },
    });
  }

  const config = useRuntimeConfig();

  try {
    // Use RabbitMQ Management HTTP API (requires management plugin)
    const amqpHost = config.rabbitmqHost;
    const amqpUser = config.rabbitmqUsername;
    const amqpPass = config.rabbitmqPassword;
    const amqpPort = config.rabbitmqPort || 5672;
    const managementPort = 15672;

    const response = await fetch(
      `http://${amqpHost}:${managementPort}/api/exchanges/%2F/amq.topic/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${amqpUser}:${amqpPass}`)}`,
        },
        body: JSON.stringify({
          properties: {},
          routing_key: body.routingKey,
          payload: body.message,
          payload_encoding: "string",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `RabbitMQ API returned status ${response.status}: ${await response.text()}`
      );
    }

    return {
      success: true,
      message: "Message published successfully",
      routingKey: body.routingKey,
    };
  } catch (error) {
    console.error("RabbitMQ publish error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        error: "Failed to publish message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});
