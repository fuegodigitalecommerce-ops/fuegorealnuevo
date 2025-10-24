// api/trends.js
export default async function handler(req, res) {
  const { keyword = "navidad", country = "CO" } = req.query;

  try {
    // URL real de Google Trends
    const trendsUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es-419&tz=-300&geo=${country}&req={"restriction":{"type":"COUNTRY","geo":{"country":"${country}"}},"keywordType":"QUERY","keyword":"${keyword}","time":"today 12-m"}&token=APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU`;

    // Petición con headers reales de navegador
    const response = await fetch(trendsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });

    const text = await response.text();

    // Si Google Trends devuelve HTML o vacío, no seguimos
    if (!text || text.startsWith("<")) {
      return res.status(500).json({
        ok: false,
        error: "Google Trends respondió HTML o vacío el contenido",
        detalle:
          "Google podría estar bloqueando la consulta directa. Intenta más tarde o usa el proxy propio.",
      });
    }

    // Limpiar el prefijo extraño de JSON de Google Trends
    const cleanJson = text.replace(")]}',", "");
    const data = JSON.parse(cleanJson);

    // Extraer palabras relacionadas
    const trends =
      data.default?.rankedList?.[0]?.rankedKeyword?.map((item) => ({
        query: item.query,
        value: item.value,
        formattedValue: item.formattedValue,
      })) || [];

    res.status(200).json({
      ok: true,
      keyword,
      country,
      results: trends.slice(0, 10), // máximo 10 tendencias
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: error.message,
    });
  }
}
