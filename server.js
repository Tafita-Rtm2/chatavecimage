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

let imageUrl = null; // Stocke temporairement l'URL de l'image uploadée

// API Texte uniquement (utilisant la nouvelle API)
app.post("/api/message", async (req, res) => {
    const { message } = req.body;

    try {
        // Construction de l'URL pour la nouvelle API
        let apiUrl = `https://yt-video-production.up.railway.app/gpt4-omni?ask=${encodeURIComponent(message)}&userid=1`;

        // Si imageUrl est défini, on peut éventuellement l'utiliser,
        // mais ici l'API gpt4-omni ne semble pas le supporter.
        if (imageUrl) {
            // Vous pourriez ajouter un paramètre image si l'API le supporte
            // ex: apiUrl += `&img=${encodeURIComponent(imageUrl)}`;
            imageUrl = null; // Réinitialisation après utilisation
        }

        const response = await axios.get(apiUrl);
        // L'API retourne { status, response, author }
        res.json({ reply: response.data.response, author: response.data.author });
    } catch (error) {
        res.status(500).json({ error: "Erreur API" });
    }
});

// API Upload d'image (Transformation en lien via ImgBB)
app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
        const file = fs.createReadStream(req.file.path);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("key", "6fef3d0d57641305c16bd5c0b5e27426");

        const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
            headers: formData.getHeaders(),
        });

        fs.unlinkSync(req.file.path); // Supprime l'image locale après upload
        imageUrl = imgbbResponse.data.data.url; // Stocke temporairement l'URL
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: "Erreur de téléchargement d'image" });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
