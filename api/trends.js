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

    const proxyUrl =
      const proxyUrl = `${req.headers.origin}/api/proxy?url=`;

    const googleUrl = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req=${encodeURIComponent(
      JSON.stringify(reqBody)
    )}`;

    const response = await fetch(proxyUrl + encodeURIComponent(googleUrl), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });

    const text = await response.text();

    if (!text || text.trim().startsWith("<")) {
      return res.status(502).json({
        ok: false,
        error: "Respuesta no válida desde Google Trends",
        detalle: text ? text.slice(0, 120) + "..." : "vacío",
      });
    }

    let json;
    try {
      const jsonStart = text.indexOf("{");
      json = JSON.parse(text.slice(jsonStart));
    } catch (parseError) {
      return res.status(500).json({
        ok: false,
        error: "Error al interpretar JSON",
        detalle: parseError.message,
      });
    }

    const widgets = json.widgets || [];
    const related = widgets
      .filter((w) => w.id?.includes("RELATED"))
      .map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
      }));

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      total: related.length,
      results: related,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Fallo interno en FUEGO Trends",
      detalle: err.message,
    });
  }
}
