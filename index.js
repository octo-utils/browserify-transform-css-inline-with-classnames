/* Created by tommyZZM.OSX on 2019/1/28. */
"use strict";
const path = require("path")
const through = require("through2")
const postcss = require('postcss')
const minimatch = require("minimatch")
const renameDefault = require("./lib/rename-default")
const postcssPluginRenameClassnames = require("./lib/post-css-plugin-rename-classnames")

function _noopReader(content, _, __) { return Promise.resolve(content.toString()) }

function _moduleTemplateDefault(css, classNamesMapping) {
  return `
exports.cssText = ${JSON.stringify(css)};
exports.classNamesMapping = ${JSON.stringify(classNamesMapping)};
`.trim()
}

module.exports = function(filename, opts) {

  const {
    reader,
    postcssPlugins = [],
    rename = renameDefault,
    jsModuleTemplate = _moduleTemplateDefault
  } = opts;

  const reader_ = {
    "*.css": _noopReader,
    ...reader,
  };

  const matchedKey = Object.keys(reader_).find(pattern => minimatch(filename, pattern, {
    matchBase: true
  }));

  const matchedReader = reader_[matchedKey];

  if (typeof matchedReader !== "function") { return through(); }

  let merged = Buffer.from("");

  return through(function(buf, _, next) {
    merged = Buffer.concat([merged, buf]);
    next(null);
  }, async function (flush) {
    const emitFile = filepath => this.emit("file", filepath);
    const contentRead = await matchedReader(merged, filename, emitFile);
    const result = await postcss([postcssPluginRenameClassnames({
      rename: className => rename(className, filename)
    }), ...postcssPlugins])
      .process(contentRead, { from: filename });
    const { css, classNamesMapping } = result;
    this.push(jsModuleTemplate(css, classNamesMapping, filename));
    flush();
  })
}
