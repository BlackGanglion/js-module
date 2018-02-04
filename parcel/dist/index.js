// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// entry 是入口模块
require = (function(modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    // 是否能从 Catch 中查找到这个模块，如果能返回 cache[name].exports
    if (!cache[name]) {
      // 当前无法找到该模块
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === 'function' && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      function localRequire(x) {
        return newRequire(localRequire.resolve(x));
      }

      localRequire.resolve = function (x) {
        // 获取 require 的编号
        return modules[name][1][x] || x;
      };

      // module 是 Module 的实例化
      // 思考：如果是循环依赖会怎么样？cache 中已存在，但 exports 没有相应值而发送报错
      var module = (cache[name] = new newRequire.Module());
      // modules[name][0] 代表模块真实的函数
      modules[name][0].call(
        module.exports,
        localRequire,    // require 
        module,          // module
        // 模块的结果会通过引用到这里 = cache[name].exports
        module.exports   // exports
      );
    }

    // 有 catch 直接返回，没有就需要处理一下
    return cache[name].exports;
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})(
  {
    5: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: !0 });
        const e = 1;
        // default 以这种形式导出
        exports.default = 1;
      },
      {}
    ],
    3: [
      function(require, module, exports) {
        'use strict';
        function e(e) {
          return e && e.__esModule ? e : { default: e };
        }
        Object.defineProperty(exports, '__esModule', { value: !0 }),
          (exports.c = exports.b = exports.a = void 0);
        var t = require('./main-2'),
          r = e(t);
        const o = 1,
          s = function() {
            return 1;
          };
        (exports.a = 1), (exports.b = s), (exports.c = r.default);
      },
      { './main-2': 5 }
    ],
    1: [
      // 真实代码
      function(require, module, exports) {
        'use strict';
        var r = require('./main');
        console.log(r.b());
      },
      // 依赖模块编号
      { './main': 3 }
    ]
  },
  {},
  [1]
);
