# 专业模式使用提示方案

## 功能描述
为新用户提供专业模式功能的引导说明，帮助他们更好地理解和使用alpha透明度功能。

## 技术方案

### 1. 实现思路
- 在首次启用专业模式时显示引导提示
- 提供简洁明了的功能说明
- 允许用户关闭提示并不再显示

### 2. 核心实现步骤

#### 步骤1：创建提示HTML结构
在`index.html`中添加提示元素：
```html
<!-- 在专业模式开关附近添加提示 -->
<div class="pro-mode-switch-container">
    <label for="pro-mode-toggle" class="pro-mode-label">专业模式 (Alpha)</label>
    <label class="switch">
        <input type="checkbox" id="pro-mode-toggle">
        <span class="slider round"></span>
    </label>
    <!-- 添加提示图标 -->
    <button id="pro-mode-help" class="pro-mode-help" title="查看专业模式帮助">
        <i class="fa-solid fa-circle-info"></i>
    </button>
</div>

<!-- 添加提示模态框 -->
<div id="pro-mode-tooltip" class="pro-mode-tooltip" style="display: none;">
    <div class="tooltip-content">
        <h4>专业模式功能说明</h4>
        <ul>
            <li>使用下方滑块调整颜色透明度 (Alpha)</li>
            <li>支持RGBA和HSLA颜色格式</li>
            <li>历史记录会保存透明度信息</li>
            <li>键盘快捷键：← → 微调，Ctrl+← → 大幅调整</li>
        </ul>
        <div class="tooltip-actions">
            <button id="tooltip-close" class="tooltip-close">关闭</button>
            <label class="dont-show-again">
                <input type="checkbox" id="dont-show-again"> 不再显示
            </label>
        </div>
    </div>
</div>
```

#### 步骤2：添加CSS样式
在`style.css`中添加相关样式：
```css
.pro-mode-help {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 16px;
    padding: 0 5px;
    margin-left: 5px;
    transition: color 0.2s;
}

.pro-mode-help:hover {
    color: var(--primary-color);
}

.pro-mode-tooltip {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 400px;
    width: 90%;
}

.tooltip-content {
    padding: 20px;
}

.tooltip-content h4 {
    margin-top: 0;
    color: #333;
}

.tooltip-content ul {
    padding-left: 20px;
    margin: 10px 0;
}

.tooltip-content li {
    margin-bottom: 8px;
    line-height: 1.4;
}

.tooltip-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.tooltip-close {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.tooltip-close:hover {
    background-color: var(--primary-hover);
}

.dont-show-again {
    font-size: 13px;
    color: #666;
}

.dont-show-again input {
    margin-right: 5px;
}

/* 遮罩层 */
.tooltip-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
}
```

#### 步骤3：实现提示逻辑
在`script.js`中添加相关功能：
```javascript
// 获取提示相关元素
const proModeHelp = document.getElementById('pro-mode-help');
const proModeTooltip = document.getElementById('pro-mode-tooltip');
const tooltipClose = document.getElementById('tooltip-close');
const dontShowAgain = document.getElementById('dont-show-again');

// 创建遮罩层
const tooltipOverlay = document.createElement('div');
tooltipOverlay.className = 'tooltip-overlay';
document.body.appendChild(tooltipOverlay);

// 显示提示
function showProModeTooltip() {
    // 检查是否设置为不再显示
    if (localStorage.getItem('hideProModeTooltip') === 'true') {
        return;
    }
    
    proModeTooltip.style.display = 'block';
    tooltipOverlay.style.display = 'block';
    document.body.classList.add('tooltip-open');
}

// 隐藏提示
function hideProModeTooltip() {
    proModeTooltip.style.display = 'none';
    tooltipOverlay.style.display = 'none';
    document.body.classList.remove('tooltip-open');
    
    // 检查是否选择不再显示
    if (dontShowAgain.checked) {
        localStorage.setItem('hideProModeTooltip', 'true');
    }
}

// 绑定事件
proModeHelp.addEventListener('click', showProModeTooltip);
tooltipClose.addEventListener('click', hideProModeTooltip);
tooltipOverlay.addEventListener('click', hideProModeTooltip);

// ESC键关闭提示
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && proModeTooltip.style.display === 'block') {
        hideProModeTooltip();
    }
});

// 在首次启用专业模式时显示提示
function toggleProMode(enabled, animate = true) {
    isProMode = enabled;
    alphaContainer.style.display = enabled ? 'flex' : 'none';
    localStorage.setItem('proMode', enabled);
    
    // 添加/移除专业模式类名
    if (enabled) {
        document.body.classList.add('pro-mode');
        // 首次启用时显示提示
        if (!localStorage.getItem('proModePreviouslyEnabled')) {
            setTimeout(showProModeTooltip, 500);
            localStorage.setItem('proModePreviouslyEnabled', 'true');
        }
    } else {
        document.body.classList.remove('pro-mode');
    }
    
    // Re-render the current color to update formats
    updateColor(lastValidColor);
    
    // 在专业模式启用时更新色块透明度
    if (enabled) {
        updateColorBoxesAlpha(lastValidColor.a);
    } else {
        // 退出专业模式时恢复色块为不透明
        updateColorBoxesAlpha(1);
    }
}
```

### 3. 用户体验考虑
- 避免打扰已经熟悉功能的用户
- 提供简洁明了的操作说明
- 允许用户自定义是否显示提示
- 确保提示在不同设备上都能正常显示

## 预期效果
- 帮助新用户快速了解专业模式功能
- 提升工具的易用性和用户满意度
- 减少用户学习成本