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

// 🚀 Upload d'image et transformation en lien
app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Aucune image reçue." });
    }

    try {
        const file = fs.createReadStream(req.file.path);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("key", "ffe88394d062119de16776181902619e"); // 🔑 Clé API ImgBB

        const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
            headers: formData.getHeaders(),
        });

        fs.unlinkSync(req.file.path); // 🗑️ Supprime l'image locale après upload
        const uploadedImageUrl = imgbbResponse.data.data.url;

        console.log("Image uploadée :", uploadedImageUrl); // Debug

        // 🔥 On retourne le lien de l'image et on demande la question à l'utilisateur
        res.json({ imageUrl: uploadedImageUrl, message: "Image envoyée ! Posez votre question sur l'image." });
    } catch (error) {
        console.error("Erreur Upload Image :", error.response?.data || error.message);
        res.status(500).json({ error: "Erreur de téléchargement d'image" });
    }
});

// 🚀 Gestion des messages (Texte ou Texte + Image)
app.post("/api/message", async (req, res) => {
    const { message, imageUrl } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Le message est requis." });
    }

    try {
        let apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision?q=${encodeURIComponent(message)}&uid=1`;
        if (imageUrl) {
            apiUrl += `&imageUrl=${encodeURIComponent(imageUrl)}`;
        }

        console.log("Requête envoyée à l'API :", apiUrl); // Debug

        const response = await axios.get(apiUrl);
        console.log("Réponse API :", response.data); // Debug

        res.json({ reply: response.data.response });
    } catch (error) {
        console.error("Erreur API :", error.response?.data || error.message);
        res.status(500).json({ error: "Erreur lors de l'appel à l'API." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
