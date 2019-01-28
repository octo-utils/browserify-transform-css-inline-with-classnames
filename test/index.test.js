/* Created by tommyZZM.OSX on 2019/1/28. */
"use strict";
const path = require("path")
const through = require("through2")
const browserify = require("browserify")
const { expect } = require("chai");
const autoprefixer = require("autoprefixer")
const sass = require("node-sass")
const sassPackageImporter = require('node-sass-package-importer');
const sassOnceImporter = require('node-sass-once-importer');
const transformScss = require("../")

function _scssReader(_, filename) {
  return Promise.resolve(sass.renderSync({
    file: filename,
    importer: [
      sassPackageImporter({
        packageKeys: ['sass', 'scss', 'css'],
        packagePrefix: '~'
      }),
      sassOnceImporter()
    ]
  }).css)
}

describe('test', function () {
  it('index',function (done) {
    const b = browserify({
      entries: path.join(__dirname, "./fixtures/entry1.js"),
    }).transform(transformScss, {
      reader: {
        "*.scss": _scssReader
      },
      postcssPlugins: [ autoprefixer ]
    })

    b.bundle().on("end", _ => {
      done();
    }).pipe(through((buf, _, next) => {
      // console.log(buf.toString())
      next();
    }));
  })
})