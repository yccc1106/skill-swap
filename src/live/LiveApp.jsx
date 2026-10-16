import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LogOut, RefreshCw, Users } from "lucide-react";
import { cloudConfigured, supabase } from "./supabase";
import "./live.css";

const defaultCard = { name: "", intro: "", teach: "", learn: "", mode: "线上" };

function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const credentials = { email: email.trim(), password };
    const result = isRegister
      ? await supabase.auth.signUp({
          ...credentials,
          options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
        })
      : await supabase.auth.signInWithPassword(credentials);
    setBusy(false);
    if (result.error) {
      setError(result.error.message);
    } else if (isRegister && !result.data.session) {
      setNotice("注册邮件已发送，请完成邮箱验证后回来登录。若邮箱已注册，也可直接尝试登录。");
    } else {
      setPassword("");
    }
  }

  return (
    <section className="live-auth-panel">
      <div className="live-eyebrow">REAL EXCHANGE</div>
      <h1>{isRegister ? "创建账号，开始互教" : "登录真实互换"}</h1>
      <p>注册后发布技能卡，找到真实用户并在这里一对一交流。</p>
      <form className="live-form" onSubmit={submit}>
        <label htmlFor="live-email">邮箱</label>
        <input id="live-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <label htmlFor="live-password">密码</label>
        <input id="live-password" type="password" minLength={6} autoComplete={isRegister ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 6 位" />
        {error && <p className="live-error" role="alert">{error}</p>}
        {notice && <p className="live-notice" role="status">{notice}</p>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "请稍候…" : isRegister ? "注册账号" : "登录账号"} <ArrowRight size={17} /></button>
      </form>
      <button className="live-text-button" type="button" onClick={() => { setIsRegister(!isRegister); setError(""); setNotice(""); }}>
        {isRegister ? "已有账号？去登录" : "还没有账号？去注册"}
      </button>
      <p className="live-auth-footnote">游客可继续浏览原有演示；虚构人物不会收到消息。</p>
    </section>
  );
}

function splitSkills(value) {
  return [...new Set(value.split(/[，,、\n]/).map((part) => part.trim()).filter(Boolean))];
}

function ProfileForm({ user, current, onSaved }) {
  const [form, setForm] = useState(() => current ? {
    name: current.name, intro: current.intro,
    teach: current.teach.join("，"), learn: current.learn.join("，"), mode: current.mode,
  } : defaultCard);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const teach = splitSkills(form.teach);
    const learn = splitSkills(form.learn);
    if (!form.name.trim() || !teach.length || !learn.length) {
      setError("请填写称呼，并分别填写至少一项能教和想学的技能。");
      return;
    }
    if (teach.length > 8 || learn.length > 8 || [...teach, ...learn].some((skill) => skill.length > 24)) {
      setError("每个方向最多 8 项，每项不超过 24 个字。");
      return;
    }
    if (teach.some((skill) => learn.includes(skill))) {
      setError("同一项技能不能同时放在两个方向。");
      return;
    }
    const values = { name: form.name.trim(), intro: form.intro.trim(), teach, learn, mode: form.mode, updated_at: new Date().toISOString() };
    setBusy(true);
    setError("");
    const result = current
      ? await supabase.from("skill_profiles").update(values).eq("id", user.id)
      : await supabase.from("skill_profiles").insert({ id: user.id, ...values });
    setBusy(false);
    if (result.error) setError(`保存失败：${result.error.message}`);
    else onSaved();
  }

  function field(key, value) { setForm((old) => ({ ...old, [key]: value })); setError(""); }
  return (
    <section className="live-card live-profile-form">
      <div className="live-eyebrow">YOUR REAL PROFILE</div>
      <h2>{current ? "编辑真实技能卡" : "发布真实技能卡"}</h2>
      <p>已登录用户可以看到这张卡。技能用逗号分隔，匹配按完整技能名称计算。</p>
      <form className="live-form" onSubmit={submit}>
        <label htmlFor="real-name">称呼</label>
        <input id="real-name" value={form.name} maxLength={20} required onChange={(e) => field("name", e.target.value)} placeholder="例如：小宇" />
        <label htmlFor="real-intro">一句话介绍</label>
        <textarea id="real-intro" value={form.intro} maxLength={140} rows={3} onChange={(e) => field("intro", e.target.value)} placeholder="你希望和伙伴如何交流？" />
        <label htmlFor="real-teach">我能教的</label>
        <input id="real-teach" value={form.teach} required onChange={(e) => field("teach", e.target.value)} placeholder="Python，PPT 设计" />
        <label htmlFor="real-learn">我想学的</label>
        <input id="real-learn" value={form.learn} required onChange={(e) => field("learn", e.target.value)} placeholder="摄影，吉他" />
        <label htmlFor="real-mode">交流方式</label>
        <select id="real-mode" value={form.mode} onChange={(e) => field("mode", e.target.value)}><option>线上</option><option>线上或线下</option><option>线下优先</option></select>
        {error && <p className="live-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "保存中…" : "保存真实技能卡"} <CheckCircle2 size={17} /></button>
      </form>
    </section>
  );
}

export default function LiveApp() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let active = true;
    setProfileLoading(true);
    supabase.from("skill_profiles").select("id,name,intro,teach,learn,mode").eq("id", user.id).maybeSingle()
      .then(({ data, error: loadError }) => {
        if (!active) return;
        setProfile(data);
        setError(loadError ? `读取资料失败：${loadError.message}` : "");
        setProfileLoading(false);
      });
    return () => { active = false; };
  }, [user, refreshIndex]);

  return (
    <main id="main-content" tabIndex={-1} className="page container live-page">
      <div className="live-heading"><div><div className="section-kicker">SKILLLOOP LIVE</div><h1>真实互换空间 <span className="heading-star">✳</span></h1><p>从真实技能卡开始，找到互相能教会彼此的人。</p></div></div>
      {!cloudConfigured ? (
        <section className="live-card"><h2>真实互换正在接入</h2><p>当前公开站点仍可完整体验演示流程。云端项目接入并完成双账号验证后，这里会开放注册与聊天。</p><button className="button button-outline" onClick={() => { window.location.hash = "/explore"; }}>先看演示伙伴 <ArrowRight size={17} /></button></section>
      ) : authLoading ? <div className="live-loading"><RefreshCw size={20} /> 正在恢复登录状态…</div>
      : !user ? <AuthForm />
      : profileLoading ? <div className="live-loading"><RefreshCw size={20} /> 正在加载技能卡…</div>
      : <>
        <div className="live-account-bar"><span><Users size={17} /> 已登录：{user.email}</span><button className="live-text-button" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> 退出登录</button></div>
        {error && <p className="live-error" role="alert">{error}</p>}
        {!profile || editing ? <ProfileForm key={profile?.id || "new"} user={user} current={profile} onSaved={() => { setEditing(false); setRefreshIndex((n) => n + 1); }} />
        : <section className="live-card"><div className="live-eyebrow">MY SKILL CARD</div><h2>{profile.name}</h2><p>{profile.intro || "还没有填写介绍。"}</p><div className="live-skills"><div><strong>能教</strong><span>{profile.teach.join(" · ")}</span></div><div><strong>想学</strong><span>{profile.learn.join(" · ")}</span></div></div><button className="button button-outline" onClick={() => setEditing(true)}>编辑技能卡</button></section>}
      </>}
    </main>
  );
}
