export function ErrorState({ message = 'Something went wrong.' }) {
  return <p role="alert" className="feedback feedback-error">{message}</p>;
}
