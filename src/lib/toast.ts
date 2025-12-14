import { toast as sonnerToast } from "sonner";

// Track toast counts and timers for deduplication
const toastCounts = new Map<string, number>();
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Reset count after 5 seconds of no duplicates
const RESET_DELAY = 5000;

interface ToastOptions {
  description?: string;
  duration?: number;
  id?: string;
}

function getToastId(message: string, type: string): string {
  return `${type}-${message}`;
}

function showToastWithCount(
  type: "success" | "error" | "info" | "warning",
  message: string,
  options: ToastOptions = {}
) {
  const toastId = options.id || getToastId(message, type);

  // Clear existing timer
  const existingTimer = toastTimers.get(toastId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Increment count
  const currentCount = (toastCounts.get(toastId) || 0) + 1;
  toastCounts.set(toastId, currentCount);

  // Create toast content with count
  const displayMessage =
    currentCount > 1 ? `${message} (×${currentCount})` : message;

  // Show toast with progress bar via duration
  sonnerToast[type](displayMessage, {
    id: toastId,
    description: options.description,
    duration: options.duration || 5000,
  });

  // Set timer to reset count
  const timer = setTimeout(() => {
    toastCounts.delete(toastId);
    toastTimers.delete(toastId);
  }, RESET_DELAY);

  toastTimers.set(toastId, timer);
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    showToastWithCount("success", message, options),

  error: (message: string, options?: ToastOptions) =>
    showToastWithCount("error", message, options),

  info: (message: string, options?: ToastOptions) =>
    showToastWithCount("info", message, options),

  warning: (message: string, options?: ToastOptions) =>
    showToastWithCount("warning", message, options),

  // Custom toast with React content (no deduplication for custom)
  custom: sonnerToast,

  // Promise toast
  promise: sonnerToast.promise,

  // Dismiss toast
  dismiss: sonnerToast.dismiss,
};

export default toast;
