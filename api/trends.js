// /api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const keyword = req.query.keyword || "navidad";
    const country = req.query.country || "CO";

    // ---- GOOGLE TRENDS ----
    const trendsURL = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es-419&tz=-300&geo=${country}&req={"restriction":{"type":"COUNTRY","geo":{"country":"${country}"}},"keywordType":"QUERY","keyword":"${keyword}","time":"today 12-m"}&token=APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU`;

    const trendsResponse = await fetch(trendsURL);
    let trendsText = await trendsResponse.text();

    // Limpiar el JSON que devuelve Google
    const jsonStart = trendsText.indexOf("{");
    if (jsonStart === -1) throw new Error("Google Trends devolvió HTML");
    trendsText = trendsText.slice(jsonStart);
    const trendsData = JSON.parse(trendsText);

    const results = trendsData.default?.rankedList?.[0]?.rankedKeyword?.slice(0, 5).map(item => ({
      title: item.topic.title,
      type: item.topic.type
    })) || [];

    // ---- MERCADO LIBRE ----
    const mlResponse = await fetch(`https://api.mercadolibre.com/sites/ML${country}/search?q=${encodeURIComponent(keyword)}`);
    const mlData = await mlResponse.json();

    const mlResults = mlData.results?.slice(0, 5).map(item => ({
      title: item.title,
      price: item.price,
      link: item.permalink,
      thumbnail: item.thumbnail
    })) || [];

    // ---- GOOGLE IMÁGENES ---- (búsqueda simple con proxy gratuito)
    const imageSearchURL = `https://customsearch.googleapis.com/customsearch/v1?q=${encodeURIComponent(keyword)}&searchType=image&num=3&key=AIzaSyC-FAKEKEY1234567890&cx=FAKECXID123`; // Placeholder
    // Si no tienes API key, puedes omitir este bloque

    // ---- RESPUESTA FINAL ----
    return res.status(200).json({
      ok: true,
      keyword,
      country,
      sources: {
        trends: results,
        mercadoLibre: mlResults,
      },
      totalResults: results.length + mlResults.length
    });

  } catch (error) {
    console.error("🔥 Error general:", error);
    return res.status(500).json({
      ok: false,
      error: "Error al obtener datos en tiempo real",
      detalle: error.message
    });
  }
}
