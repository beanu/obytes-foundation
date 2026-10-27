# Obytes Foundation — Expo SDK 58

可复用的 React Native / Expo 基础模板。来源为 Obytes PR #543 的固定提交
`43783db5f9ef237cd350f4a6e3535dfffa1454eb`，在此基础上升级和维护。
上游 MIT 许可证保留在 LICENSE；本仓库不绑定 Obytes 的 Expo 账户或 EAS 项目。

## 工具链

- 推荐 Node 24.22.1（`.nvmrc`）；Bun 1.3.14（`packageManager`）。
- Expo 58.0.19、React Native 0.88.0、React 19.3.0、TypeScript 6、Jest 30。
- iOS：Xcode 27.1、CocoaPods 1.17；最低运行系统 iOS 16.4。
- Android：Java 17 推荐；Android SDK Platform 37、Build Tools 37.0.0、NDK 27.1.12297006、CMake 3.22.1。
  Gradle 9.4.1 由原生模板的 wrapper 下载。配置 `ANDROID_HOME` 和 `JAVA_HOME`。
- 不提交生成的 ios/、android/、node_modules/ 和构建产物；原生变更通过 app.config.ts / config plugin 实现。

## 开始运行

如尚未安装 Bun，可使用 `npm install --global bun@1.3.14` 安装模板固定版本。

```sh
cp .env.example .env  # 首次使用时执行；不要覆盖已有环境配置
bun install --frozen-lockfile
bun run check-all
bun run check:dependencies
bun run doctor
bun run ios
# 或 bun run android
```

默认包含可运行的引导页、演示登录、列表网络请求、基础 UI、主题与语言切换。
演示登录使用假 token，不是真实认证服务；示例 API 是 https://dummyjson.com/。
新产品必须替换演示认证和示例功能。不要在日志中输出密码或 token。

## 从这个本地模板创建新项目

在本模板目录运行，目标必须为空且位于模板目录之外：

```sh
bun run template:create ../my-app --name "My App" --slug my-app --id com.example.myapp
cd ../my-app
git init -b main
bun install --frozen-lockfile
bun run check-all
bun run doctor
```

生成器直接复制当前本地模板，保留锁文件和上游来源信息，并重置应用名称、标识和版本。
它不复制 Git 历史、本地 .env、签名文件、原生工程、依赖缓存和构建产物。
新项目的 .env 来自 .env.example。生成器不会运行安装脚本、创建远程仓库或绑定 Expo 账户。

应用配置集中在 `foundation.config.json`：

| 字段 | 用途 |
| --- | --- |
| name | 展示名称 |
| slug | Expo slug / npm 项目名 |
| scheme | 小写深链 scheme |
| applicationId | iOS Bundle ID / Android package 的生产标识 |

development 和 preview 变体自动添加 `.development` / `.preview` 后缀，生产版无后缀。
使用 `EXPO_PUBLIC_APP_ENV` 选择变体，不使用 NODE_ENV 区分业务环境。
`EXPO_PUBLIC_*` 会进入客户端包，不能存放秘密。构建账户参数只在 app.config.ts 读取。

## 发布构建验证

```sh
bun run verify:android       # Release APK + AAB，默认验证密钥
bun run verify:ios           # 设备用 Release .xcarchive，无签名
bun run verify:ios:simulator # 模拟器用 Release .app
```

这些命令固定使用 production 变体，并通过 Expo prebuild 生成原生工程。
Android 产物在 android/app/build/outputs/；iOS 归档在 artifacts/ios/；模拟器 app 在 .build/ios-simulator/。
验证构建不能直接当作已签名的商店包：iOS 需要自己的开发者团队、分发证书和描述文件；
Android 需要自己的 upload key。模板中不保存这些凭据。
本轮验证的实际结果和限制见 [验证记录](docs/validation.md)。

## EAS 与 CI

`eas.json` 固定 SDK 58 对应的构建镜像和 Node / Bun 版本；preview 为 internal 分发，production 为 store。
使用 EAS 前，在新项目运行 `eas init` 连接自己的项目，并配置 `EXPO_ACCOUNT_OWNER` / `EAS_PROJECT_ID`。
`extra.eas.projectId` 仅在提供有效项目 ID 后生成。此模板不需要 EAS 账户即可本地编译。
如仅用于本地开发，可以不设置这两个变量。

GitHub Actions 包含质量检查和原生 Release 验证。Release 验证不依赖 Expo token 或商店证书。
GitHub 当前 macos-26 镜像列出的 Xcode 为 26.6，CI 默认使用该 SDK 58 支持的版本；
本地和 EAS 的发布验证目标是 Xcode 27.1。托管镜像提供新版本后，可通过工作流输入切换。
工作流文件已配置，但只有推送到自己的远程仓库后才会运行，不能把本地检查记为 CI 通过。

## 维护边界

业务代码放在 src/features/，路由文件放在 src/app/，通用 UI 放在 src/components/ui/，基础设施放在 src/lib/。
模板只接收多个产品共用的能力；积分规则、兑换接口、品牌资源等保留在具体产品。
升级时先更新模板，完成依赖检查、单元测试和双端 Release 验证，再把需要的变更迁移到产品。
生成后的产品是独立快照，不会自动跟随模板更新。维护方式见 [维护约定](docs/maintenance.md)。
