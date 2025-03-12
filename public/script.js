const voiceBtn = document.getElementById("voice-btn");
let recognition;

voiceBtn.addEventListener("mousedown", () => {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    // Afficher l'animation d'enregistrement
    const recordingIndicator = document.createElement("div");
    recordingIndicator.className = "recording-indicator";
    recordingIndicator.innerHTML = "🎤 Enregistrement...";
    document.getElementById("chat-box").appendChild(recordingIndicator);

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        sendMessage(text, true);
    };

    recognition.onend = () => {
        recordingIndicator.remove(); // Supprimer l'animation quand l'enregistrement s'arrête
    };

    recognition.start();
});

// Quand l'utilisateur relâche le bouton, on arrête l'enregistrement
voiceBtn.addEventListener("mouseup", () => {
    if (recognition) {
        recognition.stop();
    }
});

// Fonction pour envoyer un message (texte ou vocal converti en texte)
async function sendMessage(text = null, isVoice = false) {
    const inputField = document.getElementById("user-input");
    const message = text || inputField.value.trim();
    if (!message) return;

    appendMessage("Vous", isVoice ? "🔊 Message vocal" : message, "user-message", null, isVoice);

    inputField.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
        });

        const data = await response.json();
        appendMessage("Bot", data.text, "bot-message", data.audio);
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
    }
}

// Fonction pour afficher un message dans le chat
function appendMessage(sender, text, className, audio = null, isVoice = false) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;

    if (isVoice) {
        messageDiv.innerHTML = `<strong>${sender}:</strong> 🔊 Message vocal`;
    } else {
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    }

    chatBox.appendChild(messageDiv);

    if (audio) {
        const audioContainer = document.createElement("div");
        audioContainer.className = "audio-controls";

        const audioElement = document.createElement("audio");
        audioElement.src = audio;
        audioElement.controls = true;

        const playPauseBtn = document.createElement("button");
        playPauseBtn.innerText = "▶️";
        playPauseBtn.onclick = () => {
            if (audioElement.paused) {
                audioElement.play();
                playPauseBtn.innerText = "⏸️";
            } else {
                audioElement.pause();
                playPauseBtn.innerText = "▶️";
            }
        };

        audioContainer.appendChild(playPauseBtn);
        audioContainer.appendChild(audioElement);
        chatBox.appendChild(audioContainer);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}
