# SDK 58 验证记录

验证日期：2026-10-27（Asia/Shanghai）。

基础依赖：Expo 58.0.19 / React Native 0.88.0 / React 19.3.0。
工具链：Node 24.22.1 / Bun 1.3.14；本机 Xcode 27.1（27A9275）/ iOS SDK 27.1 / CocoaPods 1.17。
Android 本机使用 Android Studio 自带 JBR 25.0.2，Gradle 9.4.1 已验证能在此 JDK 运行；CI 配置使用 Java 17。

| 项目 | 结果 |
| --- | --- |
| TypeScript 严格检查 | 已通过 |
| Jest 组件测试 | 40/40 已通过；detectOpenHandles 复查无残留句柄 |
| 本地项目生成器 | 4/4 已通过，另已完成真实生成项目的锁文件安装、配置与类型检查 |
| Expo Doctor | 20/20 已通过 |
| Android Release APK / AAB | 已通过，四种 ABI；最终源码增量复核再次通过 |
| iOS 设备 Release 归档 | 已通过，Xcode 27.1 / iOS SDK 27.1，无签名 |
| iOS 模拟器 Release 运行 | Release 编译、安装、iOS 27.0 启动及引导页显示已通过 |
| GitHub Actions | 已配置，未在远程执行 |
| Maestro 自动化用例 | 修正了上游残留的页面和校验文案断言，未执行；不计入通过项 |

Web 单页输出也已通过 `bunx expo export --platform web --max-workers 2`。
已解析检查 GitHub Actions YAML 和 eas.json；远程 CI 未执行。

## 产物与日志

- Android APK：android/app/build/outputs/apk/release/app-release.apk
- Android AAB：android/app/build/outputs/bundle/release/app-release.aab
- iOS：artifacts/ios/ObytesFoundation.xcarchive
- 归档元数据：artifacts/ios/archive-metadata.json
- 构建日志：artifacts/logs/
- 产物大小、SHA-256 与 ABI 清单：artifacts/validation-results.json

核验 iOS 归档的 Bundle ID 为 com.example.foundation、部署目标为 16.4、SDK 为 iphoneos27.1，
包含 UIApplicationSceneManifest / SceneDelegate 以及 main.jsbundle。
Android APK 签名校验通过，证书为 Android Debug；APK/AAB 均包含 arm64-v8a、armeabi-v7a、x86、x86_64。

## 本机构建说明

Android 首次冷构建完成 1124 个任务，用时约 22 分钟；在最终源码上增量复核完成，用时约 2 分半。
首次构建出现默认 JVM 元空间不足提示；增量复核使用 `--max-workers=2` 和
`-Dorg.gradle.jvmargs=-Xmx3g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8`，未出现该提示。
底层依赖仍有 Gradle / Xcode 的弃用与脚本阶段提示，均未阻止构建。

CocoaPods 下载 MMKVCore 2.4.0 时遇到 GitHub Git 传输超时；本次使用官方 v2.4.0 归档作为临时缓存，
并逐一核验 86 个所需文件的 Git blob SHA-1 与官方 Git 树一致。下载地址的临时替换只作用于该次安装，
没有写入模板、Podfile 或系统 Git 配置。后续原生生成通过正常 CocoaPods 缓存安装成功。

构建日志与产物不提交 Git，也不会被新项目生成器复制。
验证使用 com.example.foundation 通用应用标识；设备归档不含商店分发签名，Android 使用验证密钥。


## 模拟器启动验证

专用设备：Obytes Foundation SDK58，iPhone 17 / iOS 27.0。
模拟器 Release 使用同一生产应用标识与内嵌 JS，在不连接 Metro 的情况下安装、启动并显示引导页。
启动后复查进程仍在运行，所采集日志中未发现 RCTFatal / Unhandled JS / Invariant Violation 等致命启动标记。
截图：artifacts/ios/release-onboarding.png；进程与日志在 artifacts/ios/simulator-process.txt、simulator-runtime.log。

深链 `obytes-foundation://login` 被系统识别，并弹出在 Obytes Foundation 中打开的确认框
（artifacts/ios/release-deeplink-confirmation.png）。DeviceHub 的 UI 自动化调用超时，
未验证确认框之后的登录页跳转，也未执行完整业务交互；这些不计入通过项。
未做 Android 真机/模拟器运行验证、商店签名上传或远程 CI 执行。
