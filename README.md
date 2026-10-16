# SkillLoop 技能互换平台

一个可在线体验的技能交换产品雏形：写下“我能教的”和“我想学的”，发现双方技能互补的伙伴，并发起交换意向。

## 在线地址

https://yccc1106.github.io/skill-swap/

这是唯一用于提交和后续迭代的 GitHub Pages 项目地址。后续版本继续部署到同一仓库的同一 Pages 站点，不使用每次构建产生的临时链接。

## 用 IDEA 打开与运行

直接在 IntelliJ IDEA 中打开本目录：/Users/yuanchengle/code/skill-swap。项目是 React + Vite 前端，不依赖 SofEng 的 Java 服务。游客演示无需数据库；真实账号和私聊需要 Supabase 项目。

    corepack enable
    pnpm install --frozen-lockfile
    pnpm dev

终端会给出本地开发地址。构建检查运行 pnpm build。

## 产品结构

- **首页**：价值主张、三步交换流程、示例伙伴。
- **技能广场**：人物卡片、搜索、能教技能筛选与双向匹配筛选；无结果时可一键清除条件。
- **发布技能**：称呼、简介、能教/想学技能、交流方式。
- **我的匹配**：按双方技能标签计算双向匹配，展示匹配规则与双方技能方向；无双向结果时提示单向相关的伙伴。
- **交换详情**：查看双方技能关系与首次交换建议；只有双向匹配时可以记录交换意向。
- **项目说明**：集中展示已实现功能、React/Vite + Supabase 的实现方式，以及通过 Supabase Edge Function 接入 OpenRouter 的 AI 客服与交换助理规划；AI 能力明确标记为尚未上线。

页面采用 Hash 路由，适配 GitHub Pages 静态托管。带 /#/matches 的页面地址可以直接打开和刷新。

## 真实互换

新增“真实互换”入口：邮箱注册登录、云端技能卡、真实用户的双向匹配、一对一私聊和实时消息。数据库采用行级权限控制，仅聊天双方能读写消息。完整接入与部署步骤见 [CLOUD_SETUP.md](CLOUD_SETUP.md)。

未配置 Supabase 时，真实入口会显示“正在接入”，游客演示继续可用。正式 Supabase 项目已配置数据库、权限及站点回跳；为满足公开体验，当前暂时关闭邮箱确认，注册后可直接登录。接入自定义 SMTP 后再恢复邮箱验证。本地数据库已运行双账号实时收发和第三方隔离验证，可用 `pnpm test:live` 在已启动的本地 Supabase 上复测。

## 数据边界

游客演示中的人物为虚构案例，演示技能卡和交换意向保存在当前浏览器的 localStorage，不会通知演示人物。真实互换入口只展示真实注册用户，技能卡、会话和消息保存在 Supabase，可跨设备同步；浏览器只保存登录会话。两种模式的用户和数据不会混用。匹配依据是明确的双向技能标签规则，不是 AI 模型。

## 部署

main 分支每次推送后，.github/workflows/deploy.yml 使用 GitHub Actions 构建并部署到 GitHub Pages。Vite 的 base 固定为 /skill-swap/。Actions Variables 已设置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_PUBLISHABLE_KEY`。每次发布后检查原地址的公开访问、游客演示、注册及私聊；不要重命名或转移仓库，否则已提交的访问地址可能改变。
