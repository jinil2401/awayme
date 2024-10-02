export function isRouteProtected(url: string) {
  if (url.includes("/api/users")) {
    return true;
  }
  return false;
}
