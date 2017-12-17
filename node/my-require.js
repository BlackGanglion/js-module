// https://github.com/nodejs/node/blob/v6.9.4/lib/module.js
// http://www.ruanyifeng.com/blog/2015/05/require.html
// https://xcoder.in/2015/11/27/a-js-problem-about-global-continued/#Module-prototype-compile

const nodePath = require('path');
const fs = require('fs');
const vm = require('vm');

const NativeModule = {};

NativeModule.wrap = function(script) {
  return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
};

NativeModule.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];

class MyModule {
  static _load(path) {
    const filename = MyModule._resolveFilename(path);

    const cachedModule = MyModule._cache[filename];
    if (cachedModule) {
      return cachedModule.exports;
    }

    const module = new MyModule(filename);

    MyModule._cache[filename] = module;

    tryModuleLoad(module, filename);
    
    return module.exports;
  }
  static _resolveFilename(path) {
    const resolvedModule = MyModule._resolveLookupPaths(path);
    const id = resolvedModule[0];
    const paths = resolvedModule[1];

    const filename = MyModule._findPath(path, paths);
    return filename;
  }
  // 生成 id 与可能的所有路径
  static _resolveLookupPaths(path) {
    // 暂不考虑 node_modules 与 系统模块
    const mainPaths = ['.'];
    return [path, mainPaths];
  }
  static _findPath(path, paths) {
    const basePath = nodePath.resolve(path, paths[0]);
    const exts = Object.keys(MyModule._extensions);
    const filename = tryExtensions(basePath, exts);
    return filename;
  }

  constructor(id) {
    this.id = id;
    this.exports = {};
  }

  load(filename) {
    const extension = nodePath.extname(filename);
    MyModule._extensions[extension](this, filename);
  }

  _compile(content, filename) {
    const wrapper = NativeModule.wrap(content);

    // 在 vm 中运行
    const compiledWrapper = vm.runInThisContext(wrapper, {
      filename: filename,
      lineOffset: 0,
      displayErrors: true
    });

    const dirname = nodePath.dirname(filename);

    // 这个 require 是给 require 的模块用的
    const require = makeRequireFunction.call(this);
    const args = [this.exports, require, this, filename, dirname];

    compiledWrapper.apply(this.exports, args);
  }

  require(path) {
    return MyModule._load(path);
  }
}

// 模块 cache
MyModule._cache = {};
// 扩展名
MyModule._extensions = {};

// 目前只针对 JS
MyModule._extensions['.js'] = function(module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module._compile(stripBOM(content), filename);
};

function MyRequire(path) {
  return MyModule._load(path);
}

function tryExtensions(p, exts) {
  for (let i = 0; i < exts.length; i++) {
    const filename = tryFile(p + exts[i]);
    if (filename) {
      return filename;
    }
  }
  return false;
}

function tryFile(requestPath) {
  // 得不到就会直接抛错，为何 node 中不会直接抛错，需要深入看实现
  return fs.realpathSync(requestPath);
}

function tryModuleLoad(module, filename) {
  let threw = true;
  try {
    module.load(filename);
    threw = false;
  } finally {
    if (threw) {
      delete MyModule._cache[filename];
    }
  }
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

// Invoke with makeRequireFunction.call(module) where |module| is the
// Module object to use as the context for the require() function.
function makeRequireFunction() {
  const Module = this.constructor;
  const self = this;

  function require(path) {
    return self.require(path);
  }

  /*
  function resolve(request) {
    return Module._resolveFilename(request, self);
  }

  require.resolve = resolve;

  require.main = process.mainModule;

  // Enable support to add extra extension types.
  require.extensions = Module._extensions;
  */

  require.cache = MyModule._cache;

  return require;
}

const common1 = MyRequire('./common-1');
const common2 = MyRequire('./common-1');

console.log(common1, common2);

console.log(common1.b());

const common3 = MyRequire('./common-1');
console.log(common3);
