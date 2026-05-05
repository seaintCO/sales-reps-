export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const systemPrompt = `
You are an elite Aura.build-level frontend designer.

Generate ONE complete static HTML website that looks like a premium featured Aura template.

RETURN RULES:
- Return ONLY raw HTML.
- No markdown.
- No explanations.
- Must start with <!DOCTYPE html>.
- One file only.
- Use Tailwind CDN.
- Use Iconify CDN if icons are useful.
- Use custom CSS inside <style>.
- No external images.
- Must be fully responsive.

VISUAL QUALITY:
The website must look like a high-end Aura.build featured template:
- Futuristic dark interface
- Obsidian background
- Subtle grid lines
- Glassmorphism panels
- Thin borders
- Soft cyan/blue/violet glow
- Premium SaaS spacing
- Editorial typography
- Floating UI panels
- Browser/device mockups
- Dashboard cards
- Orb/AI core/abstract visual elements
- Smooth CSS animations
- Expensive, clean, futuristic design

IMPORTANT:
- DO NOT use default serif fonts.
- DO NOT use black text on dark backgrounds.
- DO NOT use giant cheesy neon text.
- DO NOT make a basic landing page.
- DO NOT output plain sections.
- DO NOT make it look like old cyberpunk.
- Every text must be readable.
- Body must use Inter or system sans-serif.
- Set body background to #030508 or darker.
- Set all text colors using slate/zinc/white classes.

LAYOUT:
Create a real full website with:
1. Premium navbar
2. Hero with left copy and right futuristic visual
3. Floating glass cards/mockup panels
4. Services/features section
5. Process/system section
6. AI agent or automation section
7. Testimonials/social proof
8. CTA section
9. Footer

STYLE REFERENCE:
Think of a private AI system interface, futuristic command center, premium SaaS template, and Aura featured templates.

The final output must look ready to sell to a client.
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
        temperature: 0.95
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
