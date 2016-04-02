#!/usr/bin/env node

var store = require('data-store')('dev-runner');
var spawn = require('spawn-commands');
var pkgStore = require('pkg-store');
var path = require('path');

var argv = process.argv.slice(2);

// no arguments were passed
if (!argv.length) {
  var output = [
    'Usage:',
    ' # link an application in development',
    ' $ dev link',
    '',
    ' # run a linked app',
    ' $ dev verb'
  ].join('\n');
  console.log(output);
  process.exit();
}

var cmd = argv.shift();

// link an application in development
if (cmd === 'link') {
  var cwd = process.cwd();
  var pkg = pkgStore(cwd);

  // we need a package.json to be able to find the executables
  if (!pkg) {
    throw new Error(`Unable to find "package.json" at "${cwd}"`);
  }

  var name = pkg.get('name');
  var bin = pkg.get('bin');

  // if no executables are found, we shouldn't link
  if (!bin) {
    throw new Error(`Expected "${name}" to have a "bin" property in "package.json"`);
  }

  // bin: './bin/cli.js'
  if (typeof bin === 'string') {
    store.set(name, path.resolve(cwd, bin));
    console.log(`linking "${name}" to "${bin}"`);

  // {
  //  dev: './bin/cli.js'
  // }
  } else if (typeof bin === 'object') {
    Object.keys(bin).forEach(function(key) {
      store.set(key, path.resolve(cwd, bin[key]));
      console.log(`linking "${key}" to "${bin[key]}"`);
    });
  }
  process.exit();
}

var app = store.get(cmd);
if (!app) {
  console.log(`Unable to find linked app "${cmd}"`);
  process.exit();
}

var args = [app].concat(argv);
spawn({cmd: 'node', args: args}, function(err) {
  if (err) return console.error(err);
});
