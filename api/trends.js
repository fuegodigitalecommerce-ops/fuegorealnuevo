import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // --- 1️⃣ Captura de parámetros ---
    const { keyword = "moda", country = "CO" } = req.query;
    const geo = country.toUpperCase();

    // --- 2️⃣ URL de Google Trends ---
    const trendsURL = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es-419&tz=-300&geo=${geo}&req={"restriction":{"type":"COUNTRY","geo":{"country":"${geo}"}},"keywordType":"QUERY","keyword":"${keyword}","time":"today 12-m"}&token=APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU`;

    // --- 3️⃣ Llamada real al endpoint ---
    const response = await fetch(trendsURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
    });

    const text = await response.text();

    // --- 4️⃣ Validación de respuesta ---
    if (!text || text.startsWith("<")) {
      return res.status(500).json({
        ok: false,
        error: "Google Trends respondió HTML o vacío el contenido",
        detalle:
          "Puede que Google esté bloqueando la solicitud directa. Se recomienda usar el proxy interno o autenticación API.",
      });
    }

    // --- 5️⃣ Limpieza del texto JSON devuelto ---
    const clean = text.replace(/^\)\]\}',/, "");
    const data = JSON.parse(clean);

    // --- 6️⃣ Extracción segura de los términos relacionados ---
    const ranked = data.default?.rankedList?.[0]?.rankedKeyword || [];
    const results = ranked.map((item, i) => ({
      id: i + 1,
      title: item.topic?.title || item.query || "Sin título",
      type: item.topic?.type || "Tendencia",
      value: item.value?.[0] || 0,
    }));

    // --- 7️⃣ Devuelve el JSON estructurado ---
    res.status(200).json({
      ok: true,
      keyword,
      country: geo,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("❌ Error en /api/trends:", error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener datos",
      detalle: error.message,
    });
  }
}
