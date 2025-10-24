// 🔥 FUEGO API LATAM – versión 4 real
export default async function handler(req, res) {
  const { keyword = "navidad", country = "CO" } = req.query;

  const proxyBase = "https://fuego-proxy-latam.vercel.app/api/proxy";
  const googleBase = "https://trends.google.com/trends/api/widgetdata/relatedsearches";
  const tokenList = [
    "APP6_UEAAAAAZfCzq8z1gI3D2skBkYYKXy8wTGae2hvU",
   
