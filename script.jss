async function generate() {
    const prompt = document.getElementById('prompt').value.trim();
    const responseDiv = document.getElementById('response');
    const button = document.getElementById('generate-btn');

    if (!prompt) {
        responseDiv.innerHTML = 'Please enter a prompt.';
        return;
    }

    responseDiv.innerHTML = 'Generating...';
    button.disabled = true;

    try {
        // Check localStorage cache first
        const cacheKey = `response_${prompt}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            responseDiv.innerHTML = cached;
        } else {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (data.error) {
                responseDiv.innerHTML = data.error;
            } else {
                responseDiv.innerHTML = data.response;
                localStorage.setItem(cacheKey, data.response);  // Cache for future
            }
        }
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message + '. Please try again.';
    } finally {
        button.disabled = false;
        responseDiv.scrollIntoView({ behavior: 'smooth' });
    }
}
