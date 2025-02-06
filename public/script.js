document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");
    const sendMessageBtn = document.getElementById("sendMessage");

    sendMessageBtn.addEventListener("click", async () => {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        messageInput.value = "";

        // Simule une réponse du bot
        const response = await simulateBotResponse(message);
        handleBotResponse(response);
    });

    function addMessage(text, sender, isCode = false) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);

        if (isCode) {
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            code.textContent = text;
            pre.appendChild(code);
            msgDiv.appendChild(pre);
        } else {
            msgDiv.textContent = text;
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleBotResponse(response) {
        if (response.isCode) {
            addMessage(response.text, "bot", true);
        } else {
            addMessage(response.text, "bot");
        }
    }

    async function simulateBotResponse(userMessage) {
        // Détection simplifiée si le message contient du "code"
        if (userMessage.toLowerCase().includes("code")) {
            return { text: "Voici un exemple de code :\nconsole.log('Hello, world!');", isCode: true };
        } else {
            return { text: "Merci pour votre message !", isCode: false };
        }
    }
});
