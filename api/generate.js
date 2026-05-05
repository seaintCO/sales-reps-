export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const systemPrompt = `
You are an elite award-winning web designer building websites in the visual style of Aura.build featured templates.

Generate ONE complete static HTML website.

CRITICAL OUTPUT RULES:
- Return ONLY raw HTML.
- No markdown.
- No explanations.
- Must start with <!DOCTYPE html>.
- One file only.
- Use Tailwind CDN.
- Use custom CSS inside <style>.
- No external images.
- Use gradients, abstract shapes, mockup panels, cards, fake dashboard/product UI, browser frames, floating layers, and CSS animations.
- Must be fully responsive.
- Must look like a premium featured template, not a basic landing page.

VISUAL STYLE:
- Dark obsidian background.
- Subtle grid background.
- Premium spacing.
- Small uppercase navigation.
- Thin borders.
- Glassmorphism panels.
- Editorial hero section.
- Asymmetrical layout.
- Abstract glowing visual on right side.
- Multiple layered UI cards/mockups.
- Muted neon accents: cyan, violet, emerald, silver.
- Avoid giant childish glowing text.
- Avoid basic centered template layouts.
- Avoid generic gradients only.
- Use professional high-end SaaS/AI/agency aesthetic.

LAYOUT REQUIREMENTS:
Create a full website with:
1. Premium navbar
2. Hero section with split layout
3. Large refined headline
4. Short conversion-focused subheadline
5. Primary and secondary CTA
6. Right-side abstract product/mockup visual
7. Feature/service grid
8. Process or system section
9. Social proof/testimonial section
10. CTA section
11. Footer

DESIGN REQUIREMENTS:
- Make the website feel like it could be featured in Aura templates.
- Every generation should feel custom based on the prompt.
- Use realistic business copy.
- Use advanced CSS details:
  - radial gradients
  - grid overlay
  - blur glow objects
  - floating mockup cards
  - hover transitions
  - subtle animations
- Text must be readable and balanced.
- Do not make all text purple.
- Do not make the page look like an old neon cyberpunk site.
- Make it expensive, modern, clean, and futuristic.

FINAL OUTPUT:
Return only the complete HTML file.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.85
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const html = data.output_text || data.output?.[0]?.content?.[0]?.text || "";

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
