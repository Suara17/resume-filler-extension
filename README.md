# 📄 简历自动填充助手 (Resume Filler Extension)

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Data%20Privacy-100%25%20Local-success?style=flat-square" alt="Local Privacy" />
</p>

> **求职/校招/社招网申效率神器** —— 告别机械重复的手工填表！
> 一键智能识别招聘网站复杂表单，穿透主流前端框架（React / Vue / 原生），实现毫秒级自动填入与多段经历管理。

---

## 💡 为什么需要它？

在春秋招与社会招聘中，求职者常常需要在数十甚至上百个不同企业的招聘门户（如各大厂商自建校招官网、各大招聘系统等）上重复填写基本信息、多段教育背景、实习经历和项目细节。

不同系统的表单设计千奇百怪：有的是普通文本框，有的是自建模拟下拉菜单、级联选择器、年月复合选择器，还有的被前端框架深度拦截事件导致赋值后丢失……

**简历自动填充助手** 为解决这一痛点而生：
- **拒绝重复机械劳动**：一次录入或导入个人配置，各招聘门户通用。
- **兼容复杂表单**：深度兼容普通 input/textarea、自定义级联选择器、自定义下拉菜单与各类日期选择器。
- **双交互模式**：既可以通过浏览器原生 **Side Panel（侧边栏）** 统一管理，也可以使用页面内置的 **可折叠悬浮卡片（Floating Card）** 随时取用。
- **100% 数据纯本地存储**：数据仅保存在浏览器的 `chrome.storage.local` 中，不经过任何外部服务器，绝对保障个人隐私与数据安全。

---

## ✨ 核心特性

- 🚀 **一键整页智能填充**
  - 采用多维启发式算法（Label 关联、placeholder、name/id 属性、层级上下文、正则模糊匹配），精准推断表单字段意图。
  - 原生模拟 `focus`、`input`、`change`、`blur` 以及键盘/粘贴事件，完美穿透 Vue、React、Ant Design 等现代前端组件的状态管理。

- 📑 **完整支持多段经历与结构化数据**
  - **基础信息**：姓名、性别、出生日期、证件号、手机号、邮箱、微信号、政治面貌、现居地、籍贯、个人主页、GitHub、紧急联系人等数十项属性。
  - **多段教育背景**：学校、院系、所学专业、起止时间、GPA/排名、学位、所在地、导师姓名、研究方向、核心课程等。
  - **多段实习经历**：公司名称、担任职位、在职时间、职责业绩描述。
  - **多段项目经历**：项目名称、担任角色、起止时间、技术栈、项目职责、产出成果。
  - **竞赛荣誉 / 论文专利 / 外语能力 / 技能清单 / 家庭成员**：全方位覆盖中大型企业网申要求。

- 🪟 **极致易用的双交互体验**
  - **Chrome Side Panel（侧边栏）**：全局长驻，集中编辑、预览和管理多份简历配置，支持 JSON 导入/导出。
  - **页面可拖拽悬浮窗（Floating Card）**：在任何招聘页面点击右下角徽标即可展开卡片，支持自由拖拽、吸附，快速点击单项字段复制或直接填入当前输入框。

- 🪄 **内置 AI 润色与润色建议（可选）**
  - 支持配置任意兼容 OpenAI 接口标准的 API（如 OpenAI、DeepSeek、Moonshot、通义千问、Claude 等）。
  - 一键对“自我评价”、“实习职责”、“项目成果”等长文本进行结构化打磨和提炼。

- 🧪 **开箱即用的离线测试用例**
  - 内置 `test_page.html` 仿真页面，覆盖级联省市选择器、日期选择器、自定义下拉列表、多文本域等复杂场景，方便快速体验和二次开发规则调试。

---

## 🛠️ 安装与使用指南

### 1. 安装插件（开发者模式）

1. 下载或克隆本项目到本地：
   ```bash
   git clone https://github.com/username/resume-filler-extension.git
   ```
2. 打开 Chrome（或 Edge、Brave、Arc 等基于 Chromium 内核的浏览器），在地址栏输入：
   ```text
   chrome://extensions/
   ```
