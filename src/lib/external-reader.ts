const allowedTags = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'figcaption',
  'figure',
  'h2',
  'h3',
  'h4',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]);

const removedTags = new Set([
  'button',
  'embed',
  'form',
  'iframe',
  'input',
  'math',
  'object',
  'script',
  'select',
  'style',
  'svg',
  'textarea',
  'video',
]);

function safeUrl(value: string, baseUrl: string, allowedProtocols: string[]): string | undefined {
  try {
    const url = new URL(value, baseUrl);
    return allowedProtocols.includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function sanitizedNode(node: Node, baseUrl: string): Node | undefined {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return undefined;

  const source = node as HTMLElement;
  const tag = source.tagName.toLowerCase();
  if (removedTags.has(tag)) return undefined;

  const target: Node = allowedTags.has(tag)
    ? document.createElement(tag)
    : document.createDocumentFragment();

  if (target instanceof HTMLAnchorElement) {
    const href = safeUrl(source.getAttribute('href') ?? '', baseUrl, ['https:', 'mailto:']);
    if (href) {
      target.href = href;
      target.target = '_blank';
      target.rel = 'noopener noreferrer';
    }
    const title = source.getAttribute('title');
    if (title) target.title = title;
  }

  if (target instanceof HTMLImageElement) {
    const src = safeUrl(source.getAttribute('src') ?? '', baseUrl, ['https:']);
    if (!src) return undefined;
    target.src = src;
    target.alt = source.getAttribute('alt') ?? '';
    target.loading = 'lazy';
    target.referrerPolicy = 'no-referrer';
    const title = source.getAttribute('title');
    if (title) target.title = title;
  }

  for (const child of source.childNodes) {
    const sanitized = sanitizedNode(child, baseUrl);
    if (sanitized) target.appendChild(sanitized);
  }
  return target;
}

/** Render only a small, explicit HTML allowlist from a provider-owned article. */
export function renderSanitizedExternalHtml(
  target: HTMLElement,
  html: string,
  baseUrl: string,
): void {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const fragment = document.createDocumentFragment();
  for (const node of parsed.body.childNodes) {
    const sanitized = sanitizedNode(node, baseUrl);
    if (sanitized) fragment.appendChild(sanitized);
  }
  if (!fragment.childNodes.length) throw new Error('Provider article has no renderable body.');
  target.replaceChildren(fragment);
}
