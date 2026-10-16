import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, RefreshCw, Send } from "lucide-react";
import { supabase } from "./supabase";

function pair(a, b) {
  return [a, b].sort();
}
function rememberMessage(list, incoming) {
  return list.some((item) => item.id === incoming.id)
    ? list
    : [...list, incoming];
}

export function LiveInbox({ user, onOpenChat }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("skill_conversations")
        .select("id,user_a,user_b,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("skill_profiles").select("id,name,intro,teach,learn,mode"),
    ]).then(([conversationsResult, profilesResult]) => {
      if (!active) return;
      const failure = conversationsResult.error || profilesResult.error;
      setError(failure ? `读取会话失败：${failure.message}` : "");
      const byId = new Map(
        (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
      );
      setItems(
        (conversationsResult.data ?? [])
          .map((conversation) => ({
            conversation,
            peer: byId.get(
              conversation.user_a === user.id
                ? conversation.user_b
                : conversation.user_a,
            ),
          }))
          .filter((item) => item.peer),
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user.id, refresh]);

  return (
    <section className="live-inbox">
      <div className="live-section-top">
        <div>
          <div className="live-eyebrow">PRIVATE MESSAGES</div>
          <h2>我的私聊</h2>
          <p>会话和消息保存在云端，只对聊天双方开放。</p>
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
        <div className="live-loading">正在加载会话…</div>
      ) : items.length ? (
        <div className="live-inbox-list">
          {items.map(({ conversation, peer }) => (
            <button
              className="live-inbox-item"
              key={conversation.id}
              onClick={() => onOpenChat(peer)}
            >
              <span className="live-avatar">{peer.name.slice(0, 1)}</span>
              <span>
                <strong>{peer.name}</strong>
                <small>查看与 TA 的私聊</small>
              </span>
              <MessageCircle size={18} />
            </button>
          ))}
        </div>
      ) : (
        <div className="live-empty">
          <MessageCircle size={23} />
          <h3>还没有私聊</h3>
          <p>在真实双向匹配卡片中点击“开始私聊”。</p>
        </div>
      )}
    </section>
  );
}

export default function LiveChat({ user, peer, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState("连接中…");
  const [refresh, setRefresh] = useState(0);
  const bottom = useRef(null);

  useEffect(() => {
    let active = true;
    const [user_a, user_b] = pair(user.id, peer.id);
    setConversation(null);
    setMessages([]);
    setLoading(true);
    setError("");
    (async () => {
      let result = await supabase
        .from("skill_conversations")
        .select("id,user_a,user_b")
        .eq("user_a", user_a)
        .eq("user_b", user_b)
        .maybeSingle();
      if (!result.error && !result.data) {
        result = await supabase
          .from("skill_conversations")
          .insert({ user_a, user_b, created_by: user.id })
          .select("id,user_a,user_b")
          .single();
        if (result.error?.code === "23505") {
          result = await supabase
            .from("skill_conversations")
            .select("id,user_a,user_b")
            .eq("user_a", user_a)
            .eq("user_b", user_b)
            .maybeSingle();
        }
      }
      if (!active) return;
      if (result.error || !result.data) {
        setError(
          "无法建立私聊。请确认你们仍是双向匹配，或稍后重试。" +
            (result.error ? ` ${result.error.message}` : ""),
        );
        setLoading(false);
        return;
      }
      setConversation(result.data);
    })();
    return () => {
      active = false;
    };
  }, [user.id, peer.id]);

  useEffect(() => {
    if (!conversation) return;
    let active = true;
    supabase
      .from("skill_messages")
      .select("id,conversation_id,sender_id,body,created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error: loadError }) => {
        if (!active) return;
        setMessages((data ?? []).reverse());
        setError(loadError ? `读取消息失败：${loadError.message}` : "");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [conversation, refresh]);

  useEffect(() => {
    if (!conversation) return;
    const channel = supabase
      .channel(`skill-chat-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "skill_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => setMessages((old) => rememberMessage(old, payload.new)),
      )
      .subscribe((status) =>
        setConnection(
          status === "SUBSCRIBED"
            ? "实时已连接"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT"
              ? "连接中断，可刷新消息"
              : "连接中…",
        ),
      );
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!conversation || !body || sending) return;
    if (body.length > 1000) {
      setError("消息最多 1000 字。");
      return;
    }
    setSending(true);
    setError("");
    const { data, error: sendError } = await supabase
      .from("skill_messages")
      .insert({ conversation_id: conversation.id, sender_id: user.id, body })
      .select("id,conversation_id,sender_id,body,created_at")
      .single();
    setSending(false);
    if (sendError) setError(`发送失败：${sendError.message}`);
    else {
      setDraft("");
      setMessages((old) => rememberMessage(old, data));
    }
  }

  return (
    <section className="live-chat live-card">
      <div className="live-chat-header">
        <button className="live-text-button" onClick={onBack}>
          <ArrowLeft size={18} /> 返回真实匹配
        </button>
        <div className="live-chat-person">
          <span className="live-avatar">{peer.name.slice(0, 1)}</span>
          <div>
            <h2>{peer.name}</h2>
            <small>{connection}</small>
          </div>
        </div>
        <button
          className="live-text-button"
          onClick={() => setRefresh((n) => n + 1)}
        >
          <RefreshCw size={16} /> 刷新消息
        </button>
      </div>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      <div
        className="live-message-list"
        aria-label={`与${peer.name}的消息`}
        aria-live="polite"
      >
        {loading ? (
          <div className="live-loading">正在加载消息…</div>
        ) : messages.length ? (
          messages.map((message) => (
            <div
              className={`live-message ${message.sender_id === user.id ? "mine" : "theirs"}`}
              key={message.id}
            >
              <span>{message.body}</span>
              <time dateTime={message.created_at}>
                {new Date(message.created_at).toLocaleString("zh-CN", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          ))
        ) : (
          <div className="live-chat-empty">
            打个招呼，聊聊你们想怎么互教吧。
          </div>
        )}
        <div ref={bottom} />
      </div>
      <form className="live-message-form" onSubmit={send}>
        <label className="sr-only" htmlFor="live-message">
          输入消息
        </label>
        <textarea
          id="live-message"
          rows={2}
          maxLength={1000}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="说说你想学的技能与方便交流的时间…"
        />
        <button
          className="button button-primary"
          type="submit"
          disabled={!conversation || sending || !draft.trim()}
        >
          <Send size={17} /> 发送
        </button>
      </form>
      <p className="live-chat-footnote">
        仅聊天双方可以读取消息。请勿发送密码或敏感个人信息。
      </p>
    </section>
  );
}
