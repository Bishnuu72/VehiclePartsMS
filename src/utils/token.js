export function parseJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function getUserIdFromToken(token) {
  const payload = parseJwt(token)
  if (!payload) return null
  // JwtSecurityTokenHandler maps ClaimTypes.NameIdentifier → short name "nameid"
  return (
    payload['nameid'] ??
    payload['sub'] ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
    null
  )
}
