#!/usr/bin/env node

import { Command } from 'commander'
import loadPage from '../src/index.js'

const program = new Command()

program
  .name('page-loader')
  .description('Page loader utility')
  .version('1.0.0')
  .option('-o, --output <dir>', 'output directory', process.cwd())
  .argument('<url>')
  .action((url, options) => {
    loadPage(url, options.output)
      .then((filePath) => {
        console.log(filePath)
      })
      .catch((error) => {
        console.error(error.message)
        process.exit(1)
      })
  })

program.parse(process.argv)
