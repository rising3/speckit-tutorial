export class Toast {
  static container = null;

  static init() {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.className = 'toast-container';
      Toast.container.setAttribute('role', 'status');
      Toast.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(Toast.container);
    }
  }

  static show(message, type = 'info', duration = 3000) {
    Toast.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');

    Toast.container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto-hide
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
  }

  static error(message, duration = 5000) {
    return Toast.show(message, 'error', duration);
  }

  static success(message, duration = 3000) {
    return Toast.show(message, 'success', duration);
  }

  static info(message, duration = 3000) {
    return Toast.show(message, 'info', duration);
  }

  static warning(message, duration = 4000) {
    return Toast.show(message, 'warning', duration);
  }
}
