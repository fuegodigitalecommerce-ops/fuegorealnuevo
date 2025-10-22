// api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword = "navidad", country = "LATAM" } = req.query;

    const url = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req={"comparisonItem":[{"keyword":"${keyword}","geo":"${country}","time":"now 7-d"}],"category":0,"property":""}`;

    const response = await fetch(url);
    const text = await response.text();

    const jsonStart = text.indexOf("{");
    const jsonData = JSON.parse(text.slice(jsonStart));

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      fuente: "Google Trends LATAM",
      resultados: jsonData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: error.message,
    });
  }
}
