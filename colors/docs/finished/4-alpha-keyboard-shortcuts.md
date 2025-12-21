# 键盘快捷键支持方案

## 功能描述
为alpha透明度滑块添加键盘快捷键支持，提升专业用户的操作体验。

## 技术方案

### 1. 快捷键设计
- **左/右箭头键**：以0.01的步长调整透明度
- **Ctrl + 左/右箭头键**：以0.1的步长调整透明度
- **Home键**：设置透明度为0
- **End键**：设置透明度为1

### 2. 实现步骤

#### 步骤1：添加键盘事件监听器
```javascript
alphaSlider.addEventListener('keydown', (event) => {
    let newAlpha = parseFloat(alphaSlider.value);
    let changed = false;
    
    switch (event.key) {
        case 'ArrowLeft':
            newAlpha = Math.max(0, newAlpha - (event.ctrlKey ? 0.1 : 0.01));
            changed = true;
            event.preventDefault();
            break;
        case 'ArrowRight':
            newAlpha = Math.min(1, newAlpha + (event.ctrlKey ? 0.1 : 0.01));
            changed = true;
            event.preventDefault();
            break;
        case 'Home':
            newAlpha = 0;
            changed = true;
            event.preventDefault();
            break;
        case 'End':
            newAlpha = 1;
            changed = true;
            event.preventDefault();
            break;
    }
    
    if (changed) {
        alphaSlider.value = newAlpha;
        // 触发input事件以更新透明度
        const inputEvent = new Event('input', { bubbles: true });
        alphaSlider.dispatchEvent(inputEvent);
    }
});
```

#### 步骤2：改善键盘焦点指示
在CSS中添加更明显的焦点状态：
```css
#alpha-slider:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

### 3. 用户体验考虑
- 确保快捷键不会与页面其他功能冲突
- 提供视觉反馈，让用户知道滑块处于焦点状态
- 在帮助文档中说明快捷键功能

## 预期效果
- 提升专业用户的操作效率
- 符合无障碍访问标准
- 增强工具的专业性