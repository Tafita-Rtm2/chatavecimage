document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");
    const sendMessageBtn = document.getElementById("sendMessage");
    const imageUpload = document.getElementById("imageUpload");

    let uploadedImageUrl = null;
    let waitingForQuestion = false;

    function addMessage(text, sender, image = null) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);
        msgDiv.textContent = text;

        if (image) {
            const img = document.createElement("img");
            img.src = image;
            msgDiv.appendChild(img);
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendMessageBtn.addEventListener("click", async () => {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        messageInput.value = "";

        if (waitingForQuestion && uploadedImageUrl) {
            // L'utilisateur répond à la question sur l'image
            waitingForQuestion = false;
            const requestBody = { message, imageUrl: uploadedImageUrl };
            uploadedImageUrl = null;

            const response = await fetch("/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            addMessage(data.reply || "Aucune réponse reçue.", "bot");
        } else {
            // Envoi de texte uniquement
            const response = await fetch("/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            addMessage(data.reply || "Aucune réponse reçue.", "bot");
        }
    });

    imageUpload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        addMessage("Téléchargement de l'image en cours...", "bot");

        const formData = new FormData();
        formData.append("image", file);

        const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
        const { imageUrl } = await uploadResponse.json();
        uploadedImageUrl = imageUrl;

        addMessage("Image envoyée ! Posez votre question sur l'image :", "bot", imageUrl);
        waitingForQuestion = true;
    });
});
