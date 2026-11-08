import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'
import debug from 'debug'
import axiosDebugLog from 'axios-debug-log'
import Listr from 'listr'
import { makeFilename, makeResourceFilename } from './utils.js'

axiosDebugLog.addLogger(axios, debug('axios'))
const log = debug('page-loader')
const logSkip = debug('page-loader:skip')

const download = (url, options) =>
  axios.get(url, options).catch((error) => {
    const reason = error.response?.status || error.message
    throw new Error(`Failed to download ${url}: ${reason}`)
  })

const parseUrl = (urlString) => {
  try {
    return new URL(urlString)
  } catch {
    throw new Error(`Invalid URL: ${urlString}`)
  }
}

const checkOutputDir = (dir) =>
  fs
    .stat(dir)
    .catch(() => {
      throw new Error(`Output directory does not exist: ${dir}`)
    })
    .then((stats) => {
      if (!stats.isDirectory()) {
        throw new Error(`Output path is not a directory: ${dir}`)
      }
    })

const fsReasons = {
  EACCES: 'permission denied',
  EPERM: 'operation not permitted',
  ENOENT: 'no such file or directory',
}

const wrapFsError = (error) => {
  const reason = fsReasons[error.code] || error.message
  throw new Error(`Cannot write to ${error.path}: ${reason}`)
}

const loadPage = (urlString, outputDir = process.cwd()) => {
  log('start: %s', urlString)
  const fileName = makeFilename(urlString)
  const fullPath = path.join(outputDir, fileName)
  const resourcesDirName = fileName.replace(/\.html$/, '_files')
  const resourcesDirPath = path.join(outputDir, resourcesDirName)
  const resources = []
  let $

  return Promise.resolve()
    .then(() => parseUrl(urlString))
    .then(() => checkOutputDir(outputDir))
    .then(() => download(urlString))
    .then((response) => {
      $ = cheerio.load(response.data)
      log('page downloaded, status: %d', response.status)

      const pageHost = new URL(urlString).host

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
    .then(() => fs.mkdir(resourcesDirPath, { recursive: true }).catch(wrapFsError))
    .then(() => {
      const tasks = resources.map(({ resourceUrl, resourceFilename }) => ({
        title: resourceUrl.toString(),
        task: () =>
          download(resourceUrl, { responseType: 'arraybuffer' }).then((response) => {
            log('downloaded %s -> %s', resourceUrl, resourceFilename)
            return fs
              .writeFile(path.join(resourcesDirPath, resourceFilename), response.data)
              .catch(wrapFsError)
          }),
      }))
      return new Listr(tasks, { concurrent: true }).run()
    })
    .then(() => fs.writeFile(fullPath, $.html()).catch(wrapFsError))
    .then(() => {
      log('page saved: %s', fullPath)
      return fullPath
    })
}

export default loadPage
