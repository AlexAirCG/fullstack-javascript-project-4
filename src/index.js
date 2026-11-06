import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'
import debug from 'debug'
import axiosDebugLog from 'axios-debug-log'
import { makeFilename, makeResourceFilename } from './utils.js'

axiosDebugLog.addLogger(axios, debug('axios'))
const log = debug('page-loader')
const logSkip = debug('page-loader:skip')

const loadPage = (urlString, outputDir = process.cwd()) => {
  log('start: %s', urlString)
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
      log('page downloaded, status: %d', response.status)

      const collectResources = (tag, attribute) => {
        $(tag).each((_, element) => {
          const value = $(element).attr(attribute)

          if (!value) return

          const resourceUrl = new URL(value, urlString)

          if (resourceUrl.host !== pageHost) {
            logSkip('%s (another host)', resourceUrl)
            return
          }

          const resourceFilename = makeResourceFilename(resourceUrl.toString())
          $(element).attr(attribute, `${resourcesDirName}/${resourceFilename}`)
          resources.push({ resourceUrl, resourceFilename })
        })
      }

      collectResources('img', 'src')
      collectResources('link', 'href')
      collectResources('script', 'src')

      log('found %d resources to download', resources.length)
    })
    .then(() => fs.mkdir(resourcesDirPath, { recursive: true }))
    .then(() =>
      Promise.all(
        resources.map(({ resourceUrl, resourceFilename }) =>
          axios.get(resourceUrl, { responseType: 'arraybuffer' }).then((response) => {
            log('downloaded %s -> %s', resourceUrl, resourceFilename)
            return fs.writeFile(path.join(resourcesDirPath, resourceFilename), response.data)
          }),
        ),
      ),
    )
    .then(() => fs.writeFile(fullPath, $.html()))
    .then(() => {
      log('page saved: %s', fullPath)
      return fullPath
    })
}

export default loadPage
