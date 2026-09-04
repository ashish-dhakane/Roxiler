export function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="message error-message">{message}</div>;
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return <div className="message success-message">{message}</div>;
}
