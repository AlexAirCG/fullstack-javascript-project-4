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
  await fs.chmod(tmpDir, 0o755)
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

test('rejects when url is not a string', async () => {
  await expect(loadPage(undefined, tmpDir)).rejects.toThrow()
})

test('rejects on 404', async () => {
  nock(baseUrl).get(pagePath).reply(404)
  await expect(loadPage(fullUrl, tmpDir)).rejects.toThrow()
})

test('page 404 mentions the url', async () => {
  nock(baseUrl).get(pagePath).reply(404)
  await expect(loadPage(fullUrl, tmpDir)).rejects.toThrow(fullUrl)
})

test('rejects with the page url in the message on network error', async () => {
  nock(baseUrl).get(pagePath).replyWithError('network error')
  await expect(loadPage(fullUrl, tmpDir)).rejects.toThrow(fullUrl)
})

test('rejects with the resource url in the message when a resource fails', async () => {
  const html = '<html><head><link rel="stylesheet" href="/missing.css"></head></html>'
  nock(baseUrl).get(pagePath).reply(200, html)
  nock(baseUrl).get('/missing.css').reply(404)
  await expect(loadPage(fullUrl, tmpDir)).rejects.toThrow('/missing.css')
})

test('rejects when the output directory does not exist', async () => {
  const missingDir = path.join(tmpDir, 'no-such-dir')
  nock(baseUrl).get(pagePath).reply(200, '<html></html>')
  await expect(loadPage(fullUrl, missingDir)).rejects.toThrow(missingDir)
})

test('rejects on an invalid url', async () => {
  await expect(loadPage('not a url', tmpDir)).rejects.toThrow()
})

test('downloads resources and replaces links in html', async () => {
  const beforeHtml = await fs.readFile(getFixtureFile('before.html'), 'utf-8')
  const afterHtml = await fs.readFile(getFixtureFile('after.html'), 'utf-8')
  const imageBuffer = await fs.readFile(getFixtureFile('nodejs.png'))
  const css = await fs.readFile(getFixtureFile('application.css'), 'utf-8')
  const js = await fs.readFile(getFixtureFile('runtime.js'), 'utf-8')

  nock(baseUrl).get(pagePath).twice().reply(200, beforeHtml)
  nock(baseUrl).get('/assets/professions/nodejs.png').reply(200, imageBuffer)
  nock(baseUrl).get('/assets/application.css').reply(200, css)
  nock(baseUrl).get('/packs/js/runtime.js').reply(200, js)

  const resultFilePath = await loadPage(fullUrl, tmpDir)

  const savedHtml = await fs.readFile(resultFilePath, 'utf-8')
  expect(cheerio.load(savedHtml).html()).toBe(cheerio.load(afterHtml).html())

  const filesDir = path.join(tmpDir, 'ru-hexlet-io-courses_files')
  const savedImage = await fs.readFile(
    path.join(filesDir, 'ru-hexlet-io-assets-professions-nodejs.png'),
  )
  const savedCss = await fs.readFile(
    path.join(filesDir, 'ru-hexlet-io-assets-application.css'),
    'utf-8',
  )
  const savedJs = await fs.readFile(
    path.join(filesDir, 'ru-hexlet-io-packs-js-runtime.js'),
    'utf-8',
  )
  const savedCanonical = await fs.readFile(
    path.join(filesDir, 'ru-hexlet-io-courses.html'),
    'utf-8',
  )

  expect(savedImage).toEqual(imageBuffer)
  expect(savedCss).toBe(css)
  expect(savedJs).toBe(js)
  expect(savedCanonical).toBe(beforeHtml)
})

test.skipIf(process.getuid() === 0)(
  'rejects with a clear message when the directory is not writable',
  async () => {
    nock(baseUrl).get(pagePath).reply(200, '<html></html>')
    await fs.chmod(tmpDir, 0o555)
    await expect(loadPage(fullUrl, tmpDir)).rejects.toThrow(`Cannot write to ${tmpDir}`)
  },
)
