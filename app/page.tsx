import Link from "next/link";
import { publishedCases } from "@/lib/data/cases";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-semibold text-[#3A2B26]">Accessible clinical encounters</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#5A4A40]">
          Interactive clinical encounters built around one question: what does ethical
          care require when time, staffing, and institutional pressure make every
          available decision harmful in some way?
        </p>
      </header>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        {publishedCases.map((c) => {
          const patients = c.characters.filter((ch) => ch.role === "patient");
          return (
            <Link
              key={c.id}
              href={`/case/${c.id}`}
              className="flex flex-col rounded-2xl border border-[#E7D6C4] bg-white p-6 transition-all hover:border-[#E88C6E] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#3A2B26]">{c.title}</h2>
                  <p className="mt-1 text-sm text-[#7A6A5E]">{c.setting}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#F6E3D0] px-3 py-1 text-xs font-medium text-[#8A5A44]">
                  {c.difficulty}
                </span>
              </div>

              <p className="mt-4 leading-relaxed text-[#3A2B26]">
                {patients.map((p) => p.name).join(" and ")}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                {c.modes.includes("timed") && (
                  <span className="rounded-full bg-[#FBE3DA] px-2.5 py-1 text-xs font-medium text-[#A34A2E]">
                    time-constrained
                  </span>
                )}
                {patients.length > 1 && (
                  <span className="rounded-full bg-[#EDE4F0] px-2.5 py-1 text-xs font-medium text-[#6E5A7A]">
                    two patients, scored separately
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    c.reviewStatus === "expert-reviewed"
                      ? "bg-[#DFF0EE] text-[#2E6B66]"
                      : "bg-[#F3E8DA] text-[#8A5A44]"
                  }`}
                >
                  {c.reviewStatus === "expert-reviewed"
                    ? "expert reviewed"
                    : "draft, awaiting expert review"}
                </span>
              </div>
            </Link>
          );
        })}
      </section>

    </div>
  );
}
