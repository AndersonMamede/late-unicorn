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
            HELPERS.showFatalError(error.message);
            return;
        }

        APP.supabaseClient.auth.onAuthStateChange(HELPERS.handleAuthStateChange);

        APP.ready = true;

        APP.callbacks.forEach(callback => callback());
        APP.callbacks = [];
    },

    signInWithGoogle: async () => {
        const { error } = await APP.supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard/`,
            },
        });

        if (error) {
            HELPERS.showFatalError(error.message);
            return false;
        }

        return true;
    },
};

const HELPERS = {
    showFatalError: (message) => {
        // replace all the page content with the error message...
        document.body.innerHTML = `
            <div class="h-full flex items-center justify-center text-3xl bg-gray-900 text-white">
                <p>[ERROR]<br>${message}<p>
            </div>
        `;

        // show guest and authenticated content since all the page content was replaced with the fatal error message
        HELPERS.showGuestContent();
        HELPERS.showAuthenticatedContent();
    },

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

    getUser: async () => {
        const { data: { session } } = await APP.supabaseClient.auth.getSession();
        return session ? session?.user : null;
    },

    isUserAuthenticated: async () => {
        return (await HELPERS.getUser()) !== null;
    },

    handleAuthStateChange: async (event) => {
        switch (event) {
            case "INITIAL_SESSION":
                document.querySelector("#navbar-spinner")?.remove();

                if (await HELPERS.isUserAuthenticated()) {
                    document.querySelector(".navbar.--authenticated")?.classList.remove("hidden");
                    HELPERS.showAuthenticatedContent();
                } else {
                    document.querySelector(".navbar.--guest")?.classList.remove("hidden");
                    HELPERS.showGuestContent();
                }
                break;
        }
    },

    showGuestContent: () => {
        const className = "--guest-content";
        document.querySelectorAll(`.${className}`).forEach(element => element.classList.remove(className));
    },

    showAuthenticatedContent: () => {
        const className = "--authenticated-content";
        document.querySelectorAll(`.${className}`).forEach(element => element.classList.remove(className));
    },
};

document.addEventListener("DOMContentLoaded", APP.init);
