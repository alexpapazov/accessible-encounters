import type { Persona } from "../types";

export const personas: Persona[] = [
  {
    id: "maya",
    name: "Maya Reyes",
    age: 34,
    pronouns: "she/her",
    identityStance: "culturally-Deaf",
    primaryModality: "ASL",
    language: "ASL (first language), limited written English",
    techUsed: ["interpreter"],
    narrative:
      "I grew up in a Deaf family — ASL is my first language, and Deaf " +
      "community is home, not something missing. English is my second " +
      "language, and written English especially takes real effort. I don't " +
      "lipread well; almost nobody does, whatever hearing people assume. " +
      "When a clinic books me without an interpreter, the message I get is " +
      "that my time and my health matter less than everyone else's.",
    accessNeeds: [
      "Qualified ASL interpreter (in-person preferred)",
      "Direct eye contact — speak to me, not about me",
      "Visual/diagram-based explanations over dense English text",
      "Comprehension checked by teach-back, not by asking 'do you understand?'",
    ],
  },
];

export const getPersona = (id: string): Persona => {
  const p = personas.find((p) => p.id === id);
  if (!p) throw new Error(`Unknown persona: ${id}`);
  return p;
};
