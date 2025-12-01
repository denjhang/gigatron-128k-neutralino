# Gigatron 128k 8-bit Audio Emulator 文档

## 概述

本文档详细说明了 Gigatron 128k 8-bit Audio Emulator 的功能、构建过程以及如何为 `neu` 打包的应用程序恢复 `.gt1` 文件的拖拽加载功能。

## 程序功能

### 核心功能

Gigatron 128k 8-bit Audio Emulator 是一个基于 JavaScript 的 Gigatron 计算机模拟器，具有以下核心功能：

1. **Gigatron 硬件模拟**：
   - 模拟 Gigatron 的 CPU、RAM 和 ROM。
   - 支持 128K RAM 和 IO 扩展板。
   - 在 SPI0 端口上模拟 SD 卡。

2. **视频输出 (VGA)**：
   - 640x480 分辨率的 VGA 显示模拟。
   - 通过 HTML5 Canvas 实时渲染。

3. **音频输出 (8-bit Audio)**：
   - 支持 8-bit、6-bit 和 4-bit 音频输出。
   - 44.1 kHz 采样率。
   - 可调节音量和静音功能。

4. **输入设备**：
   - 键盘输入支持。
   - 虚拟游戏手柄（包括方向键、A/B 按钮、Start/Select 按钮）。
   - 触摸屏支持（适用于移动设备）。

5. **存储设备**：
   - 支持 `.gt1` 和 `.gt1x` 程序文件加载。
   - 支持 `.rom` 文件加载。
   - 支持 `.vhd` 和 `.img` 磁盘镜像文件加载和挂载。

### 用户界面

1. **LED 指示灯**：
   - 显示系统状态的四个 LED 灯。

2. **VGA 显示**：
   - 模拟 Gigatron 的视频输出。

3. **游戏手柄**：
   - 虚拟游戏手柄，可通过鼠标、触摸或键盘控制。

4. **音量控制**：
   - 音量滑块和静音/取消静音按钮。

5. **文件加载器**：
   - 文件选择按钮，用于加载程序、ROM 或磁盘镜像。
   - 磁盘挂载/卸载按钮和状态显示。

6. **键盘快捷键**：
   - `[A]` 按钮：`Delete/End` 键
   - `[B]` 按钮：`Insert/Home` 键
   - `[Select]` 按钮：`PageDown` 键
   - `[Start]` 按钮：`PageUp` 键

## 拖拽功能恢复

### 功能背景

原始的网页版 Gigatron 模拟器允许用户通过拖拽 `.gt1` 文件到浏览器窗口来加载游戏或程序。然而，在 `neu` 打包的桌面应用程序中，此功能缺失。本次修改旨在恢复此功能，以提升用户体验。

### 代码修改

#### 1. 定位关键文件

- **原始网页版代码**: `html/main.js`
- **Neu 应用代码**: `resources/main.js`

**注意**: 修改 `resources` 文件夹下的代码才会影响 `neu` 打包的应用程序，修改 `html` 文件夹下的代码无效。

#### 2. 恢复的代码功能

在 `resources/main.js` 中，我们添加了以下关键功能：

##### a. 拖拽事件监听器

```javascript
$(document)
    .on('dragenter', (event) => {
        event.preventDefault();
        event.stopPropagation();
        let dataTransfer = event.originalEvent.dataTransfer;
        dataTransfer.dropEffect = 'link';
    })
    .on('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
    })
    .on('drop', (event) => {
        let dataTransfer = event.originalEvent.dataTransfer;
        if (dataTransfer) {
            let files = dataTransfer.files;
            if (files.length != 0) {
                event.preventDefault();
                event.stopPropagation();
                let file = files[0];
                let name = file.name.toLowerCase()
                if (name.endsWith('.rom')) {
                    loadRom(file);
                } else if (name.endsWith('.vhd')) {
                    spi.loadvhdfile(file);
                    setVhdLabel();
                } else {
                    loadGt1(file);
                }
            }
        }
    });
```

这些事件监听器负责：
- `dragenter`: 当文件被拖入窗口时，设置 `dropEffect` 为 'link'。
- `dragover`: 阻止默认行为，允许文件被放置。
- `drop`: 处理放置的文件，根据文件扩展名调用相应的加载函数。

##### b. 文件加载函数

