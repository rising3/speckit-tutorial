export class LoadingIndicator {
  constructor(message = 'Loading...') {
    this.message = message;
    this.element = null;
    this.startTime = null;
    this.minDisplayTime = 100; // Only show for operations >100ms
  }

  show() {
    this.startTime = Date.now();

    this.element = document.createElement('div');
    this.element.className = 'loading-indicator';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-message">${this.message}</p>
    `;

    document.body.appendChild(this.element);

    // Trigger animation
    setTimeout(() => this.element.classList.add('show'), 10);
  }

  async hide() {
    if (!this.element) return;

    const elapsed = Date.now() - this.startTime;

    // Only hide if shown for at least minDisplayTime
    if (elapsed < this.minDisplayTime) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minDisplayTime - elapsed)
      );
    }

    this.element.classList.remove('show');
    setTimeout(() => {
      this.element?.remove();
      this.element = null;
    }, 300);
  }

  static async wrap(operation, message = 'Loading...') {
    const indicator = new LoadingIndicator(message);

    try {
      // Only show indicator if operation takes longer than 100ms
      const showTimeout = setTimeout(() => indicator.show(), 100);

      const result = await operation();

      clearTimeout(showTimeout);

      if (indicator.element) {
        await indicator.hide();
      }

      return result;
    } catch (error) {
      if (indicator.element) {
        await indicator.hide();
      }
      throw error;
    }
  }
}
