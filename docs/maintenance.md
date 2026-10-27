# 模板维护约定

## 来源与版本

上游：https://github.com/obytes/react-native-template-obytes/pull/543
固定提交：43783db5f9ef237cd350f4a6e3535dfffa1454eb。
上游源码通过 GitHub 提交归档导入，初始 Git 提交保留了导入快照；upstream remote 仅供参考。
基础模板从 1.0.0 开始独立版本管理，具体产品由生成器从 0.1.0 开始。
Bun 锁文件决定实际安装版本；不要在安装时忽略或重新生成锁文件来掩盖问题。

## SDK 58 迁移内容

- Expo / React Native / React / 手势、动画、键盘、列表和测试依赖由 expo install --fix 对齐。
- Jest 与 React Test Renderer 对齐 React 19.3；组件 refs 改为 React Native 的实例类型。
- SDK 58 原生工程自动生成 UIKit Scene 生命周期，不再设置 enableSceneSupport。
- 去除上游 Expo owner、EAS 项目 ID、硬编码应用标识和图片角标插件。
- app.config.ts 设置 web.output=single，保留客户端单页应用行为；原生网络模块通过 client.web.tsx 与 Web 隔离。
- env.ts 只暴露公开配置；移除随模板跟踪的 .env，提供 .env.example。
- 保留 Obytes 的网络、状态、样式和 UI 示例；不迁入旧业务项目代码。
- 发布验证脚本、生成器及 CI 在本地模板上工作，不再调用克隆上游最新 tag 的旧 CLI。

## 日常变更

1. 在模板调整共享能力，避免引入某个产品专属配置。
2. 运行 bun run check-all / check:dependencies / doctor。
3. 涉及原生库或构建配置时，验证双端 Release。模拟器编译与设备归档要分别记录。
4. 用 template:create 生成临时项目，验证重命名、锁文件安装和配置。
5. 更新验证记录后再打自己的模板版本标签。不要只因上游升级就整体合并其所有技术选型。

## 产品与模板的关系

生成器创建独立代码快照，不使用指向模板目录的相对依赖，也不共享业务环境文件。
后续模板更新通过评估后的提交迁移到产品；不自动覆盖产品文件。
创建产品后需要独立配置远程仓库、Expo 项目、签名、环境与业务接口。

## 网络与认证示例

PR #543 的 Nitro Fetch 行为保留：移动端 Release 使用原生 HTTP 栈，Debug / Web 使用 Axios 默认方式。
因此涉及请求行为的变更必须验证 Release，不能仅依赖 Metro 开发模式。
登录页仍是明确标注的演示登录。正式产品实现认证时，应处理安全存储、到期、退出、缓存隔离与错误反馈，
不要把示例假 token 或无后端的登录流程直接用于生产。
