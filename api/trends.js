// /api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const keyword = req.query.keyword || "navidad";
  const country = req.query.country || "CO";

  try {
    // Construcción segura del cuerpo de la solicitud
    const reqBody = {
      comparisonItem: [
        {
          keyword,
          geo: country === "LATAM" ? "" : country,
          time: "today 12-m"
        }
      ],
      category: 0,
      property: ""
    };

    const url = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req=${encodeURIComponent(
      JSON.stringify(reqBody)
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });

    const text = await response.text();

    // Si Google Trends devuelve HTML, lo detectamos
    if (text.trim().startsWith("<")) {
      return res.status(502).json({
        ok: false,
        error: "Respuesta inesperada de Google Trends",
        detalle: "Se recibió HTML en lugar de JSON. Puede requerir un proxy o reintento."
      });
    }

    // Limpieza del texto para extraer JSON válido
    const jsonStart = text.indexOf("{");
    const json = JSON.parse(text.slice(jsonStart));

    // Si existen tokens o widgets
    const widgets = json.widgets || [];
    const related = widgets.filter(w => w.id?.includes("RELATED")).map(w => ({
      id: w.id,
      title: w.title,
      type: w.type
    }));

    res.status(200).json({
      ok: true,
      keyword,
      country,
      total: related.length,
      results: related
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: err.message
    });
  }
}
