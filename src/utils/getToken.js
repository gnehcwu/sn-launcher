/**
 * Extracts the token from the current document or nested iframes.
 * @returns {string|null} The token or null if not found.
 */
export default function getToken() {
  const tokenPattern = /(?:<script[^>]*>[\s\S]*?)?g_ck\s*=\s*['"]([^'"]+)['"]/i;

  try {
    // Try to extract token from outside document
    const documentText = document.body.textContent + document.head.textContent;
    const matched = documentText.match(tokenPattern);
    if (matched && matched[1]) {
      return matched[1];
    }

    // Extract token from nested iframes
    const frames = document.querySelectorAll('iframe');
    for (const frame of frames) {
      if (!frame.contentWindow || !frame.contentWindow.document) {
        continue;
      }
      const documentText = frame.contentWindow.document.head.textContent;
      const matched = documentText.match(tokenPattern);
      if (matched && matched[1]) {
        return matched[1];
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}
