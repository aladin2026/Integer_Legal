export function announceAction(message: string) {
  window.dispatchEvent(new CustomEvent("integer-action", { detail: message }));
}
