# js-module
JS 模块化及相关工具的研究

## [parcel](https://github.com/parcel-bundler/parcel)

* 梳理出每个模块的依赖项，形成依赖树，提取所有子节点作为入口，向上依次加载，每个模块 export 的结果，都会被传入 module.exports 所引用，最终通过 cache 返回给所需要的模块，详见代码 

* 循环依赖问题会发生什么情况？见代码注释

* 为何要添加以下代码？
```javascript
function e(e) {
  return e && e.__esModule ? e : { default: e };
}
Object.defineProperty(exports, '__esModule', { value: !0 }),
```
[https://ryerh.com/javascript/2016/03/27/babel-module-implementation.html](https://ryerh.com/javascript/2016/03/27/babel-module-implementation.html)

* `parcel index.html` 生成的代码会添加 HMR，是怎么样的？
增加一个默认模块 0，用来做 HMR，

## node

node 端模块化与浏览器的不同：
* 代码不打包在一起，而使用 node CommonJS 规范来做
* require 调用模块代码，需要使用 `vm.runInThisContext`
* 有模块寻址，node_modules 模块还是项目模块
* 模块加载类型有 .js、.json、.node

[https://www.zhihu.com/lives/842742839304667136](https://www.zhihu.com/lives/842742839304667136)