// /api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const keyword = req.query.keyword || "navidad";
  const country = req.query.country || "CO";

  try {
    const reqBody = {
      comparisonItem: [
        {
          keyword,
          geo: country === "LATAM" ? "" : country,
          time: "today 12-m",
        },
      ],
      category: 0,
      property: "",
    };

    // Proxy gratuito para evitar bloqueo directo a Google
    const proxyUrl = "https://api.allorigins.win/get?url=";

    const googleUrl = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req=${encodeURIComponent(
      JSON.stringify(reqBody)
    )}`;

    const response = await fetch(proxyUrl + encodeURIComponent(googleUrl), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });

    const proxyData = await response.json();
    const text = proxyData.contents || "";

    if (!text || text.trim().startsWith("<")) {
      return res.status(502).json({
        ok: false,
        error: "Google Trends respondió HTML o vació el contenido",
        detalle: "Puede que el proxy gratuito esté saturado, intenta de nuevo",
      });
    }

    const jsonStart = text.indexOf("{");
    const json = JSON.parse(text.slice(jsonStart));

    const widgets = json.widgets || [];
    const related = widgets
      .filter((w) => w.id?.includes("RELATED"))
      .map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
      }));

    res.status(200).json({
      ok: true,
      keyword,
      country,
      total: related.length,
      results: related,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: err.message,
    });
  }
}
