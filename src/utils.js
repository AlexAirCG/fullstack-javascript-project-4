export const makeFilename = (urlString) => {
  const withoutProtocol = urlString.replace(/^https?:\/\//, '')
  const normalized = withoutProtocol.replace(/[^A-Za-z0-9]/g, '-')
  const trimmed = normalized.replace(/-+$/, '')
  return `${trimmed}.html`
}
