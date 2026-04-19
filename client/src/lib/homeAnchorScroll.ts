const HOME_SCROLL_ANCHOR_KEY = "aura_home_scroll_anchor";

export function requestHomeScrollTo(elementId: string): void {
  sessionStorage.setItem(HOME_SCROLL_ANCHOR_KEY, elementId);
}

export function consumeHomeScrollAnchor(): string | null {
  const v = sessionStorage.getItem(HOME_SCROLL_ANCHOR_KEY);
  if (v) sessionStorage.removeItem(HOME_SCROLL_ANCHOR_KEY);
  return v;
}
