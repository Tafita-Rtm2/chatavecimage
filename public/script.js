const voiceBtn = document.getElementById("voice-btn");
let recognition;
let recordingIndicator;

voiceBtn.addEventListener("mousedown", startRecording);
voiceBtn.addEventListener("touchstart", startRecording);

voiceBtn.addEventListener("mouseup", stopRecording);
voiceBtn.addEventListener("touchend", stopRecording);

function startRecording() {
    if (recognition) return; // Évite plusieurs déclenchements

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    // Afficher l'indicateur d'enregistrement
    recordingIndicator = document.createElement("div");
    recordingIndicator.className = "recording-indicator";
    recordingIndicator.innerHTML = "🎤 Enregistrement...";
    document.getElementById("chat-box").appendChild(recordingIndicator);

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        sendMessage(text, true);
    };

    recognition.onend = () => {
        stopRecording();
    };

    recognition.start();
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    if (recordingIndicator) {
        recordingIndicator.remove();
        recordingIndicator = null;
    }
}

// Fonction pour envoyer un message (texte ou vocal converti)
async function sendMessage(text, isVoice = false) {
    if (!text) return;

    appendMessage("Vous", isVoice ? "🔊 Message vocal" : text, "user-message", null, isVoice);

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        appendMessage("Bot", data.text, "bot-message", data.audio);
    } catch (error) {
        console.error("Erreur d'envoi:", error);
    }
}

// Fonction pour afficher un message
function appendMessage(sender, text, className, audio = null, isVoice = false) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;

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
