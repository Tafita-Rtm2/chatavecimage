document.getElementById("voice-btn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "fr-FR";

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById("user-input").value = text;
        sendMessage();
    };

    recognition.start();
});

async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const message = inputField.value.trim();
    if (!message) return;

    // Afficher le message de l'utilisateur
    appendMessage("Vous", message);

    inputField.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
        });

        const data = await response.json();
        appendMessage("Bot", data.text, data.audio);
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
    }
}

function appendMessage(sender, text, audio = null) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(messageDiv);

    if (audio) {
        const audioElement = document.createElement("audio");
        audioElement.src = audio;
        audioElement.controls = true;
        chatBox.appendChild(audioElement);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}
