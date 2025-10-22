import fetch from "node-fetch";

export default async function handler(req, res) {
  const keyword = req.query.keyword || "tendencias";
  const country = req.query.country || "LATAM";

  try {
    const reqBody = {
      comparisonItem: [{ keyword, geo: country === "LATAM" ? "" : country, time: "today 12-m" }],
      category: 0,
      property: "",
    };

    const url = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req=${encodeURIComponent(
      JSON.stringify(reqBody)
    )}`;

    const response = await fetch(url);
    let raw = await response.text();

    raw = raw.replace(/^[\)\]\}'\s]+/, "").trim();
    const start = raw.indexOf("{");
    if (start > 0) raw = raw.substring(start);

    const data = JSON.parse(raw);

    return res.status(200).json({
      ok: true,
      keyword,
      region: country,
      fuente: "Google Trends LATAM",
      resultados: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Error al obtener datos de tendencia",
      detalle: error.message,
    });
  }
}
