const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const gTTS = require("gtts");

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

        const audioFile = `public/audio_${Date.now()}.mp3`;
        const gtts = new gTTS(botText, "fr");
        gtts.save(audioFile, (err) => {
            if (err) {
                console.error("Erreur génération audio:", err);
                return res.json({ text: botText, audio: null });
            }
            res.json({ text: botText, audio: `/${audioFile}` });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur API" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
