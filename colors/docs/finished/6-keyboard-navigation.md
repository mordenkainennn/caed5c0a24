# 色板键盘导航功能方案

## 1. 功能描述
为240色颜色矩阵（color-grid）提供完整的键盘导航功能，允许用户仅通过键盘即可高效、精确地浏览和选择颜色，以提升工具的可访问性（Accessibility）和专业性。

## 2. 技术方案

### 2.1 实现思路
- **事件委托**: 相比为240个色块单独绑定事件，我们将采用性能更优的事件委托模式，仅在父容器`#color-grid`上监听`keydown`事件。
- **索引计算**: 将20x12的二维网格抽象为一维数组进行索引计算，从而实现上、下、左、右的精确移动。
- **焦点管理**: 通过JavaScript的`.focus()`方法主动管理浏览器焦点，确保导航的连续性。
- **状态更新**: 移动焦点时，同步更新高亮选框`.selected`的位置；按确认键时，调用`updateColor`函数更新全局颜色状态。

### 2.2 核心实现步骤
在`script.js`中，为`colorGrid`元素添加一个新的`keydown`事件监听器，其核心逻辑如下：

```javascript
colorGrid.addEventListener('keydown', (event) => {
    const { key } = event;
    const target = event.target;

    if (!target.classList.contains('color-box')) return;

    const boxes = Array.from(colorGrid.children);
    const currentIndex = boxes.indexOf(target);
    const COLS = 20; // 每行的列数
    let nextIndex = -1;

    switch (key) {
        case 'ArrowRight':
            nextIndex = currentIndex + 1;
            break;
        case 'ArrowLeft':
            nextIndex = currentIndex - 1;
            break;
        case 'ArrowDown':
            nextIndex = currentIndex + COLS;
            break;
        case 'ArrowUp':
            nextIndex = currentIndex - COLS;
            break;
        case 'Enter':
        case ' ': // Space key
            event.preventDefault();
            const rgbStr = getComputedStyle(target).getPropertyValue('--rgb');
            const [r, g, b] = rgbStr.split(',').map(Number);
            if (!isNaN(r)) {
                updateColor({ r, g, b, a: lastValidColor.a }, colorGrid);
            }
            return; // 结束函数
        default:
            return; // 忽略其他按键
    }

    // 阻止方向键的默认滚动行为
    event.preventDefault();

    // 检查下一个目标索引是否在有效范围内
    if (nextIndex >= 0 && nextIndex < boxes.length) {
        const nextBox = boxes[nextIndex];
        updateSelection(nextBox); // 移动高亮选框
        nextBox.focus(); // 移动浏览器焦点
    }
});
```

## 3. 用户体验考虑

- **无缝衔接**: 键盘操作（方向键移动、回车/空格确认）的行为和结果，将与鼠标的悬停和点击操作完全一致。
- **清晰反馈**: 高亮的`.selected`选框会跟随用户的按键操作实时移动，提供即时的视觉反馈。
- **边界处理**: 当焦点位于色板边缘时（如在最右侧时再按`→`），焦点将停留在原地，不会发生跳出或循环，符合常规的键盘操作直觉。
- **无障碍**: 此功能将极大地方便依赖键盘或屏幕阅读器等辅助技术的用户，使工具更具包容性。

## 4. 预期效果

- 用户可以使用键盘方向键在240个色块中自由导航。
- 用户可以使用回车或空格键选定当前高亮的颜色。
- 提升工具的整体可访问性和专业水准，为高级用户提供更高效的操作流。

# 补充改进意见

1. 可访问性（Accessibility）

初始焦点管理
建议在页面加载时，把焦点默认放在第一个色块上，或者在用户第一次按方向键时自动设置焦点，这样不需要用户先用鼠标点一下。

ARIA 属性
给 .color-box 元素加上 role="gridcell"，并在 #color-grid 上加 role="grid"。
当前选中的色块加上 aria-selected="true"，其他为 false。这样屏幕阅读器用户能清楚知道焦点在哪个格子。

Tab 键行为
默认情况下，Tab 会跳出整个色板。可以考虑用 tabindex="0" 管理焦点，只允许当前选中的色块可聚焦，避免用户用 Tab 时“跳 240 次”。

2. 性能与代码健壮性

索引缓存
你的方案里每次 keydown 都在 boxes 里做 indexOf(target)，复杂度 O(n)。
建议在初始化时为每个色块存储它的索引（比如用 dataset.index），在 keydown 里直接读，效率更高。

边界行为可选
现在的逻辑是“到边缘就停下”。有些用户可能更喜欢循环（从最右跳到最左，从最下跳到最上）。可以通过配置开关 wrapNavigation = true/false 实现。

解耦 updateSelection
updateSelection(nextBox) 里的逻辑建议单独写明：负责 .selected class 和 aria 状态更新。这样比直接依赖 focus 更清晰。

3. 用户体验优化

连续按键流畅性
在方向键长按时，浏览器会不断触发 keydown，但 .focus() + .scrollIntoView() 可能导致页面跳动。
可以考虑在容器 .color-grid 上加 overflow: hidden，保证色块移动时不会触发额外滚动。

快捷键扩展

Home → 跳到当前行的第一个色块。

End → 跳到当前行的最后一个色块。

PageUp / PageDown → 向上/下翻整屏（±12 行）。
这符合很多表格/IDE 的操作习惯。

视觉高亮优化
选中的色块除了 .selected 外，可以考虑加一个细边框或者轻微放大动画，让用户一眼看出位置。

✅ 总结改进点：

加 ARIA 属性和 tabindex，让屏幕阅读器体验更好。

优化性能：用 dataset.index 替代 indexOf。

提供可选“循环导航”模式。

增加 Home/End/PageUp/PageDown 快捷键。

确保长按方向键时不卡顿，不误触滚动。