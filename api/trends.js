// /api/trends.js
export default async function handler(req, res) {
  try {
    const { keyword = "navidad", country = "CO" } = req.query;

    // Proxy interno dentro del mismo proyecto (sin depender de otros dominios)
    const proxyUrl = `${req.headers.origin}/api/proxy?url=`;

    // URL real de Google Trends (tendencias relacionadas)
    const googleTrendsUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es-419&tz=-300&geo=${country}&req={"restriction":{"type":"COUNTRY","geo": {"country": "${country}"}}, "keywordType":"QUERY", "keyword":"${keyword}","time":"today 12-m"}&token=APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU`;

    // Llamada al proxy interno
    const response = await fetch(proxyUrl + encodeURIComponent(googleTrendsUrl));
    const text = await response.text();

    // Verificamos si la respuesta no es HTML
    if (text.trim().startsWith("<")) {
      return res.status(500).json({
        ok: false,
        error: "Google Trends respondió HTML o vació el contenido",
        detalle: "Puede que el proxy gratuito esté saturado, intenta de nuevo",
      });
    }

    // Google Trends devuelve texto con prefijo ")]}'," que hay que limpiar
    const cleanText = text.replace(")]}',", "").trim();

    // Intentamos convertir a JSON
    const data = JSON.parse(cleanText);

    // Extraemos resultados
    const results =
      data?.default?.rankedList?.[0]?.rankedKeyword?.map((item, index) => ({
        id: index + 1,
        query: item.query,
        value: item.value,
      })) || [];

    // Simulamos conexión a productos de Mercado Libre (ejemplo futuro)
    const productos = results.map((r) => ({
      ...r,
      producto: `https://www.mercadolibre.com.co/search?as_word=${encodeURIComponent(
        r.query
      )}`,
      imagen: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
        r.query
      )}`,
    }));

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      total: productos.length,
      results: productos,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: err.message,
    });
  }
}
