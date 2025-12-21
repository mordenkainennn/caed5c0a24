# 专业模式颜色对比度检查功能方案

## 功能描述
在专业模式下为用户提供颜色对比度检查功能，帮助他们确保透明颜色在不同背景下的可读性，符合无障碍访问标准。

## 技术方案

### 1. 实现思路
- 在专业模式下添加对比度检查面板
- 提供常见背景颜色（白色、黑色、灰色）的对比度计算
- 显示对比度评级（AA/AAA标准）
- 可视化展示颜色在不同背景下的效果

### 2. 核心实现步骤

#### 步骤1：创建对比度检查HTML结构
在`index.html`中添加对比度检查面板：
```html
<!-- 在alpha容器下方添加对比度检查面板 -->
<div id="contrast-checker" class="contrast-checker" style="display: none;">
    <h4>对比度检查</h4>
    <div class="contrast-samples">
        <div class="contrast-sample" data-bg="white">
            <div class="sample-preview" style="background-color: white;">
                <div class="sample-text">Aa</div>
            </div>
            <div class="sample-info">
                <span class="bg-label">白底</span>
                <span class="contrast-ratio">-</span>
                <span class="contrast-rating"></span>
            </div>
        </div>
        <div class="contrast-sample" data-bg="black">
            <div class="sample-preview" style="background-color: black;">
                <div class="sample-text">Aa</div>
            </div>
            <div class="sample-info">
                <span class="bg-label">黑底</span>
                <span class="contrast-ratio">-</span>
                <span class="contrast-rating"></span>
            </div>
        </div>
        <div class="contrast-sample" data-bg="gray">
            <div class="sample-preview" style="background-color: #767676;">
                <div class="sample-text">Aa</div>
            </div>
            <div class="sample-info">
                <span class="bg-label">灰底</span>
                <span class="contrast-ratio">-</span>
                <span class="contrast-rating"></span>
            </div>
        </div>
    </div>
</div>
```

#### 步骤2：添加CSS样式
在`style.css`中添加相关样式：
```css
.contrast-checker {
    max-width: 400px;
    width: 100%;
    margin: 15px auto 0;
    background-color: #f8f9fa;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 12px;
    box-sizing: border-box;
}

.contrast-checker h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
    color: #444;
}

.contrast-samples {
    display: flex;
    gap: 10px;
    justify-content: space-between;
}

.contrast-sample {
    flex: 1;
    min-width: 0;
}

.sample-preview {
    height: 40px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    border: 1px solid var(--border-color);
}

.sample-text {
    font-size: 16px;
    font-weight: bold;
}

.sample-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
}

.bg-label {
    color: #666;
    margin-bottom: 2px;
}

.contrast-ratio {
    font-family: "SF Mono", "Consolas", "Menlo", monospace;
    font-size: 11px;
    color: #555;
}

.contrast-rating {
    font-size: 11px;
    font-weight: bold;
    margin-top: 2px;
}

.rating-aa {
    color: #28a745;
}

.rating-aaa {
    color: #20c997;
}

.rating-fail {
    color: #dc3545;
}

/* 响应式调整 */
@media (max-width: 480px) {
    .contrast-samples {
        flex-direction: column;
        gap: 8px;
    }
}
```

#### 步骤3：实现对比度计算逻辑
在`script.js`中添加相关功能：

```javascript
// 获取对比度检查元素
const contrastChecker = document.getElementById('contrast-checker');

// 计算相对亮度
function calculateRelativeLuminance(rgb) {
    const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 计算对比度比率
function calculateContrastRatio(color1, color2) {
    const lum1 = calculateRelativeLuminance(color1);
    const lum2 = calculateRelativeLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

// 获取评级
function getContrastRating(ratio, fontSize = 16, isBold = false) {
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
    
    if (ratio >= 7) {
        return { level: 'AAA', class: 'rating-aaa' };
    } else if (ratio >= 4.5) {
        return { level: 'AA', class: 'rating-aa' };
    } else if (isLargeText && ratio >= 3) {
        return { level: 'AA Large', class: 'rating-aa' };
    } else {
        return { level: 'Fail', class: 'rating-fail' };
    }
}

// 更新对比度检查
function updateContrastChecker() {
    if (!isProMode) return;
    
    const { r, g, b, a } = lastValidColor;
    
    // 定义背景颜色
    const backgrounds = {
        white: [255, 255, 255],
        black: [0, 0, 0],
        gray: [118, 118, 118] // #767676
    };
    
    // 计算混合后的颜色（考虑透明度）
    Object.entries(backgrounds).forEach(([bgName, bgRgb]) => {
        // 混合颜色：final = foreground * alpha + background * (1 - alpha)
        const mixedRgb = [
            Math.round(r * a + bgRgb[0] * (1 - a)),
            Math.round(g * a + bgRgb[1] * (1 - a)),
            Math.round(b * a + bgRgb[2] * (1 - a))
        ];
        
        // 计算对比度
        const ratio = calculateContrastRatio(mixedRgb, bgRgb);
        const rating = getContrastRating(ratio);
        
        // 更新UI
        const sample = document.querySelector(`.contrast-sample[data-bg="${bgName}"]`);
        if (sample) {
            const ratioElement = sample.querySelector('.contrast-ratio');
            const ratingElement = sample.querySelector('.contrast-rating');
            
            ratioElement.textContent = ratio.toFixed(2);
            ratingElement.textContent = rating.level;
            ratingElement.className = 'contrast-rating ' + rating.class;
            
            // 更新预览文本颜色
            const textElement = sample.querySelector('.sample-text');
            textElement.style.color = `rgb(${mixedRgb[0]}, ${mixedRgb[1]}, ${mixedRgb[2]})`;
        }
    });
}

// 在专业模式切换时控制对比度检查器显示
function toggleProMode(enabled, animate = true) {
    isProMode = enabled;
    alphaContainer.style.display = enabled ? 'flex' : 'none';
    contrastChecker.style.display = enabled ? 'block' : 'none'; // 添加这行
    
    // 保存状态
    saveProModeState();
    
    // 添加/移除专业模式类名
    if (enabled) {
        document.body.classList.add('pro-mode');
    } else {
        document.body.classList.remove('pro-mode');
    }
    
    // Re-render the current color to update formats
    updateColor(lastValidColor);
    
    // 在专业模式启用时更新色块透明度和对比度检查
    if (enabled) {
        updateColorBoxesAlpha(lastValidColor.a);
        updateContrastChecker();
    } else {
        // 退出专业模式时恢复色块为不透明
        updateColorBoxesAlpha(1);
    }
}

// 在颜色更新时调用对比度检查
function updateColor(color, sourceElement = null) {
    // ... existing code ...
    
    // 更新UI
    const previewColor = `rgba(${r}, ${g}, ${b}, ${a})`;
    const sliderBg = `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`;
    
    colorPreview.style.setProperty('--preview-color', previewColor);
    
    if (isProMode) {
        alphaSlider.style.background = sliderBg;
        alphaSlider.value = a;
        alphaValueInput.value = formatAlphaValue(a);
        
        // 更新对比度检查（新增）
        updateContrastChecker();
    }
    
    // ... rest of existing code ...
}
```

### 3. 用户体验考虑
- 确保对比度检查不会影响页面性能
- 提供清晰的评级说明
- 在小屏幕设备上合理布局
- 符合WCAG 2.1对比度标准

## 预期效果
- 帮助用户创建符合无障碍访问标准的颜色
- 提升工具的专业性和实用性
- 增强用户对透明度效果的理解
- 支持用户创建更易读的界面设计