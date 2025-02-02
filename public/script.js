document.getElementById("sendButton").addEventListener("click", sendMessage);

async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const chatBox = document.getElementById("chat-box");
    const fileInput = document.getElementById("imageInput");
    let userMessage = inputField.value.trim();
    
    if (!userMessage && !fileInput.files.length) return;

    // Affichage du message utilisateur
    chatBox.innerHTML += `<div class="user-message"><img src="user1.jpg"> ${userMessage}</div>`;
    inputField.value = "";

    if (fileInput.files.length) {
        let formData = new FormData();
        formData.append("image", fileInput.files[0]);

        chatBox.innerHTML += `<div class="bot-message">⏳ Uploading image...</div>`;
        const uploadResponse = await fetch("/upload", { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();

        if (uploadData.imageUrl) {
            userMessage = prompt("Entrez une question sur l'image :");
            chatBox.innerHTML += `<img src="${uploadData.imageUrl}" class="sent-image">`;
        }
    }

    const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage })
    });

    const data = await response.json();
    chatBox.innerHTML += `<div class="bot-message"><img src="robot1.jpg"> ${data.reply}</div>`;
}
