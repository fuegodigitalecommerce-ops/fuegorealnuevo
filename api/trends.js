export default async function handler(req, res) {
  try {
    const { keyword = "navidad", country = "CO" } = req.query;

    // Definir URL base del proxy interno con fallback
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : req.headers.origin || "http://localhost:3000";

    // Proxy interno
    const proxyUrl = `${baseUrl}/api/proxy?url=`;

    // URL real de Google Trends
    const googleTrendsUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es-419&tz=-300&geo=${country}&req={"restriction":{"type":"COUNTRY","geo": {"country": "${country}"}}, "keywordType":"QUERY", "keyword":"${keyword}","time":"today 12-m"}&token=APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU`;

    // Llamada al proxy interno
    const response = await fetch(proxyUrl + encodeURIComponent(googleTrendsUrl));
    const text = await response.text();

    // Verificamos si la respuesta no es HTML
    if (text.trim().startsWith("<")) {
      return res.status(500).json({
        ok: false,
        error: "Google Trends respondió HTML o vacío el contenido",
        detalle: "Puede que el proxy gratuito esté saturado, intenta de nuevo",
      });
    }

    // Limpieza del prefijo especial de Google Trends
    const cleanText = text.replace(")]}',", "").trim();

    // Convertir a JSON
    const data = JSON.parse(cleanText);

    // Extraer tendencias
    const results =
      data?.default?.rankedList?.[0]?.rankedKeyword?.map((item, i) => ({
        id: i + 1,
        query: item.query,
        value: item.value,
        link: `https://www.mercadolibre.com.co/search?as_word=${encodeURIComponent(item.query)}`,
        imagen: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.query)}`,
      })) || [];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      total: results.length,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: err.message,
    });
  }
}
