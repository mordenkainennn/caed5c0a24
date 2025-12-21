1. 预览实时更新（无防抖）：
 - 用户输入时，（合法数值时）立即用当前值去更新预览区和另外两个值。
 - 如果不合法，保持预览不变，不覆盖输入框。
2. 格式化延迟到 blur/Enter：
 - 输入过程延迟500ms后更新，设置成变量，并且可以把延迟更新disable掉
 - 不要在 input 过程中去“重写”输入框。
 - 等用户结束输入（失焦或按下回车）后，再把输入值转成标准格式（比如统一转成大写的 #RRGGBB）。

3. 输入过程中验证是非法字符无法输入，比如JKL或者汉字。

4. 为了防止粘贴非法字符
 - beforeinput 事件
    ```js
    hexInput.addEventListener('beforeinput', (e) => {
  if (e.inputType === 'insertFromPaste' || e.inputType === 'insertText') {
    if (!/^[#0-9a-fA-F]*$/.test(e.data)) {
      e.preventDefault(); // 阻止非法字符进入输入框
    }
  }
});
    ```
 - paste 事件（兜底方案）
    ```js
    hexInput.addEventListener('paste', (e) => {
  let text = (e.clipboardData || window.clipboardData).getData('text');
  if (!/^[#0-9a-fA-F]*$/.test(text)) {
    e.preventDefault(); // 阻止整个粘贴
    alert("只能输入十六进制颜色值 (#RRGGBB)");
  }
});
    ```

  - 粘贴后立即清洗（最后防线）  
    ```js
    hexInput.addEventListener('input', (e) => {
  let clean = e.target.value.replace(/[^#0-9a-fA-F]/g, "");
  if (clean !== e.target.value) {
    e.target.value = clean; // 自动清除非法字符
  }
});
    ```