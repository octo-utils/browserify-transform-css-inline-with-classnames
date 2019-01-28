/* Created by tommyZZM.OSX on 2019/1/28. */
"use strict";
const path = require("path")
const paramCase = require("param-case")
const md5 = require("./md5")

module.exports = function (className, filename) {
  const fileNameMd5 = md5(filename, 9);
  const fileNameParamCase = paramCase(path.basename(filename))
  return `${fileNameParamCase}_${fileNameMd5}_${className}`;
}
