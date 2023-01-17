# 目的

主要是通过 NormalModuleReplacementPlugin 插件 可以不修改 原来的路由配置文件,在编译阶段根据配置生成一个新的路由文件取使用它,这样的好处是对于源文件没有侵入.


NormalModuleReplacementPlugin 的主要作用在于,将源文件的内容替换为我们自己的内容.


代码见dev-server.js