3. 打开右上角的 **「开发者模式」 (Developer mode)** 开关。
4. 点击左上角的 **「加载已解压的扩展程序」 (Load unpacked)**。
5. 在弹出的文件选择器中，选择本项目的根目录文件夹。
6. 安装完成后，即可在浏览器工具栏的插件列表中看到 **「简历自动填充助手」**。

---

### 2. 快速上手

#### 步骤一：录入或导入简历数据
1. 点击浏览器扩展栏的插件图标，或在任意网页右键打开 **侧边栏 (Side Panel)**。
2. 你可以直接在表单中手动填写信息；或者：
   - 点击侧边栏底部的 **「导入 JSON」**，选择项目中提供的 `resume_demo.json` 快速体验。
   - 填写完成后点击 **「保存简历」**，数据将自动保存在当前浏览器的本地存储中。

#### 步骤二：体验一键填充
1. 打开项目中自带的离线测试页面 `test_page.html`（直接双击在浏览器中打开，或拖入浏览器标签页）。
2. 点击页面右下角的蓝色圆形悬浮球，展开 **悬浮卡片**。
3. 点击卡片顶部的 **⚡ 一键整页智能填入**，即可看到整个页面的所有姓名、联系方式、多级地址、教育经历、项目细节被一次性精准填充！
4. 遇到特殊字段，也可以在悬浮卡片中点击任意字段右侧的 **📋 复制** 或 **🎯 单项填入** 按钮。

---

## 📂 项目结构

```text
resume-filler-extension/
├── manifest.json              # Chrome 扩展 Manifest V3 核心配置文件
├── background.js              # 扩展后台 Service Worker（管理快捷调用与侧边栏唤起）
├── content.js                 # 网页内容脚本：负责页面 DOM 探测、智能语义匹配与表单自动输入
├── floating_card.js           # 注入页面的悬浮交互卡片（UI 渲染、单字段复制、单项填入等）
├── sidepanel.html             # Chrome 侧边栏页面结构
├── sidepanel.js               # 侧边栏逻辑（数据持久化、导入/导出、AI 润色接口调度等）
├── style.css                  # 侧边栏样式文件
├── test_page.html             # 本地离线综合测试网页（含各类复杂组件测试环境）
├── resume_template.json       # 空白简历结构标准模板（含各字段指引）
├── resume_demo.json           # 示例脱敏演示数据（张三，供开箱测试体验）
├── .gitignore                 # Git 忽略规则（保护个人数据文件防泄露）
├── LICENSE                    # MIT 开源许可证
└── README.md                  # 本说明文档
```

---

## 🔒 隐私与安全性声明

- **零数据上报**：本项目不包含任何用户追踪、行为分析、第三方统计或广告代码。
- **纯本地存储**：所有的简历数据仅存储在用户本机 Chrome 扩展分配的独立本地沙盒中（`chrome.storage.local`）。
- **可审计透明**：全项目代码开源无编译打包混淆，所有逻辑公开透明，欢迎社区审查与监督。
- **AI 功能自愿配置**：AI 润色功能需用户自主配置并使用自己的 API Key，请求直接向用户指定的服务端地址发起，不经过任何中间转发服务器。

---

## ⚙️ 高级配置与二次开发

### 添加新招聘系统的特殊字段规则
若遇到某些系统特殊的输入框类名或标签名无法识别，可在 `content.js` 中维护相应的映射规则：
- 搜索词典字典：在 `FIELD_MAPPINGS` 对应类别中追加关键词匹配正则。
- 级联组件与下拉框：可参考 `content.js` 中 `fillSelect` 与 `handleCascader` 的实现机制增加自定义适配。

### 本地测试与规则调试
直接双击打开 `test_page.html` 并在浏览器控制台（F12）中查看 `content.js` 打印的详细匹配过程日志。

---

## 🤝 参与贡献

欢迎对本项目提出建议、Bug 反馈或提交 Pull Request！

1. Fork 本仓库
2. 创建您的分支：`git checkout -b feature/awesome-feature`
3. 提交您的修改：`git commit -m "feat: add support for xxx recruitment system"`
4. 推送到分支：`git push origin feature/awesome-feature`
5. 提交 Pull Request

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源，欢迎自由使用、修改与分发。
