import path from 'path'

const slugify = (urlString) =>
  urlString
    .replace(/^https?:\/\//, '')
    .replace(/[^A-Za-z0-9]/g, '-')
    .replace(/-+$/, '')

export const makeFilename = (urlString) => {
  return `${slugify(urlString)}.html`
}

export const makeResourceFilename = (urlString) => {
  const extension = path.extname(urlString)
  const withoutExtension = urlString.slice(0, urlString.length - extension.length)
  return `${slugify(withoutExtension).slice(-200)}${extension}`
}
