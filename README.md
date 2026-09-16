# 📄 简历辅助填充助手 (Resume Filler Extension)

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/Release-v1.0.0-indigo?style=flat-square" alt="Release" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Data%20Privacy-100%25%20Local-success?style=flat-square" alt="Local Privacy" />
</p>

> **求职/校招/社招网申便携神器** —— 告别机械重复的手工切换与复制粘贴！
> 选项上智能弹出气泡、一键精准复制填入，轻量悬浮面板指哪填哪，主打**便携、快捷、跟手**的极致填写体验。

---

## 🖼️ 交互与功能示意图

<p align="center">
  <img src="assets/preview.svg" alt="功能演示与交互示意图" width="100%" />
</p>

---

## 💡 为什么选择它？

在求职季（春秋招、社招网申）中，各企业招聘网站的表单设计千差万别，全自动脚本往往容易错填或被前端校验拦截；而传统的复制粘贴需要在多个窗口或简历文档间来回切换，繁琐且费时。

**简历辅助填充助手** 专注于打造**最跟手、最可控、最便携**的网申辅助体验：
- **🫧 智能气泡，指哪填哪**：光标停在哪个输入框，就近智能推荐对应内容，无需低头翻找。
- **⚡ 一键复制，一键填入**：每一个字段都配备独立的「复制」与「填入」快捷键，精准高效。
- **🪟 随行悬浮面板**：常驻页面边缘，支持自由拖动位置与折叠展开，绝不遮挡网页正文。
- **🔒 100% 纯本地离线安全**：数据仅保存在浏览器的本地隔离存储中，不经过任何外部服务器。

---

## ✨ 核心特性

- 🫧 **选项上智能弹出气泡（跟手推荐）**
  - 当你在招聘网页点击或聚焦任意输入框时，插件会根据上下文智能匹配你的个人数据。
  - 在当前输入框旁**原地弹出精致快捷气泡**，一键直接填入推荐值，像原生输入法辅助一样顺滑顺手。

- ⚡ **一键复制与一键填入（精准快捷）**
  - 面板上每一条信息（姓名、电话、邮箱、意向岗位、学历专业、项目长文本等）均提供独立的 **「📋 复制」** 与 **「⚡ 填入」** 按钮。
  - 点击「复制」直接写入剪贴板；点击「填入」直达当前网页正获得焦点的输入框，并智能模拟原生输入事件，完美兼容 React、Vue 等主流前端组件。

- 🪟 **轻量便携的悬浮交互面板（Floating Card）**
  - 无论在哪个招聘门户，点击右下角悬浮球即可呼出便携卡片。
  - 支持**自由拖拽定位、吸附、展开与收起**，填写过程随用随点，操作极度舒适跟手。

- 📑 **多段结构化经历随选速取**
  - **基础信息一览**：覆盖姓名、证件、电话、邮箱、政治面貌、现居地、籍贯、个人网站、GitHub 等完整字段。
  - **多段经历分段提取**：支持多段教育背景、实习经历、项目细节及竞赛荣誉。可针对特定的一段经历一键展开并快速取用。

- 🪄 **内置 AI 润色辅助（可选）**
  - 支持配置任意兼容 OpenAI 接口标准的 API（如 OpenAI、DeepSeek、Moonshot、通义千问等）。
  - 可在面板中随时对“自我评价”、“实习职责”、“项目成果”等长文本进行智能提炼与字句打磨。

- 🔒 **100% 本地存储与隐私保护**
  - 数据完全存储于浏览器 `chrome.storage.local`，无任何后端上报，无用户追踪，完全离线可用。

---

## 🛠️ 安装与使用指南

### 方式一：直接下载 Release 安装包（推荐）

1. 前往 GitHub 右侧的 **[Releases](https://github.com/Suara17/resume-filler-extension/releases)** 页面。
2. 下载最新版的 `resume-filler-extension-v1.0.0.zip` 并解压到本地文件夹。
3. 打开 Chrome / Edge 浏览器，在地址栏输入：
   ```text
   chrome://extensions/
   ```
4. 开启右上角 **「开发者模式」 (Developer mode)**。
5. 点击左上角 **「加载已解压的扩展程序」 (Load unpacked)**，选择刚刚解压出来的目录即可。

---

### 方式二：源码安装

```bash
git clone https://github.com/Suara17/resume-filler-extension.git
```
在浏览器扩展管理界面中加载项目根目录即可。

---

## 🚀 快速上手流程

1. **导入/录入简历数据**：
   - 打开浏览器侧边栏（Side Panel）或点击扩展图标。
   - 点击底部的 **「导入 JSON」**，选择项目中自带的 `resume_demo.json` 即可一秒体验完整的演示数据；也可导入你自己配置好的 JSON 文件。
2. **体验智能跟手填写**：
   - 打开项目内置的离线测试页面 `test_page.html`（或任意真实招聘网站）。
   - 点击任意输入框，查看**原地弹出的智能推荐气泡**，轻点一下直接填入！
   - 或者展开右下角的**悬浮卡片**，对准需要填写的字段点击 **「⚡填入」** 或 **「📋复制」**。

---

## 📂 项目结构

```text
resume-filler-extension/
├── assets/
│   └── preview.svg            # 交互与功能高保真示意图
├── manifest.json              # Chrome 扩展 Manifest V3 核心配置文件
├── background.js              # 扩展后台 Service Worker（管理快捷调用与侧边栏唤起）
├── content.js                 # 网页内容脚本：负责页面 DOM 探测与智能气泡推荐
├── floating_card.js           # 页面悬浮交互面板（自由拖拽、一键复制填入等）
├── sidepanel.html             # Chrome 侧边栏页面
├── sidepanel.js               # 侧边栏逻辑与数据持久化
├── style.css                  # 样式文件
├── test_page.html             # 本地离线综合表单测试页面
├── resume_template.json       # 空白简历结构标准模板
├── resume_demo.json           # 示例脱敏演示数据（张三）
├── .gitignore                 # Git 忽略规则（保护个人真实简历防误传）
├── LICENSE                    # MIT 开源许可证
└── README.md                  # 本说明文档
```

---

## 🔒 隐私与安全性

- **纯本地运算**：不设任何远程中转或统计服务，所有代码开源可审计。
- **配置隔离**：项目已配置 `.gitignore`，即使在本地新建并保存了个人真实数据文件（如 `resume_data*.json`），也不会被误提交至版本控制。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源，欢迎自由使用、分发与二次开发！
