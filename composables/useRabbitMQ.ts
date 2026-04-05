/**
 * Composable for RabbitMQ messaging
 * Provides client-side access to RabbitMQ operations
 */

interface PublishOptions {
  routingKey: string;
  message: string | Record<string, any>;
}

export const useRabbitMQ = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Publish a message to RabbitMQ
   */
  const publish = async (options: PublishOptions): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const message =
        typeof options.message === "string"
          ? options.message
          : JSON.stringify(options.message);

      const response = await $fetch("/api/rabbitmq/publish", {
        method: "POST",
        body: {
          routingKey: options.routingKey,
          message,
        },
      });

      return response.success === true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to publish message";
      console.error("RabbitMQ publish error:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Publish score update
   */
  const publishScoreUpdate = async (
    eventId: string,
    fieldId: string,
    scoreData: Record<string, any>
  ): Promise<boolean> => {
    return publish({
      routingKey: `scoreboard.${eventId}.${fieldId}.score.update`,
      message: {
        eventId,
        fieldId,
        timestamp: new Date().toISOString(),
        ...scoreData,
      },
    });
  };

  /**
   * Publish alarm trigger
   */
  const publishAlarm = async (
    eventId: string,
    fieldId: string,
    duration: number = 5
  ): Promise<boolean> => {
    return publish({
      routingKey: `scoreboard.${eventId}.${fieldId}.alarm.trigger`,
      message: {
        eventId,
        fieldId,
        duration,
        timestamp: new Date().toISOString(),
      },
    });
  };

  /**
   * Publish display URL update
   */
  const publishDisplayUrlUpdate = async (
    displayId: string,
    url: string
  ): Promise<boolean> => {
    return publish({
      routingKey: `display.${displayId}.url.update`,
      message: {
        displayId,
        url,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    publish,
    publishScoreUpdate,
    publishAlarm,
    publishDisplayUrlUpdate,
  };
};
