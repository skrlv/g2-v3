"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  // поле-ловушка для ботов: люди его не видят и не заполняют
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      if (!response.ok) throw new Error("failed");
      setState("done");
      setEmail("");
      track("subscribe");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <div className="flex items-stretch border hairline focus-within:border-bone/40">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Ваш email"
          aria-label="Ваш email"
          className="w-full bg-transparent px-3 py-3 text-sm placeholder:text-smoke focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="border-l hairline px-4 text-bone transition-colors duration-500 hover:bg-bone hover:text-void disabled:opacity-50"
          aria-label="Подписаться"
        >
          →
        </button>
      </div>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hidden"
      />
      <p className="meta mt-3 normal-case tracking-normal">
        {state === "done"
          ? "Вы в списке. Пишем только о дропах."
          : state === "error"
            ? "Не удалось отправить — попробуйте ещё раз."
            : "Анонсы коллекций и рестоки. Без рассылок."
        }
      </p>
    </form>
  );
}
