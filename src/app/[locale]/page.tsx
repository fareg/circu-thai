import Link from "next/link";
import { ArrowRight, Music2, TimerReset, Waves } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function LocaleHome() {
  const tHero = await getTranslations("hero");
  const tFeatures = await getTranslations("features");

  const featureList = [
    {
      title: tFeatures("catalog"),
      body: tFeatures("catalogBody"),
      icon: <Waves className="h-6 w-6 text-emerald-200" aria-hidden="true" />,
    },
    {
      title: tFeatures("builder"),
      body: tFeatures("builderBody"),
      icon: <TimerReset className="h-6 w-6 text-emerald-200" aria-hidden="true" />,
    },
    {
      title: tFeatures("guidance"),
      body: tFeatures("guidanceBody"),
      icon: <ArrowRight className="h-6 w-6 text-emerald-200" aria-hidden="true" />,
    },
    {
      title: tFeatures("music"),
      body: tFeatures("musicBody"),
      icon: <Music2 className="h-6 w-6 text-emerald-200" aria-hidden="true" />,
    },
  ];

  return (
    <section className="space-y-12">
      <div className="glass-panel relative overflow-hidden px-8 py-16">
        <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Lymph flow mission</p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-gradient sm:text-5xl">
          {tHero("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-100">{tHero("subtitle")}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            className="focus-ring rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80"
            aria-pressed="true"
          >
            {tHero("default")}
          </button>
          <Link
            href="builder"
            className="focus-ring rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg"
          >
            {tHero("primary")}
          </Link>
          <Link
            href="programs"
            className="focus-ring rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90"
          >
            {tHero("secondary")}
          </Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {featureList.map((feature) => (
          <article key={feature.title} className="glass-panel flex gap-4 px-6 py-6">
            <div className="rounded-2xl bg-white/10 p-3">{feature.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-100/80">{feature.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
