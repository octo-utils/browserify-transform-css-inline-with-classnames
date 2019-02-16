/* Created by tommyZZM.OSX on 2019/1/28. */
"use strict";
// const { complement } = require("ramda")
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

function _isScopedPseudo(node) {
  return node.value === ':global' || node.value === ':local'
}

function _getNextNodesNotScopedPseudo(node) {
  let next = node.next();
  let result = [];
  while (next && !_isScopedPseudo(next)) {
    result.push(next);
    next = next.next();
  }
  return result;
}

function _renameNodes(nodes, renameFn, scoped = null) {

  let nodesToRemove = [];

  let currentScope = scoped;

  const done = nodes.map(node => {
    // console.log(node.type);
    if (node.type === 'class') {
      node.value = renameFn(node.value, currentScope);
    } else if (node.type === 'pseudo') {
      if (_isScopedPseudo(node)) {
        currentScope = node.value;
        nodesToRemove.push(node);
        const mayBeCombinator = node.next();
        if (mayBeCombinator && mayBeCombinator.type === 'combinator') {
          nodesToRemove.push(mayBeCombinator);
        }

        if (node.nodes.length > 0) {
          const [ s ] = node.nodes;
          _renameNodes(s.nodes, renameFn, node.value);
          node.replaceWith(s);
        }
      } else {
        _renameNodes(node.nodes, renameFn);
      }
    } else if (node.type === 'selector') {
      _renameNodes(node.nodes, renameFn);
    } else {

    }
  });

  nodesToRemove.forEach(node => node.remove());

  return done;
}

module.exports = postcss.plugin('__postcss-css-plugin-rename-classnames', opts => {
  const { rename } = opts;
  return (root, result) => {
    const classNamesMapping = {};
    // Transform CSS AST here
    root.walkRules(function (rule) {
      // console.log(rule.selectors);
      rule.selectors = _renameSelectors(rule.selectors, function (classNameLast, scope) {
        // console.log('rename', classNameLast, scope, scope === SCOPE.GLOBAL, SCOPE.GLOBAL)
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
