import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, MessageSquare, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { askCopilot } from "@/lib/copilot";
import { creators } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Campaign Copilot — Reklama.uz" },
      {
        name: "description",
        content:
          "Describe your campaign in plain language and Reklama.uz finds the best matching advertising opportunities.",
      },
    ],
  }),
  component: Copilot,
});

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  recommendations?: string[];
};
type Conversation = { id: string; title: string; messages: Message[] };

const STORAGE_KEY = "reklama-copilot-history";
const WELCOME =
  "Hi, I’m your campaign copilot. Tell me what you’re promoting, who you want to reach, and your budget. I’ll help shape a clear brief and identify suitable creators.";

function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New campaign",
    messages: [
      { id: crypto.randomUUID(), role: "assistant", content: WELCOME },
    ],
  };
}

function Copilot() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    createConversation(),
  ]);
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Conversation[];
        if (parsed.length) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, hydrated]);

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeId) ??
      conversations[0],
    [activeId, conversations],
  );

  const startConversation = () => {
    const conversation = createConversation();
    setConversations((current) => [conversation, ...current]);
    setActiveId(conversation.id);
    setDraft("");
  };

  const deleteConversation = (id: string) => {
    const remaining = conversations.filter(
      (conversation) => conversation.id !== id,
    );
    const nextActive = remaining[0] ?? createConversation();
    setConversations(remaining.length > 0 ? remaining : [nextActive]);
    if (activeId === id) {
      setActiveId(nextActive.id);
    }
  };

  const sendMessage = async (messageToRetry?: string, isRetry = false) => {
    const message = (messageToRetry ?? draft).trim();
    if (!message || !activeConversation) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    if (!isRetry) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                title:
                  conversation.title === "New campaign"
                    ? message.slice(0, 42) + (message.length > 42 ? "…" : "")
                    : conversation.title,
                messages: [...conversation.messages, userMessage],
              }
            : conversation,
        ),
      );
      setDraft("");
    }
    setChatError(null);
    setRetryMessage(null);
    setIsSending(true);

    try {
      const payload = await askCopilot(
        message,
        (isRetry
          ? activeConversation.messages.slice(0, -1)
          : activeConversation.messages
        ).map(({ role, content }) => ({ role, content })),
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: payload.message,
        recommendations: payload.recommendations,
      };
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: [...conversation.messages, assistantMessage],
              }
            : conversation,
        ),
      );
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Copilot could not respond right now.",
      );
      setRetryMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <SiteNav />
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lift lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-y-auto border-b border-border bg-surface p-4 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-display font-bold">
                <Sparkles className="h-4 w-4 text-primary" /> Campaigns
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={startConversation}
                aria-label="New campaign"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="mt-4 w-full justify-start"
              variant="secondary"
              onClick={startConversation}
            >
              <Plus className="mr-2 h-4 w-4" /> New campaign
            </Button>
            <div className="mt-5 space-y-1">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                History
              </p>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex w-full items-center gap-1 rounded-xl pr-1 text-sm transition-colors",
                    conversation.id === activeConversation?.id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteConversation(conversation.id)}
                    aria-label={`Delete "${conversation.title}"`}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-6 px-2 text-xs leading-relaxed text-muted-foreground">
              Your campaign history is saved privately in this browser.
            </p>
          </aside>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <header className="shrink-0 border-b border-border px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="font-display text-lg font-bold">
                    AI Campaign Copilot
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Your creator-marketing planning partner
                  </p>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
              {activeConversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "justify-end",
                  )}
                >
                  {message.role === "assistant" && (
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Sparkles className="h-4 w-4" />
                    </span>
                  )}
                  <div className="max-w-2xl">
                    <p
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "assistant"
                          ? "bg-surface text-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {message.content}
                    </p>
                    {message.role === "assistant" &&
                    message.recommendations?.length ? (
                      <CreatorRecommendations
                        usernames={message.recommendations}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
              {activeConversation?.messages.length === 1 && (
                <div className="ml-11 flex flex-wrap gap-2">
                  {[
                    "Find beauty creators in Tashkent",
                    "Plan an Instagram launch",
                    "Reach football fans under $1,500",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setDraft(prompt)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-accent-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              {isSending && (
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </span>
                  <p className="rounded-2xl bg-surface px-4 py-3 text-sm text-muted-foreground">
                    Copilot is thinking…
                  </p>
                </div>
              )}
              {chatError && (
                <div className="ml-11 flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{chatError}</span>
                  {retryMessage && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void sendMessage(retryMessage, true)}
                    >
                      Try again
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-border p-4 sm:p-5">
              <div className="rounded-2xl border border-input bg-background p-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Message Copilot about your campaign…"
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none"
                />
                <div className="flex items-center justify-between gap-3 px-1 pt-1">
                  <span className="text-xs text-muted-foreground">
                    Enter to send · Shift + Enter for a new line
                  </span>
                  <Button
                    size="icon"
                    onClick={() => void sendMessage()}
                    disabled={!draft.trim() || isSending}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Copilot suggests a campaign direction; final availability is
                confirmed on each creator profile.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function CreatorRecommendations({ usernames }: { usernames: string[] }) {
  const recommendedCreators = usernames
    .map((username) =>
      creators.find((creator) => creator.username === username),
    )
    .filter((creator): creator is (typeof creators)[number] =>
      Boolean(creator),
    );

  if (!recommendedCreators.length) return null;

  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {recommendedCreators.map((creator) => (
        <Link
          key={creator.username}
          to="/creator/$username"
          params={{ username: creator.username }}
          className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary"
        >
          <img
            src={creator.photo}
            alt=""
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {creator.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              @{creator.username} · from $
              {Math.min(...creator.services.map((service) => service.price))}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
