const langToggle = document.getElementById('lang-toggle');
const micBtn = document.getElementById('mic-btn');
const transcribedText = document.getElementById('transcribed-text');
const translatedText = document.getElementById('translated-text');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const pulse = document.getElementById('pulse');
const labelEn = document.getElementById('label-en');
const labelFi = document.getElementById('label-fi');

let recognition;
let isListening = false;
let sourceLang = 'en-US';
let targetLang = 'fi';

// Check for Web Speech API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        statusDot.classList.add('active');
        pulse.classList.add('active');
        statusText.innerText = 'Listening...';
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        statusDot.classList.remove('active');
        pulse.classList.remove('active');
        statusText.innerText = 'Paused';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript || interimTranscript) {
            transcribedText.innerHTML = `<span>${finalTranscript}</span><span style="opacity: 0.6">${interimTranscript}</span>`;
            
            if (finalTranscript) {
                translateText(finalTranscript);
            }
        }
    };
} else {
    statusText.innerText = 'Speech recognition not supported in this browser.';
    micBtn.disabled = true;
}

// Language Toggle Logic
langToggle.addEventListener('change', () => {
    if (langToggle.checked) {
        // FI -> EN
        sourceLang = 'fi-FI';
        targetLang = 'en';
        labelEn.style.color = 'var(--text-muted)';
        labelFi.style.color = 'var(--primary-color)';
        recognition.lang = sourceLang;
    } else {
        // EN -> FI
        sourceLang = 'en-US';
        targetLang = 'fi';
        labelEn.style.color = 'var(--primary-color)';
        labelFi.style.color = 'var(--text-muted)';
        recognition.lang = sourceLang;
    }
    
    // Clear display
    transcribedText.innerHTML = '<span class="placeholder">Mode changed. Speak now...</span>';
    translatedText.innerHTML = '<span class="placeholder">Waiting for speech...</span>';
    
    // If listening, restart with new language
    if (isListening) {
        recognition.stop();
        setTimeout(() => recognition.start(), 200);
    }
});

// Mic Button Logic
micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        recognition.lang = sourceLang;
        recognition.start();
    }
});

/**
 * Mock translation function (Replace with real API endpoint)
 */
async function translateText(text) {
    translatedText.innerHTML = '<span class="placeholder" id="translating-indicator">Translating...</span>';
    
    try {
        // In a real scenario, you would call a server-side route or Gemini API here.
        // For local development without a backend, we'll use a public basic translation API for demo purposes.
        // NOTE: MyMemory API is free and doesn't require a key for small requests.
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang.split('-')[0]}|${targetLang}`);
        const data = await response.json();
        
        if (data.responseData) {
            translatedText.innerText = data.responseData.translatedText;
        } else {
            translatedText.innerText = "Error: Translation failed.";
        }
    } catch (error) {
        console.error("Translation Error:", error);
        translatedText.innerText = "Connection error.";
    }
}
