document.getElementById("voice-btn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "fr-FR";

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        sendMessage(text, true);
    };

    recognition.start();
});

async function sendMessage(text = null, isVoice = false) {
    const inputField = document.getElementById("user-input");
    const message = text || inputField.value.trim();
    if (!message) return;

    appendMessage("Vous", message, isVoice ? "audio-message" : "user-message", isVoice ? "user_voice.mp3" : null);

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

function appendMessage(sender, text, className, audio = null) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;

    if (className === "audio-message") {
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
