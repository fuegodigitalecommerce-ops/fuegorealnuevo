export default async function handler(req, res) {
  const { keyword = "navidad", country = "CO" } = req.query;

  try {
    const proxyBase = "https://fuego-proxy-latam.vercel.app/api/proxy";
    const googleTrendsUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es-419&tz=-300&geo=${country}&req={"restriction":{"type":"COUNTRY","geo":{"country":"${country}"}},"keywordType":"QUERY","keyword":"${keyword}","time":"today 12-m"}&token=APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU`;

    const finalUrl = `${proxyBase}?url=${encodeURIComponent(googleTrendsUrl)}`;
    const response = await fetch(finalUrl);
    const text = await response.text();

    if (!text || text.startsWith("<")) {
      throw new Error("Google Trends respondió HTML o vacío el contenido");
    }

    const json = JSON.parse(text.replace(")]}',", ""));
    const results = (json.default?.rankedList?.[0]?.rankedKeyword || []).map((k, i) => ({
      id: i + 1,
      title: k.topic?.title || "Tendencia sin nombre",
      value: k.value,
    }));

    res.status(200).json({ ok: true, keyword, country, results });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Google Trends respondió HTML o vacío el contenido",
      detalle: error.message,
    });
  }
}
