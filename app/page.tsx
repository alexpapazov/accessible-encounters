import Link from "next/link";
import { cases } from "@/lib/data/cases";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold text-[#3A2B26]">Accessible clinical encounters</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-[#5A4A40]">
          Interactive encounters with Deaf and hard-of-hearing patients — practice the communication
          decisions that determine whether a visit actually works. There is no single Deaf patient:
          each encounter centers a different person, with their own language, identity, and access needs.
        </p>
      </header>

      <section className="mt-8 space-y-4">
        {cases.map((c) => {
          const patients = c.characters.filter((ch) => ch.role === "patient");
          return (
            <Link
              key={c.id}
              href={`/case/${c.id}`}
              className="block rounded-2xl border border-[#E7D6C4] bg-white p-5 transition-all hover:border-[#E88C6E] hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#3A2B26]">{c.title}</h2>
                  <p className="mt-1 text-sm text-[#7A6A5E]">{c.setting}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-[#F6E3D0] px-3 py-1 text-xs font-medium text-[#8A5A44]">
                    {c.difficulty}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      c.reviewStatus === "expert-reviewed"
                        ? "bg-[#DFF0EE] text-[#2E6B66]"
                        : "bg-[#FBE3DA] text-[#A34A2E]"
                    }`}
                  >
                    {c.reviewStatus === "expert-reviewed"
                      ? "expert reviewed"
                      : "draft — awaiting expert review"}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#3A2B26]">
                <span className="font-medium">
                  {patients.map((p) => p.name).join(" · ")}
                </span>
                {c.modes.includes("timed") && (
                  <span className="ml-2 rounded bg-[#FBE3DA] px-1.5 py-0.5 text-xs font-medium text-[#A34A2E]">
                    time-constrained
                  </span>
                )}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-5 text-sm leading-relaxed text-[#5A4A40]">
        <h2 className="font-semibold text-[#3A2B26]">About this project</h2>
        <p className="mt-2">
          Deafness here is treated as identity and language, not as deficit. Cases are written to be
          reviewed by Deaf and ASL-fluent experts, and the badge on each case tells you honestly
          where it stands. Illustrations never depict signing; faithful ASL belongs to real signers
          on video, which these cases are structured to incorporate.
        </p>
      </section>
    </div>
  );
}
