import { ArrowRight, CheckCircle2, CircleHelp, Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import "./project-about.css";

const shipped = [
  {
    title: "游客体验与技能发现",
    detail: "不用注册即可浏览虚构案例，发布“我能教 / 我想学”，查看双向匹配原因和交换建议。演示资料保存在当前浏览器。",
  },
  {
    title: "真实账号与技能卡",
    detail: "用户可注册登录，发布自己的技能卡。资料进入云端数据库，换设备登录后仍可查看和编辑。",
  },
  {
    title: "真实匹配与一对一私聊",
    detail: "双方能教的技能分别对应对方想学的技能时，可以建立私聊。会话与消息保存在云端，只有聊天双方可读取。",
  },
];

const aiIdeas = [
  {
    number: "01",
    title: "AI 客服助手",
    detail: "回答注册、技能发布、匹配规则和交换流程中的常见问题，降低第一次使用的门槛。",
  },
  {
    number: "02",
    title: "AI 交换助理",
    detail: "根据双方技能卡，建议开场问题、互教目标和第一次交流的简单计划，由用户决定是否采用。",
  },
  {
    number: "03",
    title: "更灵活的匹配解释",
    detail: "探索用 AI 理解相近技能与学习目标，补充目前清晰可解释的双向标签规则。",
  },
];

export default function ProjectAbout() {
  return (
    <main id="main-content" tabIndex={-1} className="project-about">
      <section className="project-about-hero">
        <div className="container project-about-hero-inner">
          <div>
            <div className="project-about-kicker"><Sparkles size={16} /> ABOUT SKILLLOOP</div>
            <h1>把“我会的”和“我想学的”，<br />变成一次真实交流。</h1>
            <p>
              SkillLoop 是一个技能互换平台。先用双向匹配找到合适的伙伴，再从一对一对话开始交换技能。
              这个页面记录已经做成的功能、实现方式，以及接下来要加入的 AI 能力。
            </p>
            <div className="project-about-actions">
              <a className="button button-primary" href="#/live">体验真实互换 <ArrowRight size={17} /></a>
              <a className="button button-outline" href="#/explore">看看游客演示</a>
            </div>
          </div>
          <div className="project-about-hero-card" aria-label="技能互换产品主线">
            <span>01 · 写下技能</span>
            <strong>我能教 <b>Python</b></strong>
            <strong>我想学 <b>摄影</b></strong>
            <i>✳</i>
            <span>02 · 找到互补的人</span>
            <strong>双向匹配 → 发起私聊</strong>
            <small>让一次分享，成为彼此的新收获。</small>
          </div>
        </div>
      </section>

      <section className="container project-about-section" aria-labelledby="shipped-heading">
        <div className="project-about-section-head">
          <span className="project-about-eyebrow">CURRENT VERSION</span>
          <h2 id="shipped-heading">现在可以体验什么</h2>
          <p>游客演示用于快速了解产品；真实互换连接云端账号、技能卡和私聊。</p>
        </div>
        <div className="project-about-grid">
          {shipped.map((item) => (
            <article className="project-about-feature" key={item.title}>
              <CheckCircle2 size={24} />
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <p className="project-about-note">
          当前匹配由双方技能标签决定，英文大小写不影响比较。云端消息历史已接入；实时消息推送仍在正式环境验收。
        </p>
      </section>

      <section className="project-about-build" aria-labelledby="build-heading">
        <div className="container project-about-build-inner">
          <div className="project-about-section-head">
            <span className="project-about-eyebrow">HOW IT WORKS</span>
            <h2 id="build-heading">我是怎样实现的</h2>
            <p>用一个始终不变的公开链接承载前端，再让云端服务处理跨设备的账号和数据。</p>
          </div>
          <div className="project-about-stack">
            <div><strong>前端与部署</strong><span>React + Vite · GitHub Pages</span><p>响应式页面使用 Hash 路由，刷新后仍能回到原页面。每次迭代都发布到同一域名。</p></div>
            <div><strong>账号与数据</strong><span>Supabase Auth + PostgreSQL</span><p>真实用户的技能卡、会话与消息保存在云端；行级权限限制私聊只对双方可见。</p></div>
            <div><strong>匹配逻辑</strong><span>双向技能规则</span><p>双方“能教”各自覆盖对方“想学”时才可私聊，数据库会再次校验匹配关系。</p></div>
          </div>
        </div>
      </section>

      <section className="container project-about-section project-about-ai" aria-labelledby="ai-heading">
        <div className="project-about-section-head">
          <span className="project-about-eyebrow"><Lightbulb size={15} /> NEXT · AI ROADMAP</span>
          <h2 id="ai-heading">下一步，让 AI 帮用户更快开始交换</h2>
          <p>这些能力正在规划，当前站点尚未调用大模型。目标是帮助用户跨过“找到人以后不知道怎么聊、怎么教”的一步。</p>
        </div>
        <div className="project-about-grid">
          {aiIdeas.map((item) => (
            <article className="project-about-idea" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="project-about-ai-architecture">
          <div><MessageCircle size={21} /><strong>网页中的 AI 助手</strong></div>
          <ArrowRight size={18} />
          <div><CircleHelp size={21} /><strong>Supabase Edge Function</strong></div>
          <ArrowRight size={18} />
          <div><Sparkles size={21} /><strong>OpenRouter 模型接口</strong></div>
          <p>计划由云端函数调用 OpenRouter，密钥保留在服务端，浏览器只接收回答。AI 建议由用户确认后再用于交流。</p>
        </div>
      </section>
    </main>
  );
}
