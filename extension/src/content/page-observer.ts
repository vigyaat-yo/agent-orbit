export function observePage(scan: () => void): MutationObserver {
  let timer: number | undefined;
  const observer = new MutationObserver(() => { window.clearTimeout(timer); timer = window.setTimeout(scan, 150); });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
