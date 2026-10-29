import { test, expect } from 'vitest'
import { urlToFilename } from '../src/index.js'

test('urlToFilename', () => {
  expect(urlToFilename('https://ru.hexlet.io/courses'))
    .toBe('ru-hexlet-io-courses.html')
  expect(urlToFilename('http://example.com/a_b?id=1'))
    .toBe('example-com-a-b-id-1.html')
})
