export default function isUserTyping() {
  const { activeElement } = document;
  if (!activeElement) return false;
  return (
    activeElement.role === 'textbox' ||
    (activeElement instanceof HTMLInputElement && activeElement.type === 'text') ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement.getAttribute('contenteditable') === 'true'
  );
}
