// api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const keyword = String(req.query.keyword || "tendencias").trim();
  const country = String(req.query.country || "LATAM").trim();

  try {
    const reqBody = {
      comparisonItem: [{ keyword, geo: country === "LATAM" ? "" : country, time: "today 12-m" }],
      category: 0,
      property: ""
    };

    const url = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req=${encodeURIComponent(JSON.stringify(reqBody))}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FUEGO/1.0)" }
    });

    let raw = await response.text();

    // Limpieza inicial: Google Trends a veces devuelve )]}'
    raw = raw.replace(/^[\)\]\}'\s]+/, "").trim();

    // Buscar inicio JSON y parsear
    const start = raw.indexOf("{");
    if (start === -1) throw new Error("No JSON start found in Google Trends response");
    const json = JSON.parse(raw.slice(start));

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      fuente: "Google Trends (scrape)",
      resultados: json
    });
  } catch (err) {
    const detalle = (err && err.message) ? err.message : String(err);
    return res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle
    });
  }
}
