你要的效果是：

上半部分主界面（调色板容器 + 页头/页脚）完全占满一屏，高度 = 100vh。

下半部分长尾词介绍区在页面滚动后才看得到，默认只露出一点点作为提示。

可以这样改：

样式调整方案

在 CSS 里增加一个“整屏容器”，让 .container（调色板工具区域）高度占满视口，然后让 .tool-description 正常跟在后面：
```css
html, body {
    height: 100%;
    margin: 0;
    overflow-y: auto; /* 允许页面整体滚动 */
}

/* 主界面占满一屏 */
main.container {
    min-height: 100vh; /* 占满视口高度 */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

/* 长尾词介绍区：额外留白作为“提示” */
.tool-description {
    margin-top: -40px; /* 让它往上顶一点，只露个头 */
    padding-top: 50px; /* 自己内部再补回来，避免文字被遮 */
    z-index: 2;
    position: relative;
}
```

效果说明

打开页面时，上半屏就是完整的调色板主界面，不需要滚动。
长尾词区的顶部会压进来一点点（比如 10px~50px，根据你想提示多少），用户能看到“下面还有东西”，需要滚动才能继续阅读。
滚动后，自然进入 .tool-description 的正文部分。