import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { makeFilename, makeResourceFilename } from './utils.js'

const loadPage = (urlString, outputDir = process.cwd()) => {
  const fileName = makeFilename(urlString)
  const fullPath = path.join(outputDir, fileName)
  const resourcesDirName = fileName.replace(/\.html$/, '_files')
  const resourcesDirPath = path.join(outputDir, resourcesDirName)
  const images = []
  let $

  return axios(urlString)
    .then((response) => {
      $ = cheerio.load(response.data)
      $('img').each((_, element) => {
        const src = $(element).attr('src')
        const imageUrl = new URL(src, urlString).toString()
        const resourceFilename = makeResourceFilename(imageUrl)

        images.push({ imageUrl, resourceFilename })
        $(element).attr('src', `${resourcesDirName}/${resourceFilename}`)
      })
    })
    .then(() => fs.mkdir(resourcesDirPath, { recursive: true }))
    .then(() => {
      Promise.all(
        images.map(({ imageUrl, resourceFilename }) =>
          axios
            .get(imageUrl, { responseType: 'arraybuffer' })
            .then((response) =>
              fs.writeFile(path.join(resourcesDirPath, resourceFilename), response.data),
            ),
        ),
      )
    })
    .then(() => fs.writeFile(fullPath, $.html()))
    .then(() => fullPath)
}

export default loadPage
