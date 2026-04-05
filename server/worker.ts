/**
 * Cloudflare Workers entry point for the Scoreboard app
 * Handles server-side operations like RabbitMQ messaging
 */

import type { PagesFunction, EventContext } from "@cloudflare/workers-types";

// Define the event context with environment variables
interface Env {
  RABBITMQ_HOST: string;
  RABBITMQ_USERNAME: string;
  RABBITMQ_PASSWORD: string;
  RABBITMQ_PORT?: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

/**
 * Main Pages Function handler
 */
export const onRequest: PagesFunction<Env> = async (context: EventContext<Env, any, any>) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // API Routes handler
  if (url.pathname.startsWith("/api/")) {
    // RabbitMQ routes
    if (url.pathname === "/api/rabbitmq/publish" && request.method === "POST") {
      return handleRabbitMQPublish(request, env);
    }

    if (url.pathname === "/api/rabbitmq/config" && request.method === "GET") {
      return handleRabbitMQConfig(env);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return handleHealth(env);
    }

    // Return 404 for unknown API routes
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pass through to Nuxt
  return context.next();
};

/**
 * Publish message to RabbitMQ
 */
async function handleRabbitMQPublish(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      routingKey: string;
      message: string;
    };

    const { routingKey, message } = body;

    if (!routingKey || !message) {
      return new Response(
        JSON.stringify({ error: "Missing routingKey or message" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create AMQP URI
    const amqpUri = `amqp://${encodeURIComponent(env.RABBITMQ_USERNAME)}:${encodeURIComponent(env.RABBITMQ_PASSWORD)}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT || 5672}`;

    // Note: Cloudflare Workers don't directly support AMQP connections
    // You have two options:
    // 1. Use RabbitMQ REST API instead
    // 2. Use a broker like CloudAMQP that provides HTTP endpoint

    // Using RabbitMQ HTTP API (requires management plugin enabled)
    const response = await fetch(
      `http://${env.RABBITMQ_HOST}:15672/api/exchanges/%2F/amq.topic/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${env.RABBITMQ_USERNAME}:${env.RABBITMQ_PASSWORD}`)}`,
        },
        body: JSON.stringify({
          properties: {},
          routing_key: routingKey,
          payload: message,
          payload_encoding: "string",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`RabbitMQ API error: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true, message: "Published" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("RabbitMQ publish error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to publish message",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Get RabbitMQ configuration (public, non-sensitive info)
 */
function handleRabbitMQConfig(env: Env): Response {
  return new Response(
    JSON.stringify({
      host: env.RABBITMQ_HOST,
      port: env.RABBITMQ_PORT || 5672,
      // Note: Don't expose username/password to client
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Health check endpoint
 */
function handleHealth(env: Env): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      rabbitmqHost: env.RABBITMQ_HOST,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
