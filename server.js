const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// API Texte ou Texte + Image
app.post("/api/message", async (req, res) => {
    const { message, imageUrl } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Le message est requis." });
    }

    try {
        // Construction de l'URL de l'API Kaizenji
        let apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision?q=${encodeURIComponent(message)}&uid=1`;
        if (imageUrl) {
            apiUrl += `&imageUrl=${encodeURIComponent(imageUrl)}`;
        }

        console.log("Requête envoyée à l'API :", apiUrl); // Debugging

        const response = await axios.get(apiUrl);
        console.log("Réponse API :", response.data); // Debugging

        res.json({ reply: response.data.response });
    } catch (error) {
        console.error("Erreur API :", error.response?.data || error.message);
        res.status(500).json({ error: "Erreur lors de l'appel à l'API." });
    }
});

// API Upload d'image (Transformation en lien via ImgBB)
app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier reçu." });
    }

    try {
        const file = fs.createReadStream(req.file.path);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("key", "6fef3d0d57641305c16bd5c0b5e27426");

        const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
            headers: formData.getHeaders(),
        });

        fs.unlinkSync(req.file.path); // Supprime l'image locale après upload
        const uploadedImageUrl = imgbbResponse.data.data.url;

        console.log("Image uploadée :", uploadedImageUrl); // Debugging

        res.json({ imageUrl: uploadedImageUrl });
    } catch (error) {
        console.error("Erreur Upload Image :", error.response?.data || error.message);
        res.status(500).json({ error: "Erreur de téléchargement d'image" });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
