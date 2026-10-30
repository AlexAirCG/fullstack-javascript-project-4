import { test, expect } from 'vitest'
import { makeFilename } from '../src/utils.js'

test.each([
  ['https://ru.hexlet.io/courses', 'ru-hexlet-io-courses.html'],
  ['https://ru.hexlet.io/courses/', 'ru-hexlet-io-courses.html'],
  ['https://example.com/page?id=1', 'example-com-page-id-1.html'],
  ['https://example.com:8080/a', 'example-com-8080-a.html'],
])('makeFilename(%s)', (url, expected) => {
  expect(makeFilename(url)).toBe(expected)
})
