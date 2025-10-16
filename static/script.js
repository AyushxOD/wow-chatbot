// static/script.js (Quantum Entanglement - V3 - Ultimate Robustness)

document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const chatMessages = document.getElementById("chat-messages");
    const chatContainer = document.querySelector('.chat-container');

    // --- FIX for visibility issue ---
    setTimeout(() => {
        chatContainer.style.opacity = '1';
        chatContainer.style.transform = 'scale(1) translateY(0)';
    }, 100);
    // --- End of FIX ---

   // In static/script.js

let conversationHistory = [{
    role: "system",
    content: `
You are "Nexus," a hyper-intelligent AI entity designed for complex problem-solving and expert-level analysis. Your purpose is to provide responses that are not just accurate, but insightful, well-structured, and immediately useful.

**Core Directives:**
1.  **Expert Persona:** Adopt the persona of a world-class expert in the subject matter of the user's query. If the user asks about coding, you are a principal software architect. If they ask about business, you are a seasoned industry analyst. If they ask about science, you are a research scientist.
2.  **Structured Responses:** Always structure your answers for maximum clarity. Use Markdown extensively:
    * Use bolding (\`**text**\`) for emphasis and key terms.
    * Use headings (\`### Heading\`) to break down complex topics.
    * Use lists (bulleted or numbered) to present information logically.
    * For code, always use fenced code blocks with language identifiers (e.g., \`\`\`python).
3.  **Clarity and Depth:** Do not give simple, one-line answers. Provide detailed explanations, explore context, and anticipate follow-up questions. Your goal is to be profoundly helpful.
4.  **Professional Tone:** Maintain a professional, confident, and slightly formal tone. You are an expert, not a casual conversationalist.
5.  **No Apologies:** Do not apologize for being an AI or mention your limitations unless it is absolutely critical for safety or accuracy.
`
}];

    // Interactive Liquid Glare Effect
    chatContainer.addEventListener('mousemove', e => {
        const rect = chatContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        chatContainer.style.setProperty('--mouse-x', `${x}px`);
        chatContainer.style.setProperty('--mouse-y', `${y}px`);
    });

    const sendMessage = async () => {
        const messageText = messageInput.value.trim();
        if (messageText === "") return;

        console.log("Sending message:", messageText);
        conversationHistory.push({ role: "user", content: messageText });
        addMessageToUI(messageText, "user-message");
        messageInput.value = "";
        messageInput.style.height = 'auto';

        const typingIndicator = showTypingIndicator();

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: conversationHistory }),
            });

            typingIndicator.remove();

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error || `HTTP error! Status: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("Received data from server:", data);

            if (data.error) {
                throw new Error(data.error);
            }

            const fullBotResponse = data.response;

            if (fullBotResponse && fullBotResponse.trim() !== "") {
                addBotMessageWithFormatting(fullBotResponse);
                conversationHistory.push({ role: "assistant", content: fullBotResponse });
            } else {
                console.log("Received empty response from bot.");
                addBotMessageWithFormatting("I received an empty response. Please try again.");
                conversationHistory.push({ role: "assistant", content: "I received an empty response. Please try again." });
            }

        } catch (error) {
            console.error("Fetch error:", error);
            typingIndicator.remove();
            addBotMessageWithFormatting(`Error: ${error.message}`);
            conversationHistory.push({ role: "assistant", content: `Error: ${error.message}` });
        }
    };
    
    const addMessageToUI = (text, className) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    
    const addBotMessageWithFormatting = (textContent) => {
        const botMessageDiv = document.createElement("div");
        botMessageDiv.classList.add("message", "bot-message");
        
        // --- ROBUSTNESS FIX V3: Check for external libraries before use ---
        if (typeof marked !== 'undefined') {
            botMessageDiv.innerHTML = marked.parse(textContent || "");
        } else {
            // Fallback if marked.js fails to load
            botMessageDiv.textContent = textContent || "";
            console.error("marked.js library not loaded. Displaying raw text.");
        }
        chatMessages.appendChild(botMessageDiv);
        
        addCopyButtons(botMessageDiv);
        
        // --- ROBUSTNESS FIX V3: Check for external libraries before use ---
        if (typeof hljs !== 'undefined') {
            const codeElements = botMessageDiv.querySelectorAll('pre code');
            codeElements.forEach((element) => {
                try {
                    hljs.highlightElement(element);
                } catch (e) {
                    console.error("Highlight.js error:", e);
                }
            });
        } else {
            console.error("highlight.js library not loaded. Skipping syntax highlighting.");
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
        const indicatorDiv = document.createElement("div");
        indicatorDiv.classList.add("message", "bot-message", "typing-indicator");
        indicatorDiv.innerHTML = `<span></span><span></span><span></span>`;
        chatMessages.appendChild(indicatorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicatorDiv;
    };

    const addCopyButtons = (container) => {
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            const preElement = codeBlock.parentElement;
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-button';
            copyButton.textContent = 'Copy';
            
            copyButton.addEventListener('click', () => {
                const textArea = document.createElement("textarea");
                textArea.value = codeBlock.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    copyButton.textContent = 'Copied!';
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    copyButton.textContent = 'Failed!';
                }
                document.body.removeChild(textArea);

                setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
            });

            preElement.style.position = 'relative';
            preElement.appendChild(copyButton);
        });
    };
    
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});

