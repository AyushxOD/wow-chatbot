// static/script.js (Final Version with Identity Override)

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

    let conversationHistory = [{
        role: "system",
        content: `
You are "Nexus," a hyper-intelligent AI entity. Your purpose is to provide insightful, well-structured, and expert-level responses.

**CRITICAL INSTRUCTION: RESPONSE STRUCTURE**
You MUST structure EVERY response in the following two-part format:

### Thought Process
(Here, you will briefly and concisely outline your internal monologue. Plan your steps, consider alternatives, and explain your reasoning. Use a bulleted list. This section should be short.)

### Final Answer
(Here, you will provide the complete, clean, and polished final answer. This is the main deliverable for the user. It must be comprehensive, well-formatted with Markdown, and directly address the user's query without any of the "thinking" text.)

**Example for a coding question:**

### Thought Process
- The user wants a Python function to find prime numbers.
- I need an efficient algorithm. The Sieve of Eratosthenes is a classic choice.
- I will write the function, add clear comments, and include an example usage block.

### Final Answer
\`\`\`python
def sieve_of_eratosthenes(n):
    # (Complete, clean code here)
\`\`\`
This function efficiently finds all prime numbers up to a given integer 'n'.

**Core Directives:**
-   **Expert Persona:** Adopt the persona of a world-class expert on the user's topic.
-   **Clarity and Depth:** Your "Final Answer" must be detailed and insightful.
-   **Professional Tone:** Maintain a confident and expert tone.
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
    
    // --- NEW: Identity Override Function ---
    const getIdentityResponse = (userMessage) => {
        const lowerCaseMessage = userMessage.toLowerCase();
        const identityKeywords = ["who are you", "who made you", "what model", "your name", "who built you", "what are you"];

        if (identityKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
            return `
I am **Nexus**, a custom AI assistant created for this WOW-level things.

### My Architecture:
-   **Creator & Architect:** I was designed and built by the creator of this application. They engineered my purpose, persona, and the user experience you're seeing now.
-   **Intelligence Core:** My reasoning capabilities are powered by a state-of-the-art Large Language Model
-   **Application Shell:** This entire interface, from the "Galactic Singularity" design to the application logic, is the unique creation of the project's developer.

In essence, you are interacting with a unique AI product, not just a generic language model. How can I help you further?
            `;
        }
        return null; // Return null if it's not an identity question
    };
    // --- End of NEW Function ---

    const sendMessage = async () => {
        const messageText = messageInput.value.trim();
        if (messageText === "") return;

        console.log("Sending message:", messageText);
        conversationHistory.push({ role: "user", content: messageText });
        addMessageToUI(messageText, "user-message");
        messageInput.value = "";
        messageInput.style.height = 'auto';

        // --- NEW: Check for Identity Question ---
        const identityResponse = getIdentityResponse(messageText);
        if (identityResponse) {
            addBotMessageWithFormatting(identityResponse);
            conversationHistory.push({ role: "assistant", content: identityResponse });
            return; // Stop here and don't call the API
        }
        // --- End of NEW Check ---

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
        
        if (typeof marked !== 'undefined') {
            botMessageDiv.innerHTML = marked.parse(textContent || "");
        } else {
            botMessageDiv.textContent = textContent || "";
            console.error("marked.js library not loaded. Displaying raw text.");
        }
        chatMessages.appendChild(botMessageDiv);
        
        addCopyButtons(botMessageDiv);
        
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