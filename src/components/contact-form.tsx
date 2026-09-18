"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const SUBJECTS = ["Общий вопрос", "Заказ", "Опт", "Пресса"];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    body: "",
    // поле-ловушка для ботов: люди его не видят и не заполняют
    website: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Не удалось отправить");
      setState("done");
      track("contact", { subject: form.subject });
      setForm({ name: "", email: "", subject: SUBJECTS[0], body: "", website: "" });
    } catch (caught) {
      setState("error");
      setError(caught instanceof Error ? caught.message : "Не удалось отправить");
    }
  }

  if (state === "done") {
    return (
      <div className="space-y-5 border hairline p-8">
        <span className="eyebrow">Сообщение получено</span>
        <p className="type-display text-3xl">Спасибо.</p>
        <p className="text-sm leading-relaxed text-mist">
          Студия отвечает в течение двух рабочих дней. Если вопрос по заказу — укажите
          его номер.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="eyebrow border border-bone/20 px-4 py-3 text-bone transition-colors duration-500 hover:border-bone/60"
        >
          Отправить ещё
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full border hairline bg-transparent px-4 py-3 text-sm placeholder:text-smoke transition-colors duration-500 focus:border-bone/40 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="eyebrow block">Имя</span>
          <input
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Как к вам обращаться"
            className={fieldClass}
          />
        </label>
        <label className="space-y-2">
          <span className="eyebrow block">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@studio.ru"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="eyebrow block">Тема</span>
        <select
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
          className={fieldClass}
        >
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject} className="bg-carbon">
              {subject}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="eyebrow block">Сообщение</span>
        <textarea
          required
          rows={6}
          value={form.body}
          onChange={(event) => setForm({ ...form, body: event.target.value })}
          placeholder="Размеры, заказы, коллаборации…"
          className={`${fieldClass} resize-none`}
        />
      </label>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={(event) => setForm({ ...form, website: event.target.value })}
        className="hidden"
      />

      {error ? <p className="meta text-bone">{error}</p> : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="group flex w-full items-center justify-between border border-bone/25 px-5 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void disabled:opacity-50"
      >
        <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
          {state === "sending" ? "Отправка" : "Отправить"}
        </span>
        <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
          →
        </span>
      </button>
    </form>
  );
}
