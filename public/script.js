document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");
    const sendMessageBtn = document.getElementById("sendMessage");
    const imageUpload = document.getElementById("imageUpload");

    let uploadedImageUrl = null;

    function addMessage(text, sender, image = null, isCode = false) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);

        if (isCode) {
            const pre = document.createElement("pre");
            const codeBlock = document.createElement("code");
            codeBlock.textContent = text;
            pre.appendChild(codeBlock);
            msgDiv.appendChild(pre);
        } else {
            msgDiv.textContent = text;
        }

        if (image) {
            const img = document.createElement("img");
            img.src = image;
            img.style.maxWidth = "100px";
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

        let requestBody = { message };
        if (uploadedImageUrl) {
            requestBody.imageUrl = uploadedImageUrl;
            uploadedImageUrl = null;
        }

        const response = await fetch("/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();

        addMessage(data.reply, "bot");
    });

    imageUpload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        addMessage("📤 Téléchargement de l'image en cours...", "bot");

        const formData = new FormData();
        formData.append("image", file);

        const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
        const { imageUrl, message } = await uploadResponse.json();
        uploadedImageUrl = imageUrl;

        addMessage(message, "bot", imageUrl);
    });
});
