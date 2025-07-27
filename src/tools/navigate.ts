// src/tools/navigate.ts

export const schema = {
  name: "navigate",
  description: "Return the route path for a given mood",
  parameters: {
    type: "object",
    properties: {
      mood: { type: "string" },
    },
    required: ["mood"],
  },
};

export function exec(args: { mood: string }): { route: string } {
  const mapping: Record<string, string> = {
    motivational: "/motivational",
    romantic:     "/romantic",
    funny:        "/funny",
    sad:          "/motivational",
    philosophical: "/motivational",
  };
  return { route: mapping[args.mood] || "/motivational" };
}
