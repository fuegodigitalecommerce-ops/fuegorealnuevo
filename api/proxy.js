export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Falta el parámetro URL" });

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Error en el proxy",
      detalle: err.message,
    });
  }
}
