import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { theme, cardCount, ageGroup } = await request.json();

  if (!theme || !cardCount || !ageGroup) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = Math.min(20, Math.max(6, parseInt(cardCount, 10)));

  const prompt = `You are a resource designer for early childhood educators in Australia. Generate a dramatic play resource pack scaffold.

Theme: ${theme}
Age group: ${ageGroup}
Number of cards: ${count}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation. Use exactly this structure:

{
  "cards": [
    { "label": "Short card name", "description": "One-line visual description suitable as a Canva image search term" }
  ],
  "eylfOutcomes": [
    { "outcome": "Outcome X: Full outcome name from the EYLF", "explanation": "One sentence explaining how this play theme supports this outcome." }
  ],
  "howToUse": "3-4 sentences in a warm, practical tone. Start with setup (e.g. laminating and arranging the play corner), then describe how children typically engage, and end with a practical tip for educators.",
  "supportingText": [
    { "type": "Category name", "items": [{ "name": "Item name", "detail": "Price in AUD or brief descriptor" }] }
  ]
}

Rules:
- Generate exactly ${count} cards. Cover the full range of props, objects, and roles relevant to this theme and age group.
- Cards must be age-appropriate for ${ageGroup}. For toddlers: simple, familiar objects. For preschool/kindergarten: richer variety of roles and props.
- Include 2–3 EYLF outcomes most naturally supported by this theme. Use correct outcome numbers and names from the Australian EYLF.
- howToUse: warm, encouraging, practical. Written for a classroom teacher. Mention laminating, and give at least one specific play suggestion.
- supportingText: ONLY include if the theme naturally involves printed text content children would encounter in that setting (e.g. café/restaurant = menu with prices; supermarket = product labels with prices; post office = stamp types and services; bookshop = book titles with prices). For Farm, Doctor's Office, and themes without obvious printed signage/menus, return an empty array [].
- All AUD prices should be realistic for Australia (e.g. coffee $5.50, bread $4.20).`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Strip markdown code fences if Claude wrapped the JSON
    const jsonText = text
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();

    const result = JSON.parse(jsonText);
    return Response.json(result);
  } catch (err) {
    console.error("Generation error:", err);
    return Response.json(
      { error: "Failed to generate resource pack. Please try again." },
      { status: 500 }
    );
  }
}
