import { test, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import nock from 'nock'
import loadPage from '../src/index.js'

const baseUrl = 'https://ru.hexlet.io'
const pagePath = '/courses'
const fullPath = `${baseUrl}${pagePath}`

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

  const resultFilePath = await loadPage(fullPath, tmpDir)

  const expectedFileName = 'ru-hexlet-io-courses.html'
  const expectedFilePath = path.join(tmpDir, expectedFileName)

  expect(resultFilePath).toBe(expectedFilePath)

  const savedContent = await fs.readFile(resultFilePath, 'utf8')
  expect(savedContent).toBe(expectedContent)
})

test('rejects on 404', async () => {
  nock(baseUrl).get(pagePath).reply(404)
  await expect(loadPage(fullPath, tmpDir)).rejects.toThrow()
})
