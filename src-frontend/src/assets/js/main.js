const APP = {
    ready: false,

    callbacks: [],

    config: {},

    supabaseClient: null,

    onReady: (callback) => {
        if (APP.ready) {
            callback();
            return;
        }

        APP.callbacks.push(callback);
    },

    init: async () => {
        try {
            await HELPERS.loadConfig();

            APP.supabaseClient = HELPERS.createSupabaseClient();
        } catch (error) {
            console.error(error);
            window.document.body.innerHTML = `<div class="w-1/2 mx-auto text-3xl bg-gray-900 text-white">[ERROR]<br>${error.message}</div>`;
            return;
        }

        APP.ready = true;
        APP.callbacks.forEach(callback => callback());
        APP.callbacks = [];
    },
};

const HELPERS = {
    createSupabaseClient: () => {
        return supabase.createClient(APP.config.SUPABASE_API_URL, APP.config.SUPABASE_API_ANON_KEY);
    },

    loadConfig: async () => {
        const config = await HELPERS.fetchConfig();
        HELPERS.validateAllConfigValuesAreSet(config);
        APP.config = config;
    },

    fetchConfig: () => fetch("/config.json").then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load file config.json: ${response.status} - ${response.statusText}`);
        }

        return response.json();
    }),

    validateAllConfigValuesAreSet: (config) => {
        Object.keys(config).forEach(key => {
            if (!config[key]) {
                throw new Error(`Config value not set: ${key}. Check file config.json`);
            }
        });
    },        
};

document.addEventListener("DOMContentLoaded", APP.init);
