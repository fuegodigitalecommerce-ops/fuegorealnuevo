// /api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const keyword = req.query.keyword || "navidad";
  const country = req.query.country || "CO";

  try {
    // Construcción del cuerpo de solicitud de Google Trends
    const reqBody = {
      comparisonItem: [
        {
          keyword,
          geo: country === "LATAM" ? "" : country,
          time: "today 12-m"
        }
      ],
      category: 0,
      property: ""
    };

    // Proxy personalizado (tu propio servidor)
    const proxyUrl =
      "https://fuego-proxy-latam-2nw6hr0ic-juan-coneos-projects.vercel.app/api/proxy?url=";

    // Construcción segura de la URL completa a través del proxy
    const googleUrl = `https://trends.google.com/trends/api/explore?hl=es-419&tz=-300&req=${encodeURIComponent(
      JSON.stringify(reqBody)
    )}`;

    // Solicitud pasando por el proxy FUEGO
    const response = await fetch(proxyUrl + encodeURIComponent(googleUrl), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
