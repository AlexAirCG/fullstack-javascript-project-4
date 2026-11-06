import { test, expect } from 'vitest'
import { makeFilename, makeResourceFilename } from '../src/utils.js'

test.each([
  ['https://ru.hexlet.io/courses', 'ru-hexlet-io-courses.html'],
  ['https://ru.hexlet.io/courses/', 'ru-hexlet-io-courses.html'],
  ['https://example.com/page?id=1', 'example-com-page-id-1.html'],
  ['https://example.com:8080/a', 'example-com-8080-a.html'],
])('makeFilename(%s)', (url, expected) => {
  expect(makeFilename(url)).toBe(expected)
})

test('makeResourceFilename adds .html when there is no extension', () => {
  expect(makeResourceFilename('https://ru.hexlet.io/courses')).toBe('ru-hexlet-io-courses.html')
})

test('makeResourceFilename keeps the extension', () => {
  expect(makeResourceFilename('https://ru.hexlet.io/assets/professions/nodejs.png')).toBe(
    'ru-hexlet-io-assets-professions-nodejs.png',
  )
})

test('makeResourceFilename limits the length', () => {
  const longUrl = `https://example.com/${'a'.repeat(500)}.png`
  expect(makeResourceFilename(longUrl).length).toBeLessThanOrEqual(255)
})
