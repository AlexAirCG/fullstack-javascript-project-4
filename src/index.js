import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import { makeFilename } from './utils.js'

const loadPage = (urlString, outputDir = process.cwd()) => {
  const fileName = makeFilename(urlString)
  const fullPath = path.join(outputDir, fileName)
  return axios(urlString)
    .then((response) => fs.writeFile(fullPath, response.data))
    .then(() => fullPath)
}

export default loadPage
