# browserify-transform-css-inline-with-classnames

a [browserify](https://github.com/browserify/browserify) transform for importing css as module with `cssText` and `classNamesMapping`.

classNames without :global declaration would be rename by appending hash string.

### Options

- `reader`:`Function | (content, filename) => Promise<string>`:
    reader function for pre-solve the target style file. if you want to using this transform with `less` or `sass` or other extension language of CSS. you can provide a customize reader function by this option. compile the content in to normal css string.

- `postcssPlugins`:`Function | Function[]`:
    postcss plugin list for the internal postcss. if you are using postcss plugin like `autoprefixer`, simply put it here.

- `rename`:`Function | (className, filename) => string`:
    custom rename function for renaming the classNames. default using [lib/rename-default.js](lib/rename-default.js) to rename the classNames.

### Example

**build script**
```javascript
const b = browserify({
  entries: "./src/entry.js"
}).transform(transformScss, {
  postcssPlugins: [ autoprefixer ]
})
```

**./src/entry.js**
```javascript
const { cssText, classNamesMapping } = require('./style.css');

console.log(cssText); // ".some-style {\n width: 100px;\n }"
console.log(classNamesMapping); // { 'some-style': 'style-css_cb2afaabb_some-style' }
```

**./src/style.css**
```css
.some-style {
  width: 100px;
}
```

### Similarly Modules

- https://github.com/webpack-contrib/css-loader
- https://github.com/css-modules/postcss-modules
- https://github.com/ctxhou/postcss-hash-classname