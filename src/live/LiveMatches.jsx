import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "./supabase";

export function matchingSkills(me, other) {
  const youTeach = me.teach.filter((skill) => other.learn.includes(skill));
  const theyTeach = other.teach.filter((skill) => me.learn.includes(skill));
  return {
    youTeach,
    theyTeach,
    mutual: youTeach.length > 0 && theyTeach.length > 0,
  };
}

export default function LiveMatches({ profile, onOpenChat }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    supabase
      .from("skill_profiles")
      .select("id,name,intro,teach,learn,mode")
      .neq("id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        setPeople(data ?? []);
        setError(loadError ? `读取伙伴失败：${loadError.message}` : "");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile.id, refresh]);

  const matches = useMemo(
    () =>
      people
        .map((person) => ({
          person,
          match: matchingSkills(profile, person),
        }))
        .filter(({ match }) => match.mutual),
    [people, profile],
  );

  return (
    <section className="live-matches">
      <div className="live-section-top">
        <div>
          <div className="live-eyebrow">REAL MATCHES</div>
          <h2>和你互相匹配的人</h2>
          <p>双方的“能教”都覆盖对方的“想学”，才能开始一对一交流。</p>
        </div>
        <button
          className="live-text-button"
          onClick={() => {
            setLoading(true);
            setRefresh((n) => n + 1);
          }}
        >
          <RefreshCw size={16} /> 刷新
        </button>
      </div>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="live-loading">正在寻找真实伙伴…</div>
      ) : matches.length ? (
        <div className="live-match-grid">
          {matches.map(({ person, match }) => (
            <article className="live-match-card" key={person.id}>
              <div className="live-match-top">
                <span className="live-avatar">{person.name.slice(0, 1)}</span>
                <div>
                  <h3>{person.name}</h3>
                  <span>{person.mode}</span>
                </div>
                <span className="mutual-pill">
                  <Sparkles size={13} /> 双向匹配
                </span>
              </div>
              <p>{person.intro || "一起从擅长的事情开始交流。"}</p>
              <div className="live-match-directions">
                <div>
                  <span>你教 TA</span>
                  <strong>{match.youTeach.join("、")}</strong>
                </div>
                <div>
                  <span>TA 教你</span>
                  <strong>{match.theyTeach.join("、")}</strong>
                </div>
              </div>
              {onOpenChat && (
                <button
                  className="button button-primary"
                  onClick={() => onOpenChat(person)}
                >
                  开始私聊 <ArrowRight size={16} />
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="live-empty">
          <Sparkles size={23} />
          <h3>还没有真实的双向匹配</h3>
          <p>
            可以邀请另一位用户注册，并分别填写互补的技能。新资料发布后点击“刷新”。
          </p>
        </div>
      )}
    </section>
  );
}
