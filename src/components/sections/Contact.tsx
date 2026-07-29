import { FormEvent, useRef, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { SlideButton } from "@/components/ui/slide-button";

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState("");

  const sendMessage = async () => {
    const form = formRef.current;
    if (!form) throw new Error("Form missing");

    if (!form.checkValidity()) {
      form.reportValidity();
      throw new Error("Invalid form");
    }

    setStatus("Sending…");
    const data = new FormData(form);
    const response = await fetch("https://formspree.io/f/maqrvgep", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus(payload?.error ?? "Something went wrong. Please try again.");
      throw new Error("Formspree rejected the submission");
    }

    form.reset();
    setStatus("Message sent — I'll get back to you soon.");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <section id="contact" className="relative py-20 md:py-24 overflow-hidden">
      <div className="ambient-orb w-[480px] h-[480px] bg-blood-mid/35 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-8">
            <p className="section-label">Contact</p>
            <h2 className="section-title leading-tight">
              Let's build something <span className="text-metallic">amazing.</span>
            </h2>
            <p className="text-chrome/60 font-light max-w-md">
              Open to collaborations, product builds, and premium digital experiences.
            </p>
            <div className="space-y-4 pt-4">
              <a
                href="mailto:aran.adnan22@gmail.com"
                className="flex items-center gap-4 text-sm text-chrome/80 hover:text-white transition-colors"
              >
                <span className="w-10 h-10 glass rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-chrome" />
                </span>
                aran.adnan22@gmail.com
              </a>
              <a
                href="https://github.com/thy-aran"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-sm text-chrome/80 hover:text-white transition-colors"
              >
                <span className="w-10 h-10 glass rounded-full flex items-center justify-center">
                  <Github className="w-4 h-4 text-chrome" />
                </span>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/aran-adnan-v711/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-sm text-chrome/80 hover:text-white transition-colors"
              >
                <span className="w-10 h-10 glass rounded-full flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-chrome" />
                </span>
                LinkedIn
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              ref={formRef}
              onSubmit={onSubmit}
              className="glass-strong rounded-3xl p-7 md:p-10 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-[10px] tracking-[0.2em] uppercase text-chrome/45 mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input id="name" name="name" required className="field" placeholder="Your name" />
                </div>
                <div>
                  <label
                    className="block text-[10px] tracking-[0.2em] uppercase text-chrome/45 mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="field"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-[10px] tracking-[0.2em] uppercase text-chrome/45 mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="field resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <div className="pt-1">
                <SlideButton onComplete={sendMessage} />
              </div>

              <p className="text-xs text-chrome/45 h-4" aria-live="polite">
                {status}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
