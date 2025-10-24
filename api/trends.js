// 🔥 FUEGO API LATAM – versión 4 real
export default async function handler(req, res) {
  const { keyword = "navidad", country = "CO" } = req.query;

  const proxyBase = "https://fuego-proxy-latam.vercel.app/api/proxy";
  const googleBase = "https://trends.google.com/trends/api/widgetdata/relatedsearches";
  const tokenList = [
    "APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU",
   
    "APP6_UEAAAAAZEXAMPLE1",
    "APP6_UEAAAAAZEXAMPLE2"
  ];

  // Mapeo de países compatibles con Mercado Libre
  const meliMap = {
    CO: "MCO",
    MX: "MLM",
    AR: "MLA",
    CL: "MLC",
    PE: "MPE",
    UY: "MLU",
    EC: "MEC"
  };

  const site = meliMap[country] || "MCO";

  try {
    let json = null;
    let results = [];

    // Intentar obtener desde Google Trends
    for (const token of tokenList) {
      const reqUrl = `${googleBase}?hl=es-419&tz=-300&geo=${country}&req={"restriction":{"type":"COUNTRY","geo":{"country":"${country}"}},"keywordType":"QUERY","keyword":"${keyword}","time":"today 12-m"}&token=${token}`;
      const fullUrl = `${proxyBase}?url=${encodeURIComponent(reqUrl)}`;
      const resp = await fetch(fullUrl);
      const text = await resp.text();

      if (!text || text.startsWith("<")) continue;

      try {
        json = JSON.parse(text.replace(")]}',", ""));
        results = (json.default?.rankedList?.[0]?.rankedKeyword || []).map((k, i) => ({
          id: i + 1,
          title: k.topic?.title || k.query || "Tendencia sin nombre",
          value: k.value || 0,
          source: "GoogleTrends"
        }));
        if (results.length > 0) break;
      } catch {
        continue;
      }
    }

    // Si no hay resultados de Google, intentar Mercado Libre
    if (results.length === 0) {
      const meliUrl = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(keyword)}`;
      const meliResp = await fetch(meliUrl);
      const meliData = await meliResp.json();

      results = (meliData.results || []).slice(0, 10).map((item, i) => ({
        id: i + 1,
        title: item.title,
        price: item.price,
        thumbnail: item.thumbnail,
        permalink: item.permalink,
        source: "MercadoLibre"
      }));
    }

    // Fallback con sugerencias manuales
    if (results.length === 0) {
      const fallback = [
        { id: 1, title: "Decoración navideña artesanal", source: "FUEGO_AI" },
        { id: 2, title: "Luces LED y adornos festivos", source: "FUEGO_AI" },
        { id: 3, title: "Regalos personalizados en tendencia", source: "FUEGO_AI" },
        { id: 4, title: "Accesorios ecológicos para el hogar", source: "FUEGO_AI" }
      ];
      results = fallback;
    }

    res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Error general en FUEGO API",
      detalle: error.message
    });
  }
}
