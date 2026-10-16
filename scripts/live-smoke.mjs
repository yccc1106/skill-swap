import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const status = JSON.parse(
  execFileSync("pnpm", ["dlx", "supabase", "status", "-o", "json"], {
    encoding: "utf8",
  }),
);
const createTestClient = () =>
  createClient(status.API_URL, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const [alice, bob, stranger] = Array.from({ length: 3 }, createTestClient);
const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

async function register(client, label) {
  const { data, error } = await client.auth.signUp({
    email: `${label}-${suffix}@example.test`,
    password: "local-test-password-123",
  });
  assert.ifError(error);
  assert.ok(data.session, "local test must allow immediate login");
  return data.user.id;
}

async function card(client, id, name, teach, learn) {
  const { error } = await client
    .from("skill_profiles")
    .insert({ id, name, teach, learn, intro: "本地验证资料", mode: "线上" });
  assert.ifError(error);
}

const aliceId = await register(alice, "alice");
const bobId = await register(bob, "bob");
const strangerId = await register(stranger, "stranger");
await card(alice, aliceId, "Alice", ["Python"], ["摄影"]);
await card(bob, bobId, "Bob", ["摄影"], ["Python"]);
await card(stranger, strangerId, "Stranger", ["吉他"], ["摄影"]);
console.log("PASS: 三个独立账号注册并发布云端技能卡");

const [user_a, user_b] = [aliceId, bobId].sort();
const { data: conversation, error: conversationError } = await alice
  .from("skill_conversations")
  .insert({ user_a, user_b, created_by: aliceId })
  .select("id")
  .single();
assert.ifError(conversationError);
assert.ok(conversation?.id);
const badPair = [aliceId, strangerId].sort();
const { error: matchError } = await alice
  .from("skill_conversations")
  .insert({ user_a: badPair[0], user_b: badPair[1], created_by: aliceId });
assert.ok(matchError, "one-way match must not create a conversation");
console.log("PASS: 双向匹配可以建会话，单向匹配被数据库拒绝");

let channel;
try {
  bob.realtime.setAuth((await bob.auth.getSession()).data.session.access_token);
  const received = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("实时消息未在 12 秒内到达")),
      12000,
    );
    channel = bob
      .channel(`smoke-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "skill_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          clearTimeout(timeout);
          resolve(payload.new);
        },
      )
      .subscribe((state) => {
        if (state === "CHANNEL_ERROR") {
          clearTimeout(timeout);
          reject(new Error("实时频道连接失败"));
        }
      });
  });
  await new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (channel?.state === "joined") {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - start > 10000) {
        clearInterval(timer);
        reject(new Error("实时频道订阅超时"));
      }
    }, 50);
  });
  const { data: sent, error: sendError } = await alice
    .from("skill_messages")
    .insert({
      conversation_id: conversation.id,
      sender_id: aliceId,
      body: "跨账号实时测试",
    })
    .select("id,body")
    .single();
  assert.ifError(sendError);
  assert.equal((await received).id, sent.id);
  console.log("PASS: Alice 发送后 Bob 收到实时事件");
} finally {
  if (channel) await bob.removeChannel(channel);
}

const { data: history, error: historyError } = await bob
  .from("skill_messages")
  .select("id,body")
  .eq("conversation_id", conversation.id);
assert.ifError(historyError);
assert.equal(history.length, 1);
assert.equal(history[0].body, "跨账号实时测试");
const { data: hiddenConversations } = await stranger
  .from("skill_conversations")
  .select("id")
  .eq("id", conversation.id);
const { data: hiddenMessages } = await stranger
  .from("skill_messages")
  .select("id")
  .eq("conversation_id", conversation.id);
assert.equal(hiddenConversations.length, 0);
assert.equal(hiddenMessages.length, 0);
const { error: blockedSend } = await stranger
  .from("skill_messages")
  .insert({
    conversation_id: conversation.id,
    sender_id: strangerId,
    body: "不应发送",
  });
assert.ok(blockedSend, "third-party send must be blocked");
console.log("PASS: 历史消息可读取，第三方无法读取或发送");
