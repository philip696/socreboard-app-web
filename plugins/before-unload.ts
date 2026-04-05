export default defineNuxtPlugin(() => {
  if (process.client) {
    window.onbeforeunload = function () {
      // Perform cleanup if needed, such as:
      // - Save game state to localStorage
      // - Close active connections
      // - Notify server of app closing
      
      // Optional: Return a string if you want a confirmation dialog
      // return 'Are you sure you want to leave?';
    };
  }
});
