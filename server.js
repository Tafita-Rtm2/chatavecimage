const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const gTTS = require("gtts");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
    const { text } = req.body;
    try {
        const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(text)}&uid=1&webSearch=off`);
        const botText = response.data.response;

        const timestamp = Date.now();
        const audioFile = `public/audio_${timestamp}.mp3`;
        const audioPath = `/audio_${timestamp}.mp3`;

        const gtts = new gTTS(botText, "fr");
        gtts.save(audioFile, (err) => {
            if (err) {
                console.error("Erreur génération audio:", err);
                return res.json({ text: botText, audio: null });
            }
            console.log(`Fichier audio généré: ${audioFile}`);
            res.json({ text: botText, audio: audioPath });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur API" });
    }
});

// Nettoyage des fichiers audio après un certain temps
setInterval(() => {
    fs.readdir("public", (err, files) => {
        if (err) return console.error("Erreur de lecture des fichiers:", err);

        files.forEach((file) => {
            if (file.startsWith("audio_") && file.endsWith(".mp3")) {
                const filePath = `public/${file}`;
                fs.stat(filePath, (err, stats) => {
                    if (err) return console.error("Erreur de fichier:", err);

                    const now = Date.now();
                    if (now - stats.birthtimeMs > 60000) { // Supprime après 60s
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Erreur suppression:", err);
                            else console.log(`Fichier supprimé: ${filePath}`);
                        });
                    }
                });
            }
        });
    });
}, 60000);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
