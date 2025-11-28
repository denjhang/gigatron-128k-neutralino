# 直接加载器实现文档

## 概述
本文档记录了将 Gigatron 128K 模拟器中的 `neu` 加载机制修改为直接加载器，并成功打包应用程序的过程。

## 目标
- 将 `loader_d.js` 作为直接加载器集成到应用程序中。
- 确保应用程序能够正确加载 `.gt1` 文件。
- 成功打包应用程序，生成可执行文件。

## 实施步骤

### 1. 修改 `neutralino.config.json`
最初尝试将 `neutralino.config.json` 中的 `url` 字段直接指向 `loader_d.js`，但根据用户反馈，启动页面应为 `index_128k.html`。因此，将 `url` 字段改回 `/resources/index_128k.html`。

- **文件:** [`neutralino.config.json`](neutralino.config.json)
- **修改内容:**
  ```json
  "url": "/resources/index_128k.html",
  ```

### 2. 分析 `html/loader_d.js`
阅读了 [`html/loader_d.js`](html/loader_d.js) 的内容，了解其加载 `.gt1` 文件的机制。

### 3. 修改 `html/index_128k.html`
根据用户指示，修改 [`html/index_128k.html`](html/index_128k.html) 文件，使其使用直接加载器 `loader_d.js` 来加载 `.gt1` 文件。这主要涉及到修改 `html/main.js` 中 `Loader` 的导入路径。

### 4. 撤销对 `html/main.js` 的修改
由于 `neutralino.config.json` 中的 `url` 最终指向 `index_128k.html`，而 `index_128k.html` 导入的是 `main.js`，因此需要确保 `html/main.js` 导入正确的 `Loader`。在后续步骤中，我们将 `loader_d.js` 移动到 `resources` 目录，并修改 `resources/main.js`。因此，首先将 `html/main.js` 中的 `Loader` 导入路径改回 `loader_l.js`。

- **文件:** [`html/main.js`](html/main.js)
- **修改内容:**
  ```javascript
  import {
      Loader,
  } from './loader_l.js';
  ```

### 5. 复制 `loader_d.js` 到 `resources` 目录
为了让 `loader_d.js` 能够被打包进应用程序，需要将其放置在 `resources` 目录下。

- **命令:** `cp html/loader_d.js resources/loader_d.js`

### 6. 修改 `resources/main.js`
修改 `resources/main.js`，使其从 `resources/loader_d.js` 导入 `Loader`。这是确保应用程序使用直接加载器的关键步骤。

- **文件:** [`resources/main.js`](resources/main.js)
- **修改内容:**
  ```javascript
  import {
      Loader,
  } from './loader_d.js';
  ```

### 7. 更新 Neutralinojs 框架二进制文件
在打包过程中，发现 `neu build` 没有生成 `.exe` 文件。经过排查，发现是 Neutralinojs 框架二进制文件可能存在问题或版本不匹配。通过手动解压 `neutralinojs-v6.3.0.zip` 到 `bin` 目录来更新框架二进制文件。

- **命令:** `tar -xf neutralinojs-v6.3.0.zip -C bin`

### 8. 重新打包应用程序
在完成上述所有修改后，重新执行打包命令。

- **命令:** `neu build`

## 结果
应用程序已成功打包到 `dist` 目录，并生成了所有平台的可执行文件，包括 Windows 的 `gigatron-128k-win_x64.exe`。

**CLI 输出摘要:**
```
neu: INFO Bundling app...
neu: INFO Generating resources.neu...
neu: INFO Copying binaries...
neu: INFO Patching windows executables...
neu: INFO Application package was generated at the dist directory!
neu: INFO Distribution guide: https://neutralino.js.org/docs/distribution/overview