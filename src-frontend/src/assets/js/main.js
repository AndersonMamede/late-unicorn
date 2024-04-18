async function loadConfig() {
    try {
        const config = await getConfig();
        validateAllConfigValuesAreSet(config);
        window.CONFIG = config;
    } catch (error) {
        console.error(error);
        window.document.body.innerHTML = `<div class="w-1/2 mx-auto text-3xl bg-gray-900 text-white">[ERROR]<br>${error.message}</div>`;
    }
}

function getConfig() {
    return fetch("/config.json").then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load file config.json: ${response.status} - ${response.statusText}`);
        }

        return response.json();
    });
}

function validateAllConfigValuesAreSet(config) {
    Object.keys(config).forEach(key => {
        if (!config[key]) {
            throw new Error(`Config value not set: ${key}. Check file config.json`);
        }
    });
}

(async () => {
    await loadConfig();
})();
