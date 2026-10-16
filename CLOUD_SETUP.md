# 真实账号与私聊接入

当前公开站点持续使用 GitHub Pages 原地址。真实账号和消息使用独立 Supabase 项目，网页只放项目 URL 与 publishable key；不要把 service role key、数据库密码或用户密码放入仓库。

## 接入步骤

1. 在 Supabase 创建项目，记录 **Project URL** 和 **publishable key**。
2. 在 SQL Editor 运行 `supabase/migrations/202610160001_live_exchange.sql`。
3. 在 Authentication 设置中启用 Email 登录。站点地址设为 `https://yccc1106.github.io/skill-swap/`，重定向地址至少允许该完整地址。正式项目为了 48 小时公开体验暂时关闭了邮箱确认；此时注册只证明用户知道自己设置的密码，不能证明其拥有填写的邮箱。接入自定义 SMTP 后应恢复邮箱确认。
4. 本地复制 `.env.example` 为 `.env.local`，填写项目 URL 和 publishable key，运行 `pnpm dev`。
5. 分别用两个受控账号登录，给两个账号发布互补的技能卡，检查彼此可见、双向匹配、聊天即时到达和刷新后消息仍在。英文技能名大小写不影响匹配。
6. 在另一账号直接查询不属于自己的聊天，必须被 RLS 拒绝或返回空结果。完成检查后，把相同的两个公开值加入 GitHub 仓库的 Actions Variables，再触发原有 Pages workflow。部署后在原地址复查。

## 本地自动验收

已安装 Docker 的开发机可运行：

```sh
pnpm dlx supabase start --exclude studio,imgproxy,edge-runtime,logflare,vector
pnpm test:live
pnpm dlx supabase stop
```

测试会在本地 Supabase 中创建三个临时账号，验证双向匹配建会话、实时收发、历史消息与第三方隔离。不要把此测试指向正式项目。

## 数据边界

- 游客可继续体验原有虚构人物与浏览器本地演示，演示人物不会接收真实消息。
- 注册用户的技能卡、会话和消息保存在 Supabase；本地浏览器仅保存 Auth 会话。退出登录不会删除服务器消息。
- 资料对已登录用户可见，聊天只对该会话的两名参与者可见。数据库再次验证双向匹配后才允许建立会话。
- 免费服务的可用性取决于云端项目状态。上线后保持项目和 GitHub Pages 配置有效，定期用原链接检查。
- Supabase 默认邮件服务只向项目组织成员发送邮件；若要长期开放经验证的邮箱注册，需配置自定义 SMTP 并重新开启 Confirm email。当前体验期未核验邮箱归属，也不适合用于正式身份识别。
