#!/usr/bin/env node

'use strict'

const notifier = require('./')

const aliases = {
  title: 't',
  subtitle: 'st',
  message: 'm',
  icon: 'i',
  sound: 's',
  open: 'o'
}

const program = require('commander')

program
  .usage(`
$ notify -t "Hello" -m "My Message" -s --open http://github.com
$ notify -t "Agent Coulson" --icon https://raw.githubusercontent.com/mikaelbr/node-notifier/master/example/coulson.jpg
$ notify -m "My Message" -s Glass
$ echo "My Message" | notify -t "Hello"
`)
  // .help('h')
  // .string(['icon', 'message', 'open', 'subtitle', 'title'])

Object.keys(aliases).forEach(key => program.option(`-${aliases[key]}, --${key}`, key))

const argv = program.parse(process.argv)

const passedOptions = getOptionsIfExists(Object.keys(aliases), argv)
let stdinMessage = ''

process.stdin.on('readable', function () {
  let chunk = this.read()
  if (!chunk && !stdinMessage) {
    doNotification(passedOptions)
    this.end()
    return
  }
  if (!chunk) {
    return
  }
  stdinMessage += chunk.toString()
})

process.stdin.on('end', function () {
  if (stdinMessage) {
    passedOptions.message = stdinMessage
  }
  doNotification(passedOptions)
})

function doNotification (options) {

  if (!options.message) {
    // Do not show an empty message
    process.exit(0)
  }
  notifier.notify(options, function (err, msg) {
    if (err) {
      console.error(err.message)
      process.exit(1)
    }

    if (!msg) {
      return
    }
    console.log(msg)
    process.exit(0)
  })

}

function getOptionsIfExists (optionTypes, argv) {
  let options = {}
  optionTypes.forEach(function (key) {
    if (key && argv[key]) {
      options[key] = argv[key]
    }
  })
  return options
}
