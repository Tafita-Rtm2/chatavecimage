document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");
    const sendMessageBtn = document.getElementById("sendMessage");
    const imageUpload = document.getElementById("imageUpload");

    let uploadedImageUrl = null;

    loadMessages();

    function addMessage(text, sender, image = null) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);
        msgDiv.textContent = text;

        if (image) {
            const img = document.createElement("img");
            img.src = image;
            img.style.maxWidth = "100px";
            msgDiv.appendChild(img);
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        saveMessages(text, sender, image);
    }

    function saveMessages(text, sender, image) {
        let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        messages.push({ text, sender, image });
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }

    function loadMessages() {
        let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        messages.forEach(msg => addMessage(msg.text, msg.sender, msg.image));
    }

    sendMessageBtn.addEventListener("click", async () => {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        messageInput.value = "";

        let requestBody = { message };
        if (uploadedImageUrl) {
            requestBody.imageUrl = uploadedImageUrl;
            uploadedImageUrl = null; // Reset après l'envoi
        }

        try {
            const response = await fetch("/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();

            if (data.reply) {
                addMessage(data.reply, "bot");
            } else {
                addMessage("Aucune réponse reçue.", "bot");
            }
        } catch (error) {
            addMessage("Erreur de connexion avec le serveur.", "bot");
        }
    });

    imageUpload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        addMessage("Téléchargement de l'image en cours...", "bot");

        const formData = new FormData();
        formData.append("image", file);

        try {
            const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
            const { imageUrl } = await uploadResponse.json();
            uploadedImageUrl = imageUrl;

            addMessage("Image envoyée. Tapez votre question :", "bot", imageUrl);
        } catch (error) {
            addMessage("Erreur lors du téléchargement de l'image.", "bot");
        }
    });
});
