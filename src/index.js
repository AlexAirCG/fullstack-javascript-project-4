const urlToFilename = (filepath) => {
  const clearUrl = filepath
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+$/, '')
  return `${clearUrl}.html`
}

export { urlToFilename }