```javascript
function loadGt1(file) {
    gamepad.stop();
    spi.stop();
    return loader.load(file)
        .pipe(finalize(() => {
            gamepad.start();
            spi.start();
        }))
        .subscribe({
            error: (error) => showError($(`\
            <p>\
                Could not load GT1 from <code>${file.name}</code>\
            </p>\
            <hr>\
            <p class="alert alert-danger">\
                <span class="oi oi-warning"></span> ${error.message}\
            </p>`)),
        });
}

function loadRom(file) {
    gamepad.stop();
    spi.stop();
    return loader.loadRom(file)
        .pipe(finalize(() => {
            gamepad.start();
            spi.start();
        }))
        .subscribe({
            error: (error) => showError($(`\
            <p>\
                Could not load ROM from <code>${file.name}</code>\
            </p>\
            <hr>\
            <p class="alert alert-danger">\
                <span class="oi oi-warning"></span> ${error.message}\
            </p>`)),
        });
}
```

这些函数负责：
- 停止游戏手柄和 SPI 模拟。
- 使用 `loader` 加载文件。
- 在加载完成后恢复模拟。
- 处理加载过程中可能出现的错误。

##### c. VHD 标签更新函数

```javascript
function setVhdLabel() {
    if (spi.vhdmounted) {
        vhdLabel.text(spi.vhdname);
        mountButton.addClass('d-none');
        unmountButton.removeClass('d-none');
    } else {
        vhdLabel.text('no disk');
        mountButton.removeClass('d-none');
        unmountButton.addClass('d-none');
    }
}
```

此函数用于更新 VHD 磁盘镜像的挂载状态显示。

## 构建与运行流程

### 1. 环境准备

确保已安装 Node.js 和 npm。项目依赖已在 `package.json` 中定义：

```json
{
  "dependencies": {
    "@neutralinojs/neu": "^11.6.0"
  }
}
```

### 2. 安装依赖

在项目根目录下运行：

```bash
npm install
```

### 3. 构建应用程序

使用 `npx` 执行 `neu` 命令来构建应用程序：

```bash
npx neu build
```

此命令将：
- 打包应用程序资源。
- 生成 `resources.neu` 文件。
- 复制二进制文件到 `dist` 目录。
- 为 Windows 可执行文件打补丁。

构建成功后，输出将显示：

```
neu: INFO Application package was generated at the dist directory!
```

### 4. 运行应用程序

在开发模式下运行应用程序：

```bash
npx neu run
```

此命令将启动应用程序，并启用开发者扩展和自动重载功能。

### 5. 测试拖拽功能

1. 启动应用程序后，找到一个 `.gt1` 文件（例如 `resources/music6.gt1`）。
2. 将文件拖拽到应用程序窗口中。
3. 如果功能正常，文件将被加载，模拟器将开始运行该程序。

## 故障排除

### 1. `neu: command not found`

如果直接运行 `neu` 命令提示找不到命令，请使用 `npx`：

```bash
npx neu build
npx neu run
```

### 2. 资源加载错误

如果出现资源加载错误（如 `favicon.ico`），请确保 `resources` 目录中包含所有必要的文件。

### 3. 拖拽功能不工作

- 确认修改的是 `resources/main.js` 而不是 `html/main.js`。
- 重新构建并运行应用程序。
- 检查浏览器控制台（如果适用）或日志文件中的错误信息。

### 4. 音频问题

- 确保浏览器或系统允许音频播放。
- 检查音量设置和静音状态。
- 在某些浏览器中，可能需要用户交互后才能启动音频上下文。

## 总结

通过以上步骤，我们成功地为 `neu` 打包的 Gigatron 128k 8-bit Audio Emulator 应用程序恢复了 `.gt1` 文件的拖拽加载功能。此功能提升了用户体验，使其与原始网页版保持一致。

修改的核心在于在 `resources/main.js` 中添加了拖拽事件监听器和相应的文件处理逻辑。构建和运行过程通过 `npx neu` 命令完成，确保了应用程序的正确打包和部署。

Gigatron 128k 8-bit Audio Emulator 是一个功能丰富的模拟器，不仅提供了完整的 Gigatron 硬件模拟，还包括了高质量的音频输出和直观的用户界面，为用户提供了出色的复古计算体验。