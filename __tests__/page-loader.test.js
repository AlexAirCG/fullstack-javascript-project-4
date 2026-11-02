import { test, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import nock from 'nock'
import * as cheerio from 'cheerio'
import loadPage from '../src/index.js'

const getFixtureFile = (filename) => path.join(import.meta.dirname, '__fixtures__', filename)

const baseUrl = 'https://ru.hexlet.io'
const pagePath = '/courses'
const fullUrl = `${baseUrl}${pagePath}`

let tmpDir

beforeEach(async () => {
  nock.disableNetConnect()
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
})

afterEach(async () => {
  nock.cleanAll()
  nock.enableNetConnect()
  await fs.rm(tmpDir, { recursive: true, force: true })
})

test('loadPage', async () => {
  const expectedContent = '<html><body>Hello Hexlet!</body></html>'

  nock(baseUrl).get(pagePath).reply(200, expectedContent)

  const resultFilePath = await loadPage(fullUrl, tmpDir)

  const expectedFileName = 'ru-hexlet-io-courses.html'
  const expectedFilePath = path.join(tmpDir, expectedFileName)

  expect(resultFilePath).toBe(expectedFilePath)

  const savedContent = await fs.readFile(resultFilePath, 'utf8')
  expect(cheerio.load(savedContent).html()).toBe(cheerio.load(expectedContent).html())
})

test('rejects on 404', async () => {
  nock(baseUrl).get(pagePath).reply(404)
  await expect(loadPage(fullUrl, tmpDir)).rejects.toThrow()
})

test('downloads images and replaces links in html', async () => {
  const beforeHTML = await fs.readFile(getFixtureFile('before.html'), 'utf-8')
  const afterHTML = await fs.readFile(getFixtureFile('after.html'), 'utf-8')
  const imageBuffer = await fs.readFile(getFixtureFile('nodejs.png'))

  nock(baseUrl).get(pagePath).reply(200, beforeHTML)
  nock(baseUrl).get('/assets/professions/nodejs.png').reply(200, imageBuffer)

  const resultFilePath = await loadPage(fullUrl, tmpDir)

  const savedHtml = await fs.readFile(resultFilePath, 'utf-8')
  expect(cheerio.load(savedHtml).html()).toBe(cheerio.load(afterHTML).html())

  const imagePath = path.join(
    tmpDir,
    'ru-hexlet-io-courses_files',
    'ru-hexlet-io-assets-professions-nodejs.png',
  )
  const savedImage = await fs.readFile(imagePath)
  expect(savedImage).toEqual(imageBuffer)
})
