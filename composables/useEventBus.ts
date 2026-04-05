/**
 * Composable for event communication in web/Cloudflare environment
 * Provides a simple event bus for inter-component communication
 */

import { onMounted } from 'vue';

type EventListener = (payload: any) => void;

export const useEventBus = () => {
  const listeners = new Map<string, Set<EventListener>>();

  /**
   * Listen to an event
   */
  const on = (
    eventName: string,
    callback: EventListener
  ): (() => void) => {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }

    listeners.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.get(eventName)?.delete(callback);
    };
  };

  /**
   * Emit an event
   */
  const emit = (eventName: string, payload: any) => {
    const callbacks = listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  };

  /**
   * Invoke a server command via API endpoint
   */
  const invoke = async (command: string, data?: any): Promise<any> => {
    return invokeAPI(command, data);
  };

  /**
   * Call server API endpoint based on command name
   */
  const invokeAPI = async (command: string, data?: any): Promise<any> => {
    const endpoints: Record<string, string> = {
      update_quarter: "/api/score/quarter",
      update_score: "/api/score/update",
      trigger_alarm: "/api/hardware/alarm",
      list_serial_ports: "/api/hardware/serial-ports",
      connect_serial_port: "/api/hardware/serial-connect",
      disconnect_serial_port: "/api/hardware/serial-disconnect",
    };

    const endpoint = endpoints[command];
    if (!endpoint) {
      throw new Error(`No API endpoint for command: ${command}`);
    }

    try {
      const response = await $fetch(endpoint, {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      console.error(`API call failed for ${command}:`, error);
      throw error;
    }
  };

  return {
    on,
    emit,
    invoke,
  };
};
