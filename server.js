const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// API Texte uniquement
app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.get(
      `https://zaikyoo.onrender.com/api/4ov2?prompt=${encodeURIComponent(message)}&uid=1&img=`
    );
    res.json({ reply: response.data.reply });
  } catch (error) {
    res.status(500).json({ error: "Erreur API" });
  }
});

// API Texte + Image (upload image vers ImgBB)
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const file = fs.createReadStream(req.file.path);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "6fef3d0d57641305c16bd5c0b5e27426");

    const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    fs.unlinkSync(req.file.path);
    res.json({ imageUrl: imgbbResponse.data.data.url });
  } catch (error) {
    res.status(500).json({ error: "Erreur de téléchargement" });
  }
});

// API Texte avec Image
app.post("/api/message-image", async (req, res) => {
  const { message, imageUrl } = req.body;
  try {
    const response = await axios.get(
      `https://zaikyoo.onrender.com/api/4ov2?prompt=${encodeURIComponent(message)}&uid=1&img=${encodeURIComponent(imageUrl)}`
    );
    res.json({ reply: response.data.reply });
  } catch (error) {
    res.status(500).json({ error: "Erreur API" });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
