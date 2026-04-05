/**
 * Composable for hardware serial port communication
 * Uses WebSerial API for direct browser access to serial devices
 * Fallback: Can also trigger server-side operations for remote serial devices
 */

interface SerialPortOptions {
  baudRate?: number;
  databits?: number;
  stopbits?: number;
  parity?: "none" | "even" | "odd";
}

export const useSerialPort = () => {
  const port = ref<SerialPort | null>(null);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const availablePorts = ref<SerialPort[]>([]);

  // Check if WebSerial API is available
  const isWebSerialAvailable = (): boolean => {
    return typeof navigator !== "undefined" && "serial" in navigator;
  };

  /**
   * Request user to select a serial port
   */
  const requestPort = async (): Promise<boolean> => {
    if (!isWebSerialAvailable()) {
      error.value =
        "WebSerial API not available. Browser must support navigator.serial";
      console.warn(error.value);
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      port.value = await navigator.serial.requestPort();
      return true;
    } catch (err) {
      if (err instanceof Error && err.name !== "NotFoundError") {
        error.value = err.message;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get list of previously paired ports
   */
  const getPairedPorts = async (): Promise<void> => {
    if (!isWebSerialAvailable()) {
      return;
    }

    try {
      availablePorts.value = await navigator.serial.getPorts();
    } catch (err) {
      console.error("Failed to get paired ports:", err);
    }
  };

  /**
   * Connect to serial port
   */
  const connect = async (
    options: SerialPortOptions = { baudRate: 9600 }
  ): Promise<boolean> => {
    if (!port.value) {
      error.value = "No port selected";
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      await port.value.open(options);
      isConnected.value = true;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Connection failed";
      console.error("Serial port connection error:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Disconnect from serial port
   */
  const disconnect = async (): Promise<boolean> => {
    if (!port.value || !isConnected.value) {
      return true;
    }

    isLoading.value = true;
    error.value = null;

    try {
      await port.value.close();
      isConnected.value = false;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Disconnection failed";
      console.error("Serial port disconnection error:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Send data to serial port
   */
  const sendData = async (data: string): Promise<boolean> => {
    if (!port.value || !isConnected.value) {
      error.value = "Serial port not connected";
      return false;
    }

    try {
      const writer = port.value.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(data));
      writer.releaseLock();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Send failed";
      console.error("Serial port send error:", err);
      return false;
    }
  };

  /**
   * Read data from serial port
   */
  const readData = async (): Promise<string | null> => {
    if (!port.value || !isConnected.value) {
      error.value = "Serial port not connected";
      return null;
    }

    try {
      const reader = port.value.readable.getReader();
      const { value, done } = await reader.read();
      reader.releaseLock();

      if (done || !value) {
        return null;
      }

      const decoder = new TextDecoder();
      return decoder.decode(value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Read failed";
      console.error("Serial port read error:", err);
      return null;
    }
  };

  /**
   * Trigger alarm (send "on" command and optionally auto-off after duration)
   */
  const triggerAlarm = async (durationSeconds: number = 5): Promise<boolean> => {
    if (!(await sendData("on\n"))) {
      return false;
    }

    // Auto-turn off after duration
    if (durationSeconds > 0) {
      setTimeout(() => {
        sendData("off\n").catch((err) => {
          console.error("Failed to send alarm off command:", err);
        });
      }, durationSeconds * 1000);
    }

    return true;
  };

  // Initialize: Get paired ports on mount
  onMounted(() => {
    getPairedPorts();
  });

  return {
    port: readonly(port),
    isConnected: readonly(isConnected),
    isLoading: readonly(isLoading),
    error: readonly(error),
    availablePorts: readonly(availablePorts),
    isWebSerialAvailable,
    requestPort,
    getPairedPorts,
    connect,
    disconnect,
    sendData,
    readData,
    triggerAlarm,
  };
};
