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
  const pageHost = new URL(urlString).host
  const resources = []
  let $

  return axios(urlString)
    .then((response) => {
      $ = cheerio.load(response.data)

      const collectResources = (tag, attribute) => {
        $(tag).each((_, element) => {
          const value = $(element).attr(attribute)

          if (!value) return

          const resourceUrl = new URL(value, urlString)

          if (resourceUrl.host !== pageHost) return

          const resourceFilename = makeResourceFilename(resourceUrl.toString())
          $(element).attr(attribute, `${resourcesDirName}/${resourceFilename}`)
          resources.push({ resourceUrl, resourceFilename })
        })
      }

      collectResources('img', 'src')
      collectResources('link', 'href')
      collectResources('script', 'src')
    })
    .then(() => fs.mkdir(resourcesDirPath, { recursive: true }))
    .then(() =>
      Promise.all(
        resources.map(({ resourceUrl, resourceFilename }) =>
          axios
            .get(resourceUrl, { responseType: 'arraybuffer' })
            .then((response) =>
              fs.writeFile(path.join(resourcesDirPath, resourceFilename), response.data),
            ),
        ),
      ),
    )
    .then(() => fs.writeFile(fullPath, $.html()))
    .then(() => fullPath)
}

export default loadPage
