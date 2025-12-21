document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const colorGrid = document.getElementById('color-grid');
    const grayScale = document.getElementById('gray-scale');
    const historyContainer = document.getElementById('history-container');
    const colorPreview = document.getElementById('color-preview');
    const hexInput = document.getElementById('hex-input');
    const rgbInput = document.getElementById('rgb-input');
    const hslInput = document.getElementById('hsl-input');
    const copyHexBtn = document.getElementById('copy-hex');
    const copyRgbBtn = document.getElementById('copy-rgb');
    const copyHslBtn = document.getElementById('copy-hsl');
    const toast = document.getElementById('toast-notification');
    const contactLink = document.getElementById('contact-link');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const proModeToggle = document.getElementById('pro-mode-toggle');
    const alphaContainer = document.getElementById('alpha-container');
    const alphaSlider = document.getElementById('alpha-slider');
    const alphaValueInput = document.getElementById('alpha-value-input');
    const alphaFormatToggle = document.getElementById('alpha-format-toggle');
    const contrastChecker = document.getElementById('contrast-checker');
    const customBgColorInput = document.getElementById('custom-bg-color-input');
    const eyedropperBtn = document.getElementById('eyedropper-btn');

    // --- State Variables ---
    const COLS = 20;
    const ROWS = 12;
    const MAX_HISTORY_LENGTH = 8;
    let lastValidColor = { r: 255, g: 255, b: 255, a: 1 };
    let currentSelectedBox = null;
    let colorHistory = [];
    let isProMode = false;
    let alphaDisplayFormat = 'decimal'; // 'decimal' or 'percentage'

    // --- Alpha Input Handling ---
    function formatAlphaValue(alpha) {
        alpha = Math.round(alpha * 10000) / 10000;
        if (alphaDisplayFormat === 'percentage') {
            return Math.round(alpha * 100) + '%';
        }
        return alpha.toFixed(2);
    }

    // --- Toast Notification ---
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- State Persistence ---
    function saveState() {
        try {
            const state = {
                proMode: isProMode,
                lastColor: lastValidColor,
                format: alphaDisplayFormat,
                customBgColor: customBgColorInput.value
            };
            localStorage.setItem('colorToolState', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save state to localStorage", e);
        }
    }

    function loadState() {
        try {
            const savedStateJSON = localStorage.getItem('colorToolState');
            if (savedStateJSON) {
                const state = JSON.parse(savedStateJSON);
                isProMode = state.proMode === true;
                if (state.lastColor && typeof state.lastColor === 'object' && 'r' in state.lastColor) {
                    lastValidColor = state.lastColor;
                }
                if (typeof state.format === 'string' && (state.format === 'decimal' || state.format === 'percentage')) {
                    alphaDisplayFormat = state.format;
                }
                if (state.customBgColor) {
                    customBgColorInput.value = state.customBgColor;
                }
            }
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
        }
    }

    // --- Color History ---
    function saveHistory() {
        try {
            localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }

    function addOrUpdateHistory(color) {
        const existingIndex = colorHistory.findIndex(histColor =>
            histColor.r === color.r && histColor.g === color.g && histColor.b === color.b && histColor.a === color.a
        );
        if (existingIndex > -1) {
            colorHistory.splice(existingIndex, 1);
        }
        colorHistory.unshift(color);
        if (colorHistory.length > MAX_HISTORY_LENGTH) {
            colorHistory.pop();
        }
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        historyContainer.innerHTML = '';
        if (colorHistory.length === 0) {
            const emptyMessage = document.createElement('span');
            emptyMessage.className = 'history-empty-message';
            emptyMessage.textContent = '您最近选择的颜色将显示在此处';
            historyContainer.appendChild(emptyMessage);
            if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
            return;
        }
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'inline-block';
        colorHistory.forEach(color => {
            const historyBox = document.createElement('button');
            historyBox.className = 'history-box';
            const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            historyBox.style.setProperty('--history-color', colorString);
            historyBox.title = `点击使用: ${colorString}`;
            historyBox.setAttribute('aria-label', `历史颜色: ${colorString}`);
            historyBox.addEventListener('click', () => {
                // Auto-enable pro mode if clicking a transparent color
                if (color.a < 1 && !isProMode) {
                    proModeToggle.checked = true;
                    toggleProMode(true);
                }
                updateColor(color, historyContainer);
                updateSelection(null);
            });
            historyContainer.appendChild(historyBox);
        });
    }

    function loadHistory() {
        try {
            const storedHistory = localStorage.getItem('colorHistory');
            if (storedHistory) {
                colorHistory = JSON.parse(storedHistory);
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
            colorHistory = [];
        }
    }

    function clearHistory() {
        if (confirm('您确定要清除所有历史记录吗？此操作不可撤销。')) {
            try {
                localStorage.removeItem('colorHistory');
                colorHistory = [];
                renderHistory();
                showToast('历史记录已清除。');
            } catch (e) {
                console.error("Failed to clear history from localStorage", e);
                showToast('清除历史记录失败。');
            }
        }
    }

    // --- Color Conversion & Parsing ---
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        let a = 1;
        if (isProMode && (hex.length === 4 || hex.length === 8)) {
            const alphaHex = hex.length === 4 ? hex.substring(3, 4).repeat(2) : hex.substring(6, 8);
            a = parseInt(alphaHex, 16) / 255;
            hex = hex.length === 4 ? hex.substring(0, 3) : hex.substring(0, 6);
        }
        if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
        if (hex.length !== 6) return null;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
        return { r, g, b, a };
    }

    function rgbStringToRgb(rgbStr) {
        const match = rgbStr.match(/^rgba?(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$/);
        if (!match) return null;
        const r = parseInt(match[1], 10), g = parseInt(match[2], 10), b = parseInt(match[3], 10);
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        if (r > 255 || g > 255 || b > 255 || a < 0 || a > 1 || isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
        return { r, g, b, a };
    }

    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h >= 0 && h < 60) { r = c; g = x; b = 0; } else if (h >= 60 && h < 120) { r = x; g = c; b = 0; } else if (h >= 120 && h < 180) { r = 0; g = c; b = x; } else if (h >= 180 && h < 240) { r = 0; g = x; b = c; } else if (h >= 240 && h < 300) { r = x; g = 0; b = c; } else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
        return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
    }

    function hslStringToRgb(hslStr) {
        const match = hslStr.match(/^hsla?(\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*([\d.]+))?$/);
        if (!match) return null;
        const h = parseInt(match[1]), s = parseInt(match[2]), l = parseInt(match[3]);
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        if (h > 360 || s > 100 || l > 100 || a < 0 || a > 1 || isNaN(h) || isNaN(s) || isNaN(l) || isNaN(a)) return null;
        const rgb = hslToRgb(h, s, l);
        return { ...rgb, a };
    }

    function parseColor(colorStr) {
        if (!colorStr) return null;
        const str = colorStr.trim().toLowerCase();
        if (str.startsWith('#')) return hexToRgb(str);
        if (str.startsWith('rgb')) return rgbStringToRgb(str);
        if (str.startsWith('hsl')) return hslStringToRgb(str);
        if (/^[0-9a-f]{3,8}$/.test(str)) return hexToRgb('#' + str);
        return null;
    }

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function rgbToHexString(r, g, b, a) {
        const toHex = c => Math.round(c).toString(16).padStart(2, '0');
        let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        if (isProMode && a < 1) hex += toHex(a * 255);
        return hex.toUpperCase();
    }

    // --- Contrast Checker --- 
    function calculateRelativeLuminance(rgb) {
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function calculateContrastRatio(color1, color2) {
        const lum1 = calculateRelativeLuminance(color1);
        const lum2 = calculateRelativeLuminance(color2);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function getContrastRating(ratio) {
        if (ratio >= 7) return { level: 'AAA', class: 'rating-aaa' };
        if (ratio >= 4.5) return { level: 'AA', class: 'rating-aa' };
        return { level: 'Fail', class: 'rating-fail' };
    }

    function updateContrastChecker() {
        if (!isProMode) return;
        const { r, g, b, a } = lastValidColor;
        const backgrounds = {
            white: [255, 255, 255],
            black: [0, 0, 0],
            gray: [118, 118, 118]
        };

        // Handle fixed backgrounds
        Object.entries(backgrounds).forEach(([bgName, bgRgb]) => {
            const mixedRgb = [
                Math.round(r * a + bgRgb[0] * (1 - a)),
                Math.round(g * a + bgRgb[1] * (1 - a)),
                Math.round(b * a + bgRgb[2] * (1 - a))
            ];
            const ratio = calculateContrastRatio(mixedRgb, bgRgb);
            const rating = getContrastRating(ratio);
            const sample = document.querySelector(`.contrast-sample[data-bg="${bgName}"]`);
            if (sample) {
                sample.querySelector('.contrast-ratio').textContent = ratio.toFixed(2);
                const ratingElement = sample.querySelector('.contrast-rating');
                ratingElement.textContent = rating.level;
                ratingElement.className = 'contrast-rating ' + rating.class;
                sample.querySelector('.sample-text').style.color = `rgb(${mixedRgb.join(',')})`;
            }
        });

        // Handle custom background
        const customBgHex = customBgColorInput.value;
        const customBgRgbObj = hexToRgb(customBgHex);
        if (customBgRgbObj) {
            const customBgRgb = [customBgRgbObj.r, customBgRgbObj.g, customBgRgbObj.b];
            const mixedRgb = [
                Math.round(r * a + customBgRgb[0] * (1 - a)),
                Math.round(g * a + customBgRgb[1] * (1 - a)),
                Math.round(b * a + customBgRgb[2] * (1 - a))
            ];
            const ratio = calculateContrastRatio(mixedRgb, customBgRgb);
            const rating = getContrastRating(ratio);
            const sample = document.querySelector('.contrast-sample[data-bg="custom"]');
            if (sample) {
                sample.querySelector('.sample-preview').style.backgroundColor = customBgHex;
                sample.querySelector('.contrast-ratio').textContent = ratio.toFixed(2);
                const ratingElement = sample.querySelector('.contrast-rating');
                ratingElement.textContent = rating.level;
                ratingElement.className = 'contrast-rating ' + rating.class;
                sample.querySelector('.sample-text').style.color = `rgb(${mixedRgb.join(',')})`;
            }
        }
    }

    // --- Format Toggle ---
    function toggleAlphaFormat() {
        alphaDisplayFormat = alphaDisplayFormat === 'decimal' ? 'percentage' : 'decimal';
        alphaValueInput.value = formatAlphaValue(lastValidColor.a);
        alphaFormatToggle.textContent = alphaDisplayFormat === 'decimal' ? '%' : 'D';
        saveState();
    }

    // --- Main Update Logic ---
    function updateColor(color, sourceElement = null) {
        let newColor;
        if (typeof color === 'object' && color !== null && 'r' in color) {
            newColor = { ...color };
            if (!('a' in newColor)) newColor.a = 1;
        } else {
            return; // Should only be called with a valid color object
        }

        if (newColor.a === undefined) newColor.a = 1;
        lastValidColor = { ...newColor };
        saveState();

        if (sourceElement !== historyContainer && sourceElement !== alphaSlider) {
            addOrUpdateHistory(lastValidColor);
        }

        const { r, g, b, a } = lastValidColor;
        const hexString = rgbToHexString(r, g, b, a);
        const rgbString = isProMode ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
        const [h, s, l] = rgbToHsl(r, g, b);
        const hslString = isProMode ? `hsla(${h}, ${s}%, ${l}%, ${a.toFixed(2)})` : `hsl(${h}, ${s}%, ${l}%)`;
        const previewColor = `rgba(${r}, ${g}, ${b}, ${a})`;

        colorPreview.style.setProperty('--preview-color', previewColor);

        if (isProMode) {
            const sliderBg = `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`;
            alphaSlider.style.background = sliderBg;
            alphaSlider.value = a;
            colorGrid.style.setProperty('--grid-alpha', a);
            updateContrastChecker();
        }

        hexInput.value = hexString;
        rgbInput.value = rgbString;
        hslInput.value = hslString;
        alphaValueInput.value = formatAlphaValue(a);
    }

    // --- Selection Indicator ---
    function updateSelection(selectedElement) {
        for (const box of colorGrid.children) {
            const isSelected = box === selectedElement;
            box.setAttribute('aria-selected', isSelected);
            box.setAttribute('tabindex', isSelected ? '0' : '-1');
        }
        if (currentSelectedBox) {
            currentSelectedBox.classList.remove('selected');
        }
        if (selectedElement) {
            selectedElement.classList.add('selected');
            currentSelectedBox = selectedElement;
        } else {
            currentSelectedBox = null;
        }
    }

    // --- Grid Generation ---
    function generateColorGrid() {
        colorGrid.setAttribute('role', 'grid');
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const box = document.createElement('div');
                box.classList.add('color-box');
                const hue = (j / (COLS - 1)) * 360;
                const lightness = 95 - (i / (ROWS - 1)) * 75;
                const saturation = 85;
                const { r, g, b } = hslToRgb(hue, saturation, lightness);
                box.style.setProperty('--rgb', `${r},${g},${b}`);
                box.setAttribute('role', 'gridcell');
                box.setAttribute('data-index', i * COLS + j);
                box.setAttribute('aria-label', `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(lightness)}%)`);
                box.setAttribute('aria-selected', 'false');
                box.setAttribute('tabindex', '-1');
                colorGrid.appendChild(box);
            }
        }
    }

    // --- Event Handlers ---
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check" style="color: #28a745;"></i>';
            setTimeout(() => { button.innerHTML = originalIcon; }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('复制失败!');
        });
    }

    colorGrid.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('color-box')) {
            const rgbStr = getComputedStyle(target).getPropertyValue('--rgb');
            const [r, g, b] = rgbStr.split(',').map(Number);
            if (!isNaN(r)) {
                const newColor = { r, g, b, a: lastValidColor.a };
                updateSelection(target);
                updateColor(newColor, colorGrid);
            }
        }
    });

    colorGrid.addEventListener('keydown', (event) => {
        const { key } = event;
        const target = event.target;
        if (!target.classList.contains('color-box')) return;
        const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
        const selectionKeys = ['Enter', ' '];
        if (navKeys.includes(key)) {
            event.preventDefault();
            const totalBoxes = colorGrid.children.length;
            const currentIndex = parseInt(target.getAttribute('data-index'), 10);
            let nextIndex = -1;
            switch (key) {
                case 'ArrowRight': if ((currentIndex + 1) % COLS !== 0) nextIndex = currentIndex + 1; break;
                case 'ArrowLeft': if (currentIndex % COLS !== 0) nextIndex = currentIndex - 1; break;
                case 'ArrowDown': nextIndex = currentIndex + COLS; break;
                case 'ArrowUp': nextIndex = currentIndex - COLS; break;
                case 'Home': nextIndex = Math.floor(currentIndex / COLS) * COLS; break;
                case 'End': nextIndex = Math.floor(currentIndex / COLS) * COLS + COLS - 1; break;
                case 'PageUp': nextIndex = currentIndex % COLS; break;
                case 'PageDown':
                    nextIndex = (totalBoxes - COLS) + (currentIndex % COLS);
                    if (nextIndex >= totalBoxes) nextIndex = totalBoxes - 1;
                    break;
            }
            if (nextIndex !== -1 && nextIndex >= 0 && nextIndex < totalBoxes) {
                const nextBox = colorGrid.children[nextIndex];
                if (nextBox) {
                    updateSelection(nextBox);
                    nextBox.focus();
                }
            }
        }
        if (selectionKeys.includes(key)) {
            event.preventDefault();
            const rgbStr = getComputedStyle(target).getPropertyValue('--rgb');
            const [r, g, b] = rgbStr.split(',').map(Number);
            if (!isNaN(r)) {
                updateColor({ r, g, b, a: lastValidColor.a }, colorGrid);
            }
        }
    });

    grayScale.addEventListener('click', (event) => {
        updateSelection(null);
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / event.target.offsetWidth));
        const grayValue = Math.round(255 * (1 - percentage));
        const newColor = { r: grayValue, g: grayValue, b: grayValue, a: lastValidColor.a };
        updateColor(newColor, grayScale);
    });

    // --- UNIFIED INPUT HANDLING ---
    function filterInput(event) {
        const input = event.target;
        if (!input) return;
        let regex;
        switch (input.id) {
            case 'hex-input': regex = /[^#0-9a-fA-F]/g; break;
            case 'rgb-input': regex = /[^0-9,.rgb()\s]/g; break;
            case 'hsl-input': regex = /[^0-9,.hsl()%\s]/g; break;
            case 'alpha-value-input': regex = /[^0-9.%]/g; break;
            default: return;
        }
        const originalValue = input.value;
        const sanitizedValue = originalValue.replace(regex, '');
        if (originalValue !== sanitizedValue) {
            input.value = sanitizedValue;
        }
    }

    function validateAndApply(inputElement) {
        const value = inputElement.value.trim();
        if (value === '') {
            updateColor(lastValidColor);
            return;
        }
        let newColor = null;
        if (inputElement.id === 'alpha-value-input') {
            let alpha = -1;
            if (value.endsWith('%')) {
                const percent = parseFloat(value);
                if (!isNaN(percent) && percent >= 0 && percent <= 100) {
                    alpha = percent / 100;
                }
            } else {
                const decimal = parseFloat(value);
                if (!isNaN(decimal) && decimal >= 0 && decimal <= 1) {
                    alpha = decimal;
                }
            }
            if (alpha !== -1) {
                newColor = { ...lastValidColor, a: alpha };
            } else {
                showToast("无效的透明度值 (0-1 或 0%-100%)");
            }
        } else {
            newColor = parseColor(value);
            if (!newColor) {
                showToast("无效的颜色格式");
            }
        }
        if (newColor) {
            updateColor(newColor, inputElement);
        } else {
            updateColor(lastValidColor);
        }
    }

    [hexInput, rgbInput, hslInput, alphaValueInput].forEach(input => {
        input.addEventListener('input', filterInput);
        input.addEventListener('blur', () => validateAndApply(input));
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                validateAndApply(input);
                input.blur();
            }
        });
        input.addEventListener('paste', (event) => {
            event.preventDefault();
            let text = (event.clipboardData || window.clipboardData).getData('text');
            input.value = text;
            validateAndApply(input);
        });
    });

    alphaValueInput.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            let currentAlpha = lastValidColor.a;
            const step = 0.01;
            let newAlpha = currentAlpha + (event.key === 'ArrowUp' ? step : -step);
            newAlpha = Math.round(Math.max(0, Math.min(1, newAlpha)) * 100) / 100;
            lastValidColor.a = newAlpha;
            updateColor(lastValidColor, alphaValueInput);
        }
    });

    copyHexBtn.addEventListener('click', () => copyToClipboard(hexInput.value, copyHexBtn));
    copyRgbBtn.addEventListener('click', () => copyToClipboard(rgbInput.value, copyRgbBtn));
    copyHslBtn.addEventListener('click', () => copyToClipboard(hslInput.value, copyHslBtn));
    clearHistoryBtn.addEventListener('click', clearHistory);

    // --- Pro Mode & Initialization ---
    function toggleProMode(enabled) {
        isProMode = enabled;
        document.body.classList.toggle('pro-mode', enabled);
        alphaContainer.style.display = enabled ? 'flex' : 'none';
        contrastChecker.style.display = enabled ? 'block' : 'none';
        colorGrid.style.setProperty('--grid-alpha', enabled ? lastValidColor.a : 1);
    }

    proModeToggle.addEventListener('change', (e) => {
        toggleProMode(e.target.checked);
        updateColor(lastValidColor);
    });

    alphaFormatToggle.addEventListener('click', toggleAlphaFormat);

    alphaSlider.addEventListener('input', () => {
        const newAlpha = parseFloat(alphaSlider.value);
        lastValidColor.a = newAlpha;
        alphaValueInput.value = formatAlphaValue(newAlpha);
        updateColor(lastValidColor, alphaSlider);
    });

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
            case 'Home': newAlpha = 0; changed = true; event.preventDefault(); break;
            case 'End': newAlpha = 1; changed = true; event.preventDefault(); break;
        }
        if (changed) {
            alphaSlider.value = newAlpha.toFixed(2);
            const inputEvent = new Event('input', { bubbles: true });
            alphaSlider.dispatchEvent(inputEvent);
        }
    });

    customBgColorInput.addEventListener('input', () => {
        updateContrastChecker();
        saveState();
    });

    function initialize() {
        generateColorGrid();
        loadHistory();
        renderHistory();
        loadState();

        // Eyedropper Initialization
        if (window.EyeDropper) {
            eyedropperBtn.classList.remove('hidden');
            eyedropperBtn.addEventListener('click', async () => {
                try {
                    const eyeDropper = new EyeDropper();
                    const result = await eyeDropper.open();
                    const newColorRgb = parseColor(result.sRGBHex);
                    if (newColorRgb) {
                        // Preserve the existing alpha value from the last valid color
                        newColorRgb.a = lastValidColor.a;
                        updateColor(newColorRgb, eyedropperBtn);
                        updateSelection(null); // Clear selection from the grid
                    }
                } catch (e) {
                    // User cancelled the eyedropper, do nothing.
                }
            });
        }

        const stateWasLoaded = localStorage.getItem('colorToolState') !== null;
        if (!stateWasLoaded && colorHistory.length === 0) {
            const firstBox = colorGrid.children[0];
            if (firstBox) {
                const rgbStr = getComputedStyle(firstBox).getPropertyValue('--rgb');
                const [r, g, b] = rgbStr.split(',').map(Number);
                lastValidColor = { r, g, b, a: 1 };
            }
        }
        const firstBox = colorGrid.children[0];
        if (firstBox) {
            updateSelection(firstBox);
            setTimeout(() => firstBox.focus(), 0);
        }
        proModeToggle.checked = isProMode;
        toggleProMode(isProMode);
        // This call needs to happen *after* pro mode UI is set
        updateColor(lastValidColor);
        alphaFormatToggle.textContent = alphaDisplayFormat === 'decimal' ? '%' : 'D';
    }

    const user = "feedback", domain = "gongjupal.com";
    if (contactLink) contactLink.href = `mailto:${user}@${domain}`;

    initialize();
});