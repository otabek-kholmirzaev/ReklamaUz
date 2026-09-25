import { createFileRoute } from "@tanstack/react-router";
import { Bot, MessageSquare, Plus, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
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

type Message = { id: string; role: "assistant" | "user"; content: string };
type Conversation = { id: string; title: string; messages: Message[] };
type ChatResponse = { message: string; responseId: string; model: string };

const STORAGE_KEY = "reklama-copilot-history";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");
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
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: (isRetry
            ? activeConversation.messages.slice(0, -1)
            : activeConversation.messages
          )
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        ChatResponse | { error?: string } | null;

      if (!response.ok || !payload || !("message" in payload)) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Copilot could not respond right now.",
        );
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: payload.message,
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
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift lg:grid lg:min-h-[680px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-surface p-4 lg:border-b-0 lg:border-r">
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
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    conversation.id === activeConversation?.id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </button>
              ))}
            </div>
            <p className="mt-6 px-2 text-xs leading-relaxed text-muted-foreground">
              Your campaign history is saved privately in this browser.
            </p>
          </aside>

          <section className="flex min-h-[580px] flex-col">
            <header className="border-b border-border px-5 py-4 sm:px-7">
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

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
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
                  <p
                    className={cn(
                      "max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "assistant"
                        ? "bg-surface text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {message.content}
                  </p>
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

            <div className="border-t border-border p-4 sm:p-5">
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
      <SiteFooter />
    </div>
  );
}
