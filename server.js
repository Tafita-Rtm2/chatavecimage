const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Configuration de multer pour l'upload des images
const upload = multer({ storage: multer.memoryStorage() });

// Route pour traiter une question en texte
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  const apiUrl = `https://zaikyoo.onrender.com/api/4ov2?prompt=${encodeURIComponent(prompt)}&uid=1&img=`;

  try {
    const response = await axios.get(apiUrl);
    res.json({ reply: response.data.reply });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la réponse" });
  }
});

// Route pour uploader une image sur ImgBB et l'envoyer à l'API
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucune image reçue" });

  try {
    // Conversion en base64 pour l'envoi à ImgBB
    const imgData = req.file.buffer.toString("base64");
    const imgBBApiUrl = "https://api.imgbb.com/1/upload";
    const imgBBKey = "6fef3d0d57641305c16bd5c0b5e27426";

    // Upload sur ImgBB
    const uploadResponse = await axios.post(imgBBApiUrl, null, {
      params: { key: imgBBKey, image: imgData },
    });

    const imageUrl = uploadResponse.data.data.url;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
