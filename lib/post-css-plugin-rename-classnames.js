/* Created by tommyZZM.OSX on 2019/1/28. */
"use strict";
const postcss = require("postcss")
const parser = require('postcss-selector-parser');

const SCOPE = {
  DEFAULT: 'default',
  GLOBAL: ':global',
  LOCAL: ':local'
}

function _renameSelectors(selectors, renameFn) {
  return selectors.map(selector => parser(
    sels => sels.map(sel => _renameNodes(sel.nodes, renameFn))).processSync(selector)
  );
}

function getCurrentNodeScope(node) {
  let shouldContinue = true;
  let prev = node.prev();
  let result = ':default';
  while (shouldContinue && prev)  {
    if (prev.type === 'pseudo' &&
      (prev.value === ':global' || prev.value === ':local')) {
      result = prev.value;
      const combinator = prev.next();
      prev.remove();
      if (combinator.type === 'combinator') {
        combinator.remove()
      }
      shouldContinue = false;
      break;
    }
    prev = prev.prev();
  }
  return result;
}

function _renameNodes(nodes, renameFn) {
  return nodes.map(node => {
    // console.log(node.type);
    if (node.type === 'class') {
      const nodeScope = getCurrentNodeScope(node);
      node.value = renameFn(node.value, nodeScope);
    } else if (node.type === 'pseudo' && node.value === ':not') {
      _renameNodes(node.nodes);
    } else if (node.type === 'selector') {
      _renameNodes(node.nodes);
    } else {
      getCurrentNodeScope(node);
    }
  })
}

module.exports = postcss.plugin('__postcss-css-plugin-rename-classnames', opts => {
  const { rename } = opts;
  return (root, result) => {
    const classNamesMapping = {};
    // Transform CSS AST here
    root.walkRules(function (rule) {
      // console.log(rule.selectors);
      rule.selectors = _renameSelectors(rule.selectors, function (classNameLast, scope) {
        if (scope === SCOPE.GLOBAL) {
          classNamesMapping[classNameLast] = classNameLast;
          return classNameLast
        }
        const classNameNext = rename(classNameLast);
        if (!classNameNext) {
          // TODO: warning rename function return empty value, expected string for a className
          return classNameLast;
        }
        classNamesMapping[classNameLast] = classNameNext;
        return classNameNext;
      });
    });
    result.classNamesMapping = classNamesMapping;
  };
});
