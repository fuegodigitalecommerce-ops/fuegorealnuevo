// /api/proxy.js
export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ ok: false, error: "Falta el parámetro 'url'" });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        Accept: "application/json,text/plain,*/*",
      },
    });

    const text = await response.text();

    return res.status(200).send(text);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Error en el proxy interno",
      detalle: err.message,
    });
  }
}
