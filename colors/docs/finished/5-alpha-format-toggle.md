# 透明度值显示格式切换方案

## 功能描述
在专业模式下添加透明度值显示格式切换功能，支持在小数(0.00-1.00)和百分比(0%-100%)之间切换显示。

## 技术方案

### 1. 实现思路
- 在alpha值显示区域旁边添加一个切换按钮
- 点击按钮在小数和百分比格式之间切换
- 保持内部计算使用小数，只改变显示格式

### 2. 核心实现步骤

#### 步骤1：修改HTML结构
在`index.html`中修改alpha值显示区域：
```html
<div id="alpha-container" class="alpha-container" style="display: none;">
    <div id="alpha-slider-track">
        <input type="range" id="alpha-slider" min="0" max="1" step="0.01" value="1">
    </div>
    <div class="alpha-value-container">
        <span id="alpha-value">1.00</span>
        <button id="alpha-format-toggle" class="alpha-format-toggle" title="切换显示格式">%</button>
    </div>
</div>
</div>
```

#### 步骤2：添加CSS样式
在`style.css`中添加相关样式：
```css
.alpha-value-container {
    display: flex;
    align-items: center;
    gap: 5px;
}

.alpha-format-toggle {
    background: none;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 2px 6px;
    font-size: 12px;
    cursor: pointer;
    color: #666;
}

.alpha-format-toggle:hover {
    background-color: #f0f0f0;
}
```

#### 步骤3：实现切换逻辑
在`script.js`中添加相关功能：
```javascript
// 添加状态变量
let alphaDisplayFormat = 'decimal'; // 'decimal' or 'percentage'

// 格式化alpha值显示
function formatAlphaValue(alpha) {
    if (alphaDisplayFormat === 'percentage') {
        return Math.round(alpha * 100) + '%';
    } else {
        return alpha.toFixed(2);
    }
}

// 切换显示格式
function toggleAlphaFormat() {
    alphaDisplayFormat = alphaDisplayFormat === 'decimal' ? 'percentage' : 'decimal';
    alphaValue.textContent = formatAlphaValue(lastValidColor.a);
    alphaFormatToggle.textContent = alphaDisplayFormat === 'decimal' ? '%' : 'D';
}

// 在alpha滑块事件处理中更新显示
alphaSlider.addEventListener('input', () => {
    const newAlpha = parseFloat(alphaSlider.value);
    lastValidColor.a = newAlpha;
    updateColor(lastValidColor, alphaSlider);
    // 更新alpha值显示
    alphaValue.textContent = formatAlphaValue(newAlpha);
});

// 添加切换按钮事件监听
const alphaFormatToggle = document.getElementById('alpha-format-toggle');
alphaFormatToggle.addEventListener('click', toggleAlphaFormat);
```

#### 步骤4：在初始化时设置默认格式
```javascript
// 在initialize函数中添加
function initialize() {
    // ... existing code ...
    
    // 设置默认alpha显示格式
    alphaDisplayFormat = localStorage.getItem('alphaDisplayFormat') || 'decimal';
    alphaValue.textContent = formatAlphaValue(lastValidColor.a);
    alphaFormatToggle.textContent = alphaDisplayFormat === 'decimal' ? '%' : 'D';
}
```

#### 步骤5：保存用户偏好
```javascript
// 在toggleAlphaFormat函数中添加
function toggleAlphaFormat() {
    alphaDisplayFormat = alphaDisplayFormat === 'decimal' ? 'percentage' : 'decimal';
    alphaValue.textContent = formatAlphaValue(lastValidColor.a);
    alphaFormatToggle.textContent = alphaDisplayFormat === 'decimal' ? '%' : 'D';
    // 保存用户偏好
    localStorage.setItem('alphaDisplayFormat', alphaDisplayFormat);
}
```

### 3. 用户体验考虑
- 默认使用小数格式，符合CSS规范
- 切换按钮使用简洁的符号(%和D)
- 保存用户偏好设置
- 确保在不同格式间切换时数值一致性

## 预期效果
- 满足不同用户的显示习惯
- 提升工具的专业性和易用性
- 保持与行业标准的一致性