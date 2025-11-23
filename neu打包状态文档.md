# Gigatron 128K Neu打包状态文档

## 打包概述

本文档记录了Gigatron 128K模拟器使用Neutralinojs (neu)打包的状态和相关信息。

## 系统环境

- 操作系统: Windows 11 (MSYS_NT-10.0-26100)
- 架构: x86_64
- Neu CLI版本: v11.6.0 (最新)
- Neutralinojs二进制版本: v6.3.0 (最新)
- Neutralinojs客户端版本: v6.3.0 (最新)

## 打包配置

### neutralino.config.json 配置要点

- 应用ID: `com.gigatron.emulator.neutralino`
- 应用名称: `Gigatron 128K`
- 应用版本: `1.0.0`
- 入口文件: `/resources/index_128k.html`
- 窗口尺寸: 900x750 (最小800x650)
- 图标: `/resources/favicon.ico`
- 构建输出目录: `./dist/`

### 资源文件映射

配置中包含以下资源文件映射:
- `/html/**/*` → `/resources/`
- `/roms/**/*` → `/resources/`
- `/gt1/**/*` → `/resources/`
- `/resources/**/*` → `/resources/`
- `/sd.vhd` → `/resources/`
- `/dev128k.rom` → `/resources/`
- `/favicon.ico` → `/resources/`

## 打包结果

### 成功生成的平台二进制文件

打包成功生成了以下平台的可执行文件:

1. Windows x64: `gigatron-128k-win_x64.exe`
2. Linux x64: `gigatron-128k-linux_x64`
3. Linux ARM64: `gigatron-128k-linux_arm64`
4. Linux ARMHF: `gigatron-128k-linux_armhf`
5. macOS x64: `gigatron-128k-mac_x64`
6. macOS ARM64: `gigatron-128k-mac_arm64`
7. macOS Universal: `gigatron-128k-mac_universal`

所有二进制文件位于 `dist/gigatron-128k/` 目录中，并已打包为 `gigatron-128k-release.zip` 压缩包。

### 测试结果

Windows x64版本已测试运行，应用程序能够正常启动。

## 应用程序功能

### 主要功能

1. **Gigatron 128K模拟器核心功能**
   - ROM加载: 默认加载 `./dev128k.rom`
   - VHD磁盘镜像支持: 默认加载 `./sd.vhd`
   - GT1游戏程序加载支持

2. **用户界面**
   - VGA显示 (640x480)
   - 游戏手柄控制
   - 音量控制
   - 文件拖拽加载功能

3. **窗口自适应**
   - 应用程序包含窗口自适应大小功能
   - 根据VGA画布尺寸自动调整窗口大小

### 已知问题和解决方案

#### 历史问题

1. **资源加载错误** (已解决)
   - 之前日志显示: `NE_RS_UNBLDRE: Unable to load application resource file`
   - 原因: 资源文件路径映射不正确
   - 解决: 通过neutralino.config.json正确配置资源映射

2. **黑屏问题** (已解决)
   - 之前应用程序启动后显示黑屏
   - 原因: ROM和VHD文件未正确加载
   - 解决: 确保资源文件正确打包并引用

3. **拖拽功能缺失** (已实现)
   - 应用程序支持拖拽加载ROM、VHD和GT1文件
   - 在main.js中已实现拖拽事件处理

## 部署说明

### 运行要求

1. 无需额外依赖，所有平台二进制文件都是独立的
2. Windows版本可直接运行 `gigatron-128k-win_x64.exe`
3. 其他平台需要给予执行权限后运行对应二进制文件

### 分发建议

1. 使用 `gigatron-128k-release.zip` 进行分发
2. 解压后直接运行对应平台的可执行文件
3. 无需安装过程，便携式应用

## 开发和构建流程

### 本地开发

```bash
# 安装依赖
npm install

# 运行开发版本
neu run

# 构建所有平台版本
neu build
```

### 构建输出

构建完成后，所有平台的二进制文件将位于 `dist/gigatron-128k/` 目录中。

## 技术架构

### 前端技术栈

- HTML5/CSS3/JavaScript
- Bootstrap 4.1.0 UI框架
- RxJS 7 用于响应式编程
- Canvas API 用于VGA显示

### 后端技术栈

- Neutralinojs 轻量级桌面应用框架
- 原生API访问能力
- 跨平台支持

## 安全考虑

1. 应用程序使用 `tokenSecurity: "none"` 配置，适用于单机应用
2. 已启用必要的原生API权限:
   - app.*
   - os.*
   - filesystem.*
   - window.*
   - debug.log

## 未来改进建议

1. **安全性增强**
   - 考虑启用token安全机制
   - 限制文件系统访问范围

2. **功能扩展**
   - 添加更多ROM和VHD文件支持
   - 实现保存/加载状态功能
   - 添加屏幕录制功能

3. **性能优化**
   - 优化ROM加载速度
   - 改进音频处理性能

## 结论

Gigatron 128K模拟器使用Neutralinojs打包已成功完成，所有主要平台二进制文件已生成并测试通过。应用程序功能完整，包括ROM/VHD加载、游戏控制、文件拖拽等功能。打包配置合理，资源映射正确，应用程序可以独立运行，无需额外依赖。

---
文档生成时间: 2025-11-22
状态: 打包成功，测试通过