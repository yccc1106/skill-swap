# 真实账号与私聊接入

当前公开站点持续使用 GitHub Pages 原地址。真实账号和消息使用独立 Supabase 项目，网页只放项目 URL 与 publishable key；不要把 service role key、数据库密码或用户密码放入仓库。

## 接入步骤

1. 在 Supabase 创建项目，记录 **Project URL** 和 **publishable key**。
2. 在 SQL Editor 运行 `supabase/migrations/202610160001_live_exchange.sql`。
3. 在 Authentication 设置中启用 Email 登录。站点地址设为 `https://yccc1106.github.io/skill-swap/`，重定向地址至少允许该完整地址。建议保持邮件验证开启。
4. 本地复制 `.env.example` 为 `.env.local`，填写项目 URL 和 publishable key，运行 `pnpm dev`。
5. 分别用两个真实邮箱注册账号，完成邮箱验证，给两个账号发布互补的技能卡，检查彼此可见、双向匹配、聊天即时到达和刷新后消息仍在。
6. 在另一账号直接查询不属于自己的聊天，必须被 RLS 拒绝或返回空结果。完成检查后，把相同的两个公开值加入 GitHub 仓库的 Actions Variables，再触发原有 Pages workflow。部署后在原地址复查。

## 数据边界

- 游客可继续体验原有虚构人物与浏览器本地演示，演示人物不会接收真实消息。
- 注册用户的技能卡、会话和消息保存在 Supabase；本地浏览器仅保存 Auth 会话。退出登录不会删除服务器消息。
- 资料对已登录用户可见，聊天只对该会话的两名参与者可见。数据库再次验证双向匹配后才允许建立会话。
- 免费服务的可用性取决于云端项目状态。上线后保持项目和 GitHub Pages 配置有效，定期用原链接检查。
