"use client";

import { useState } from "react";
import type { WaitlistApiStatus } from "@/types/waitlist";

type FormStatus = "idle" | "submitting" | WaitlistApiStatus | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, website: honeypot }),
      });

      const data = (await res.json()) as { status?: WaitlistApiStatus; error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus(data.status === "already_joined" ? "already_joined" : "ok");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <p className="text-sm font-medium text-green-700">
        You&apos;re on the list! We&apos;ll be in touch.
      </p>
    );
  }

  if (status === "already_joined") {
    return (
      <p className="text-sm font-medium text-zinc-600">
        You&apos;re already on the waitlist. We&apos;ll reach out soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot — visually hidden, never filled by real users */}
      <div aria-hidden="true" className="absolute -left-[9999px] opacity-0">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="wl-name"
          className="block text-sm font-medium text-zinc-700"
        >
          Name{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="wl-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="wl-email"
          className="block text-sm font-medium text-zinc-700"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="wl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Joining…" : "Join waitlist"}
      </button>
    </form>
  );
}
