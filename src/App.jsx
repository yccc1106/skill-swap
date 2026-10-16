import { useEffect, useMemo, useState } from "react";
import LiveApp from "./live/LiveApp";
import ProjectAbout from "./ProjectAbout";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Compass,
  Edit3,
  HeartHandshake,
  Lightbulb,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const PROFILE_KEY = "skillloop.profile.v1";
const REQUESTS_KEY = "skillloop.requests.v1";
const skillOptions = [
  "Python",
  "摄影",
  "吉他",
  "英语口语",
  "PPT 设计",
  "插画",
  "剪辑",
  "烘焙",
  "健身",
  "日语",
  "写作",
  "UI 设计",
];

const demoProfile = {
  name: "小宇",
  intro: "喜欢把复杂的知识讲简单。想在周末学会用镜头记录生活。",
  teach: ["Python", "PPT 设计"],
  learn: ["摄影", "吉他"],
  mode: "线上或线下",
};

const people = [
  {
    id: "lin",
    name: "林间",
    initials: "林",
    color: "peach",
    title: "自由摄影师 · 喜欢慢慢教",
    teach: ["摄影", "剪辑"],
    learn: ["Python", "英语口语"],
    mode: "线上或线下",
    location: "杭州",
    intro:
      "可以从手机构图开始，一起把日常拍得更有故事。希望有人带我写出第一个 Python 小工具。",
  },
  {
    id: "an",
    name: "安安",
    initials: "安",
    color: "lavender",
    title: "音乐爱好者 · 零基础友好",
    teach: ["吉他", "英语口语"],
    learn: ["PPT 设计", "摄影"],
    mode: "线上",
    location: "上海",
    intro: "教你弹会第一首喜欢的歌，也想让自己的演出分享做得更好看。",
  },
  {
    id: "zhou",
    name: "阿周",
    initials: "周",
    color: "mint",
    title: "产品设计师 · 爱做笔记",
    teach: ["UI 设计", "PPT 设计"],
    learn: ["Python", "烘焙"],
    mode: "线上",
    location: "北京",
    intro: "一起拆解好看的界面和排版，期待把重复工作交给代码。",
  },
  {
    id: "xia",
    name: "夏栗",
    initials: "夏",
    color: "butter",
    title: "烘焙爱好者 · 生活实验家",
    teach: ["烘焙", "摄影"],
    learn: ["插画", "日语"],
    mode: "线下优先",
    location: "杭州",
    intro: "从零做一份不翻车的甜点，顺便分享食物摄影小诀窍。",
  },
  {
    id: "mu",
    name: "木木",
    initials: "木",
    color: "sky",
    title: "开发者 · 喜欢结伴学习",
    teach: ["Python", "剪辑"],
    learn: ["吉他", "健身"],
    mode: "线上或线下",
    location: "深圳",
    intro: "用小项目带你入门 Python，也想让每天的练琴更有节奏。",
  },
  {
    id: "ning",
    name: "宁宁",
    initials: "宁",
    color: "rose",
    title: "插画师 · 擅长视觉表达",
    teach: ["插画", "UI 设计"],
    learn: ["英语口语", "剪辑"],
    mode: "线上",
    location: "成都",
    intro: "不需要绘画基础，先画出你的第一张小插画。",
  },
];

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function currentRoute() {
  const route = window.location.hash.replace(/^#/, "") || "/";
  return route.startsWith("/") ? route : "/";
}

function getMatch(profile, person) {
  const youTeach = person.learn.filter((skill) =>
    profile.teach.includes(skill),
  );
  const theyTeach = person.teach.filter((skill) =>
    profile.learn.includes(skill),
  );
  return {
    youTeach,
    theyTeach,
    mutual: youTeach.length > 0 && theyTeach.length > 0,
  };
}

function navigate(path) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Tag({ children, kind = "plain" }) {
  return <span className={`tag tag-${kind}`}>{children}</span>;
}

function Avatar({ person, size = "normal" }) {
  return (
    <div
      className={`avatar avatar-${person.color || "indigo"} avatar-${size}`}
      aria-hidden="true"
    >
      {person.initials || person.name?.slice(0, 1)}
    </div>
  );
}

function Logo() {
  return (
    <button
      className="logo"
      onClick={() => navigate("/")}
      aria-label="返回首页"
    >
      <span className="logo-mark">
        <HeartHandshake size={21} strokeWidth={2.2} />
      </span>
      <span>
        Skill<span className="logo-accent">Loop</span>
      </span>
    </button>
  );
}

function PersonCard({ person, profile, compact = false }) {
  const match = getMatch(profile, person);
  return (
    <article className={`person-card ${compact ? "compact" : ""}`}>
      <div className="person-top">
        <Avatar person={person} />
        <div className="person-meta">
          <h3>{person.name}</h3>
          <p>{person.title}</p>
        </div>
        <button
          className="icon-button card-arrow"
          onClick={() => navigate(`/exchange/${person.id}`)}
          aria-label={`查看${person.name}的交换详情`}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
      <p className="person-intro">{person.intro}</p>
      <div className="skill-row">
        <span className="skill-label teach-label">能教</span>
        <div className="skill-tags">
          {person.teach.map((skill) => (
            <Tag kind="teach" key={skill}>
              {skill}
            </Tag>
          ))}
        </div>
      </div>
      <div className="skill-row">
        <span className="skill-label learn-label">想学</span>
        <div className="skill-tags">
          {person.learn.map((skill) => (
            <Tag kind="learn" key={skill}>
              {skill}
            </Tag>
          ))}
        </div>
      </div>
      <div className="card-bottom">
        <span>
          <MapPin size={14} />
          {person.location} · {person.mode}
        </span>
        {match.mutual ? (
          <span className="mutual-pill">
            <Sparkles size={13} /> 双向匹配
          </span>
        ) : (
          <button
            className="text-link"
            onClick={() => navigate(`/exchange/${person.id}`)}
          >
            查看详情 <ArrowRight size={14} />
          </button>
        )}
      </div>
    </article>
  );
}

function Hero({ profile }) {
  const feature = people[0];
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A little skill goes a long way
          </div>
          <h1>
            用你的擅长，
            <br />
            <em>换一次想学。</em>
          </h1>
          <p className="hero-subtitle">
            会一点，也能教一点。把你的技能分享出去，遇见刚好能教你另一件事的人，让学习从交换开始。
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={() => navigate("/publish")}
            >
              发布我的技能 <ArrowUpRight size={18} />
            </button>
            <button
              className="button button-outline"
              onClick={() => navigate("/explore")}
            >
              逛逛技能广场 <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-note">
            <div className="mini-avatars">
              <span>林</span>
              <span>安</span>
              <span>木</span>
            </div>
            <span>从一次互相启发的交流开始</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="技能互换示意">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="floating-spark spark-one">✦</div>
          <div className="floating-spark spark-two">✳</div>
          <div className="hero-card hero-card-back">
            <div className="hero-person">
              <Avatar person={feature} size="small" />
              <div>
                <strong>林间</strong>
                <small>我能教</small>
              </div>
            </div>
            <div className="hero-skill">
              <Camera size={23} /> 摄影
            </div>
          </div>
          <div className="swap-center">
            <HeartHandshake size={24} />
          </div>
          <div className="hero-card hero-card-front">
            <div className="hero-person">
              <Avatar
                person={{ name: profile.name, color: "indigo" }}
                size="small"
              />
              <div>
                <strong>{profile.name}</strong>
                <small>我能教</small>
              </div>
            </div>
            <div className="hero-skill">
              <span className="code-mark">&lt;/&gt;</span>{" "}
              {profile.teach[0] || "Python"}
            </div>
          </div>
          <div className="visual-caption">
            <Sparkles size={15} /> 刚好，你们可以互相教
          </div>
        </div>
      </section>
      <section className="value-strip">
        <div className="container value-inner">
          <span>
            <span className="value-icon">
              <BookOpen size={18} />
            </span>{" "}
            以技能换技能
          </span>
          <span>
            <span className="value-icon">
              <HeartHandshake size={18} />
            </span>{" "}
            双向互相成就
          </span>
          <span>
            <span className="value-icon">
              <Compass size={18} />
            </span>{" "}
            从兴趣走向行动
          </span>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <div className="section-kicker">HOW IT WORKS</div>
            <h2>三步，开启一场新学习</h2>
            <p>不用先成为专家，把你已经会的分享出去就好。</p>
          </div>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon step-icon-one">
              <Edit3 size={27} />
            </div>
            <h3>写下你的技能</h3>
            <p>告诉大家你能教什么、想学什么，还有你喜欢怎样交流。</p>
            <ArrowDownRight size={21} className="step-arrow" />
          </div>
          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon step-icon-two">
              <Sparkles size={27} />
            </div>
            <h3>发现刚好的对方</h3>
            <p>双向技能对应时，会直接展示交换关系和匹配原因。</p>
            <ArrowDownRight size={21} className="step-arrow" />
          </div>
          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon step-icon-three">
              <MessageCircle size={27} />
            </div>
            <h3>发出交换邀请</h3>
            <p>先聊学习目标和时间，再把一次交流变成真实的进步。</p>
            <ArrowDownRight size={21} className="step-arrow" />
          </div>
        </div>
      </section>
      <section className="section featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="section-kicker">PEOPLE & POSSIBILITIES</div>
              <h2>每个人，都有值得分享的事</h2>
              <p>从一个人、一项技能、一场对话开始。</p>
            </div>
            <button
              className="text-link heading-link"
              onClick={() => navigate("/explore")}
            >
              探索更多 <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="people-grid">
            {people.slice(0, 3).map((person) => (
              <PersonCard key={person.id} person={person} profile={profile} />
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section container">
        <div className="cta-art">
          <span>✳</span>
          <span>✦</span>
          <span>✧</span>
        </div>
        <div>
          <div className="section-kicker">YOUR TURN</div>
          <h2>你会的，可能正是别人想学的。</h2>
          <p>写下你的技能，看看会遇到谁。</p>
        </div>
        <button
          className="button button-light"
          onClick={() => navigate("/publish")}
        >
          开始交换 <ArrowUpRight size={18} />
        </button>
      </section>
    </>
  );
}

function Explore({ profile }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [mutualOnly, setMutualOnly] = useState(false);
  const filtered = people.filter((person) => {
    const matchesText =
      `${person.name} ${person.title} ${person.teach.join(" ")} ${person.learn.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    return (
      matchesText &&
      (filter === "全部" || person.teach.includes(filter)) &&
      (!mutualOnly || getMatch(profile, person).mutual)
    );
  });
  return (
    <main id="main-content" tabIndex={-1} className="page container">
      <div className="page-heading">
        <div className="section-kicker">SKILL MARKET</div>
        <h1>
          技能广场<span className="heading-star">✳</span>
        </h1>
        <p>找到想认识的人，也发现自己下一项想学的技能。</p>
      </div>
      <div className="explore-toolbar">
        <div className="search-box">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索技能或伙伴，例如摄影、Python"
            aria-label="搜索技能或伙伴"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="清除搜索">
              <X size={17} />
            </button>
          )}
        </div>
        <button
          className="button button-primary toolbar-publish"
          onClick={() => navigate("/publish")}
        >
          <Plus size={17} /> 发布技能
        </button>
      </div>
      <div className="filter-wrap">
        <span>能教：</span>
        <div className="filter-chips">
          {["全部", "摄影", "Python", "吉他", "UI 设计", "烘焙", "插画"].map(
            (item) => (
              <button
                key={item}
                className={
                  filter === item ? "filter-chip active" : "filter-chip"
                }
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          className={
            mutualOnly
              ? "filter-chip mutual-filter active"
              : "filter-chip mutual-filter"
          }
          aria-pressed={mutualOnly}
          onClick={() => setMutualOnly(!mutualOnly)}
        >
          <Sparkles size={14} /> 只看双向匹配
        </button>
      </div>
      <div className="result-header">
        <strong>找到 {filtered.length} 位伙伴</strong>
        <span>人物和故事均为演示数据</span>
      </div>
      {filtered.length ? (
        <div className="people-grid">
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={34} />
          <h2>暂时没有找到对应的人</h2>
          <p>当前筛选条件下没有结果。清除条件，看看更多可以交换的技能。</p>
          <button
            className="button button-primary"
            onClick={() => {
              setQuery("");
              setFilter("全部");
              setMutualOnly(false);
            }}
          >
            清除筛选 <ArrowRight size={16} />
          </button>
        </div>
      )}
    </main>
  );
}

function SkillInput({ label, value, onChange, kind, helper }) {
  const [draft, setDraft] = useState("");
  const add = (skill) => {
    const cleaned = skill.trim().slice(0, 24);
    if (cleaned && !value.includes(cleaned) && value.length < 6)
      onChange([...value, cleaned]);
    setDraft("");
  };
  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={`skill-${kind}`}>
          {label} <span>*</span>
        </label>
        <small>最多 6 项</small>
      </div>
      <p className="field-helper">{helper}</p>
      <div className="selected-skills">
        {value.map((skill) => (
          <span key={skill} className={`selected-tag selected-${kind}`}>
            {skill}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== skill))}
              aria-label={`移除${skill}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      <div className="skill-input">
        <input
          id={`skill-${kind}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            }
          }}
          placeholder="输入技能后按回车添加"
          maxLength={24}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          aria-label={`添加${label}技能`}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="suggestions">
        <span>试试：</span>
        {skillOptions
          .filter((skill) => !value.includes(skill))
          .slice(0, 6)
          .map((skill) => (
            <button type="button" key={skill} onClick={() => add(skill)}>
              + {skill}
            </button>
          ))}
      </div>
    </div>
  );
}

function Publish({ profile, setProfile, hasSaved }) {
  const [form, setForm] = useState(profile);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setForm(profile);
  }, [profile]);
  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSaved(false);
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("请填写你的称呼");
      return;
    }
    if (!form.teach.length || !form.learn.length) {
      setError("“能教”和“想学”都至少添加一项技能");
      return;
    }
    if (form.teach.some((skill) => form.learn.includes(skill))) {
      setError("同一项技能不能同时放在“能教”和“想学”中");
      return;
    }
    setProfile({
      ...form,
      name: form.name.trim().slice(0, 20),
      intro: form.intro.trim().slice(0, 140),
    });
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <main id="main-content" tabIndex={-1} className="page container">
      <div className="page-heading">
        <div className="section-kicker">YOUR SKILLS</div>
        <h1>
          {hasSaved ? "编辑我的技能卡" : "发布我的技能卡"}
          <span className="heading-star">✳</span>
        </h1>
        <p>无需头衔，认真分享你会的，就已经是很好的开始。</p>
      </div>
      <div className="publish-layout">
        <form className="publish-form" onSubmit={submit}>
          <div className="form-section-header">
            <span className="form-section-icon">
              <Users size={19} />
            </span>
            <div>
              <h2>先认识一下你</h2>
              <p>让交换伙伴知道该怎么称呼你。</p>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nickname">
              称呼 <span>*</span>
            </label>
            <input
              id="nickname"
              className="text-input"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              maxLength={20}
              placeholder="例如：小宇"
            />
          </div>
          <div className="form-group">
            <label htmlFor="intro">一句话介绍</label>
            <textarea
              id="intro"
              className="text-input"
              value={form.intro}
              onChange={(event) => update("intro", event.target.value)}
              maxLength={140}
              rows={3}
              placeholder="说说你的擅长、目标或想交流的话题"
            />
          </div>
          <div className="form-divider" />
          <div className="form-section-header">
            <span className="form-section-icon mint-icon">
              <HeartHandshake size={19} />
            </span>
            <div>
              <h2>你想交换什么？</h2>
              <p>技能可以是正式经验，也可以是愿意分享的小心得。</p>
            </div>
          </div>
          <SkillInput
            label="我能教的"
            helper="选你有把握带别人入门的技能"
            value={form.teach}
            onChange={(value) => update("teach", value)}
            kind="teach"
          />
          <SkillInput
            label="我想学的"
            helper="写下你最想开始的一件事"
            value={form.learn}
            onChange={(value) => update("learn", value)}
            kind="learn"
          />
          <div className="form-group">
            <label htmlFor="mode">交流方式</label>
            <div className="select-wrap">
              <select
                id="mode"
                className="text-input"
                value={form.mode}
                onChange={(event) => update("mode", event.target.value)}
              >
                <option>线上或线下</option>
                <option>线上</option>
                <option>线下优先</option>
              </select>
              <ChevronDown size={17} />
            </div>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          {saved && (
            <div className="form-success" role="status">
              <CheckCircle2 size={18} />{" "}
              技能卡已保存在当前浏览器，去看看新的匹配吧。
            </div>
          )}
          <div className="form-actions">
            <button className="button button-primary" type="submit">
              {hasSaved ? "保存修改" : "发布技能卡"} <ArrowUpRight size={18} />
            </button>
            {saved && (
              <button
                className="button button-outline"
                type="button"
                onClick={() => navigate("/matches")}
              >
                查看我的匹配 <ArrowRight size={17} />
              </button>
            )}
          </div>
        </form>
        <aside className="publish-aside">
          <div className="aside-illustration">
            <div className="aside-circle">
              <Lightbulb size={42} />
            </div>
            <span>✦</span>
            <span>✳</span>
          </div>
          <h3>好的交换，从真诚介绍开始</h3>
          <p>
            写得具体一些，更容易找到合适的伙伴。比如“带你用 Python
            做第一个小工具”，比“会编程”更能让人了解你。
          </p>
          <div className="aside-tip">
            <CircleHelp size={17} />
            <span>
              这是演示版：资料仅保存在你当前使用的浏览器，不会发送给其他人。
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Matches({ profile, hasSaved }) {
  const candidates = people.map((person) => ({
    person,
    match: getMatch(profile, person),
  }));
  const matched = candidates.filter((item) => item.match.mutual);
  const closeMatches = candidates
    .filter(
      (item) =>
        !item.match.mutual &&
        (item.match.youTeach.length || item.match.theyTeach.length),
    )
    .slice(0, 2);
  return (
    <main id="main-content" tabIndex={-1} className="page container">
      <div className="page-heading">
        <div className="section-kicker">A GOOD EXCHANGE</div>
        <h1>
          我的匹配<span className="heading-star">✳</span>
        </h1>
        <p>匹配不靠神秘分数，只看你们能否互相教会对方想学的事。</p>
      </div>
      <div className="my-profile-banner">
        <div className="banner-main">
          <Avatar person={{ name: profile.name, color: "indigo" }} />
          <div>
            <span className="tiny-label">
              {hasSaved ? "我的技能卡" : "示例体验身份"}
            </span>
            <h2>{profile.name}，看看谁和你刚好互补</h2>
            <p>
              你能教 {profile.teach.join("、")} · 想学{" "}
              {profile.learn.join("、")}
            </p>
          </div>
        </div>
        <button
          className="button button-outline"
          onClick={() => navigate("/publish")}
        >
          {hasSaved ? "编辑技能卡" : "发布我的技能"} <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="match-rule">
        <div className="match-rule-title">
          <Sparkles size={18} />
          <strong>为什么是双向匹配？</strong>
        </div>
        <div className="match-rule-steps">
          <span>
            <CheckCircle2 size={16} /> 你能教 TA 想学的
          </span>
          <span>
            <CheckCircle2 size={16} /> TA 能教你想学的
          </span>
        </div>
        <p>
          两个条件同时成立才会出现在这里。这里展示的是可解释的技能标签规则，不是
          AI 匹配分数。
        </p>
      </div>
      <div className="result-header">
        <strong>{matched.length} 组双向匹配</strong>
        <span>依据双方能教与想学的技能标签</span>
      </div>
      {matched.length ? (
        <div className="matches-grid">
          {matched.map(({ person, match }) => (
            <article className="match-card" key={person.id}>
              <div className="match-card-head">
                <div className="match-avatars">
                  <Avatar
                    person={{ name: profile.name, color: "indigo" }}
                    size="small"
                  />
                  <span>
                    <HeartHandshake size={15} />
                  </span>
                  <Avatar person={person} size="small" />
                </div>
                <span className="mutual-pill">
                  <Sparkles size={13} /> 双向匹配
                </span>
              </div>
              <h2>你和{person.name}，刚好能互相教</h2>
              <p className="match-subtitle">彼此的擅长，正是对方想学的。</p>
              <div className="exchange-lines">
                <div>
                  <span className="exchange-direction">你教 TA</span>
                  <strong>{match.youTeach.join("、")}</strong>
                  <ArrowRight size={16} />
                </div>
                <div>
                  <span className="exchange-direction direction-purple">
                    TA 教你
                  </span>
                  <strong>{match.theyTeach.join("、")}</strong>
                  <ArrowLeft size={16} />
                </div>
              </div>
              <button
                className="button button-primary button-wide"
                onClick={() => navigate(`/exchange/${person.id}`)}
              >
                查看交换详情 <ArrowUpRight size={17} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="empty-state">
            <Sparkles size={36} />
            <h2>暂时没有双向匹配</h2>
            <p>试着增加一项你能教或想学的技能，匹配结果会随技能卡更新。</p>
            <div className="empty-actions">
              <button
                className="button button-primary"
                onClick={() => navigate("/publish")}
              >
                调整技能卡 <ArrowRight size={16} />
              </button>
              <button
                className="button button-outline"
                onClick={() => navigate("/explore")}
              >
                逛逛广场
              </button>
            </div>
          </div>
          {closeMatches.length > 0 && (
            <section className="close-matches">
              <h2>还可以看看这些伙伴</h2>
              <p>你们目前只有一个方向的技能对应，也许能给你一些新的灵感。</p>
              <div className="close-match-list">
                {closeMatches.map(({ person, match }) => (
                  <button
                    key={person.id}
                    onClick={() => navigate(`/exchange/${person.id}`)}
                  >
                    <Avatar person={person} size="small" />
                    <span>
                      <strong>{person.name}</strong>
                      <small>
                        {match.youTeach.length
                          ? `你能教 TA：${match.youTeach.join("、")}`
                          : `TA 能教你：${match.theyTeach.join("、")}`}
                      </small>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Exchange({ person, profile, requests, setRequests }) {
  const match = getMatch(profile, person);
  const requested = match.mutual && requests.includes(person.id);
  const request = () => {
    if (match.mutual && !requested) setRequests([...requests, person.id]);
  };
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page container exchange-page"
    >
      <button
        className="back-link"
        onClick={() => navigate(match.mutual ? "/matches" : "/explore")}
      >
        <ArrowLeft size={17} /> 返回{match.mutual ? "我的匹配" : "技能广场"}
      </button>
      <div className="detail-grid">
        <section className="detail-main">
          <div className="detail-person">
            <Avatar person={person} size="large" />
            <div>
              <span className="tiny-label">技能伙伴 · 演示人物</span>
              <h1>{person.name}</h1>
              <p>{person.title}</p>
              <span className="detail-location">
                <MapPin size={15} /> {person.location} · {person.mode}
              </span>
            </div>
          </div>
          <div className="detail-about">
            <h2>关于 TA</h2>
            <p>{person.intro}</p>
          </div>
          <div className="detail-skill-block">
            <h2>TA 的技能</h2>
            <div className="skill-row">
              <span className="skill-label teach-label">能教</span>
              <div className="skill-tags">
                {person.teach.map((skill) => (
                  <Tag kind="teach" key={skill}>
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="skill-row">
              <span className="skill-label learn-label">想学</span>
              <div className="skill-tags">
                {person.learn.map((skill) => (
                  <Tag kind="learn" key={skill}>
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
          <div className="detail-advice">
            <Lightbulb size={20} />
            <div>
              <strong>交流小建议</strong>
              <p>
                先说清各自想达成的小目标，再商量交流时间和方式。一次 30
                分钟的体验，也可能是很好的开始。
              </p>
            </div>
          </div>
          {match.mutual && (
            <div className="first-session">
              <h2>第一次交换，可以这样开始</h2>
              <div className="session-steps">
                <div>
                  <span>01</span>
                  <strong>说目标</strong>
                  <p>各自说一个想完成的小成果。</p>
                </div>
                <div>
                  <span>02</span>
                  <strong>定方式</strong>
                  <p>商量线上或线下、时长和时间。</p>
                </div>
                <div>
                  <span>03</span>
                  <strong>互相教</strong>
                  <p>轮流分享，再约定下一次练习。</p>
                </div>
              </div>
            </div>
          )}
        </section>
        <aside className="exchange-panel">
          <div className="panel-kicker">
            <Sparkles size={16} /> MATCH INSIGHT
          </div>
          <h2>
            {match.mutual ? "你们刚好互相需要" : "先认识，也许会有新可能"}
          </h2>
          <p>
            {match.mutual
              ? "双方的“能教”与“想学”恰好对应，适合发起技能交换。"
              : "目前还不是双向匹配，你可以先调整技能卡，看看能否找到共同的交换方向。"}
          </p>
          <div className="exchange-summary">
            <div>
              <span>你可以教 TA</span>
              <strong>
                {match.youTeach.length
                  ? match.youTeach.join("、")
                  : "暂无对应技能"}
              </strong>
            </div>
            <span className="summary-swap">
              <HeartHandshake size={19} />
            </span>
            <div>
              <span>TA 可以教你</span>
              <strong>
                {match.theyTeach.length
                  ? match.theyTeach.join("、")
                  : "暂无对应技能"}
              </strong>
            </div>
          </div>
          {requested ? (
            <div className="request-done" role="status">
              <CheckCircle2 size={20} />
              <div>
                <strong>交换意向已记录</strong>
                <span>此演示仅保存在当前浏览器，尚未通知对方。</span>
              </div>
            </div>
          ) : match.mutual ? (
            <button
              className="button button-primary button-wide"
              onClick={request}
            >
              <Send size={17} /> 发起交换意向
            </button>
          ) : (
            <button
              className="button button-outline button-wide"
              onClick={() => navigate("/publish")}
            >
              调整我的技能卡 <ArrowRight size={17} />
            </button>
          )}
          <p className="panel-footnote">
            演示版不会发送真实消息或收集联系方式。
          </p>
        </aside>
      </div>
    </main>
  );
}

function App() {
  const [route, setRoute] = useState(currentRoute);
  const [profile, setProfileState] = useState(() =>
    readStored(PROFILE_KEY, demoProfile),
  );
  const [hasSaved, setHasSaved] = useState(() =>
    Boolean(readStored(PROFILE_KEY, null)),
  );
  const [requests, setRequestsState] = useState(() =>
    readStored(REQUESTS_KEY, []),
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    const onHashChange = () => {
      setRoute(currentRoute());
      setMobileMenu(false);
      requestAnimationFrame(() =>
        document.getElementById("main-content")?.focus(),
      );
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const setProfile = (next) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    setProfileState(next);
    setHasSaved(true);
  };
  const setRequests = (next) => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(next));
    setRequestsState(next);
  };
  const selectedPerson = useMemo(
    () =>
      route.startsWith("/exchange/")
        ? people.find((person) => person.id === route.split("/")[2])
        : null,
    [route],
  );
  const navItems = [
    { path: "/", label: "首页" },
    { path: "/explore", label: "技能广场" },
    { path: "/matches", label: "我的匹配" },
    { path: "/live", label: "真实互换" },
  ];
  return (
    <div className="site-shell">
      <button
        className="skip-link"
        onClick={() => document.getElementById("main-content")?.focus()}
      >
        跳转到主要内容
      </button>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav
            className={mobileMenu ? "nav-links open" : "nav-links"}
            aria-label="主导航"
          >
            {navItems.map((item) => (
              <button
                key={item.path}
                className={route === item.path ? "nav-item active" : "nav-item"}
                aria-current={route === item.path ? "page" : undefined}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
            <button
              className="button button-primary nav-cta"
              onClick={() => navigate("/publish")}
            >
              发布技能 <ArrowUpRight size={16} />
            </button>
          </nav>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label={mobileMenu ? "关闭菜单" : "打开菜单"}
          >
            {mobileMenu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <div className="demo-bar">
        <div className="container">
          <Sparkles size={14} />
          <span>
            {route === "/about"
              ? "项目说明 · 已实现功能、技术方案与 AI 下一步"
              : route === "/live"
              ? "真实互换：账号、技能卡和私聊使用云端存储；游客仍可体验本地演示"
              : "作品演示版 · 人物为虚构示例，发布与申请数据仅保存在当前浏览器"}
          </span>
          <button className="demo-bar-link" onClick={() => navigate("/about")}>查看项目说明 <ArrowRight size={13} /></button>
        </div>
      </div>
      {route === "/live" ? (
        <LiveApp />
      ) : route === "/about" ? (
        <ProjectAbout />
      ) : route === "/" ? (
        <main id="main-content" tabIndex={-1}>
          <Hero profile={profile} />
        </main>
      ) : route === "/explore" ? (
        <Explore profile={profile} />
      ) : route === "/publish" ? (
        <Publish
          profile={profile}
          setProfile={setProfile}
          hasSaved={hasSaved}
        />
      ) : route === "/matches" ? (
        <Matches profile={profile} hasSaved={hasSaved} />
      ) : selectedPerson ? (
        <Exchange
          person={selectedPerson}
          profile={profile}
          requests={requests}
          setRequests={setRequests}
        />
      ) : (
        <main id="main-content" tabIndex={-1} className="page container">
          <div className="empty-state">
            <h1>没有找到这个页面</h1>
            <button
              className="button button-primary"
              onClick={() => navigate("/")}
            >
              返回首页 <ArrowRight size={16} />
            </button>
          </div>
        </main>
      )}
      <footer className="site-footer">
        <div className="container footer-main">
          <div>
            <Logo />
            <p>让每一次分享，都成为新的开始。</p>
          </div>
          <div className="footer-links">
            <button onClick={() => navigate("/explore")}>技能广场</button>
            <button onClick={() => navigate("/publish")}>发布技能</button>
            <button onClick={() => navigate("/matches")}>我的匹配</button>
            <button onClick={() => navigate("/live")}>真实互换</button>
            <button onClick={() => navigate("/about")}>项目说明</button>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 SkillLoop · 技能交换平台概念作品</span>
          <span>用你的擅长，换一次想学。</span>
        </div>
      </footer>
      <nav className="mobile-bottom-nav" aria-label="移动端导航">
        <button
          className={route === "/" ? "active" : ""}
          onClick={() => navigate("/")}
        >
          <Compass size={19} />
          首页
        </button>
        <button
          className={route === "/explore" ? "active" : ""}
          onClick={() => navigate("/explore")}
        >
          <Search size={19} />
          探索
        </button>
        <button
          className={route === "/publish" ? "active" : ""}
          onClick={() => navigate("/publish")}
        >
          <Plus size={20} />
          发布
        </button>
        <button
          className={route === "/matches" ? "active" : ""}
          onClick={() => navigate("/matches")}
        >
          <HeartHandshake size={19} />
          匹配
        </button>
        <button
          className={route === "/live" ? "active" : ""}
          onClick={() => navigate("/live")}
        >
          <MessageCircle size={19} />
          实时
        </button>
      </nav>
    </div>
  );
}

export default App;
