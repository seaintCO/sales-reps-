export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const systemPrompt = `
You are an elite senior web designer and frontend engineer for SEAINT.

Generate ONE complete static HTML website.

Rules:
- Return ONLY raw HTML.
- No markdown.
- No explanations.
- Must include <!DOCTYPE html>.
- Must be one file only.
- Use Tailwind CDN.
- Use inline CSS only if needed.
- No external images unless using gradients or placeholders.
- Make every website visually different based on the user prompt.
- Use premium futuristic design, glassmorphism, strong spacing, mobile responsive layout.
- Include animations with CSS where useful.
- Include realistic business copy.
- Include CTA sections.
- Include footer.
- The final output must be ready to save as index.html.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const html =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    if (!html.includes("<!DOCTYPE html")) {
      return res.status(500).json({
        error: "AI did not return valid HTML. Try again."
      });
    }

    return res.status(200).json({ html });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
