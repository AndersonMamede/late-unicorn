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
        // redirect to the previous page, or the dashboard if there is no previous page
        const redirectTo = document.referrer || `${window.location.origin}/dashboard/`;

        const { error } = await APP.supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo },
        });

        if (error) {
            HELPERS.showFatalError(error.message);
            return false;
        }

        return true;
    },

    signOut: async () => {
        const { error } = await APP.supabaseClient.auth.signOut({ scope: "local" });

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
            case "SIGNED_OUT":
                window.location.reload();
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

    parseTemplate: (template, data) => {
        // Replace all the placeholders with the values from the data object.
        // Placeholders are in the format {key} and the key must match the key in the data object, otherwise
        // the placeholder is not replaced
        return template.replace(/\{([^}]+)\}/g, (placeholder, key) => {
            return key in data ? HELPERS.escapeHTML(data[key]) : placeholder;
        });
    },

    escapeHTML: (value) => {
        if (typeof value !== "string") {
            return value;
        }

        // replace all the special characters with their HTML entities to prevent XSS attacks
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    formatNumber: (number, addDecimals) => {
        // return a number in format 123.456.789, or 123.456.789,00 if it has decimals different than 0 or addDecimals is true
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: addDecimals ? 2 : 0,
            maximumFractionDigits: addDecimals ? 2 : 0,
        }).format(number);
    },
};

const DATABASE = {
    getAllCategories: async() => {
        const { data, error } = await APP.supabaseClient
            .from("category")
            .select("category_id, name")
            .order("name", { ascending: true });
        
        if (error) {
            console.error(error);
            throw new Error(error.message);
        }
        
        return data;
    },

    getPublishedProjects: async() => {
        const { data, error } = await APP.supabaseClient
            .from("project")
            .select("project_id, name, description, project_category(category(name))")
            .eq("published", true)
            .order("project_id", { ascending: false });
        
        if (error) {
            console.error(error);
            throw new Error(error.message);
        }
        
        return data;
    },

    getPublishedProjectById: async (projectId) => {
        const { data, error } = await APP.supabaseClient
            .from("project")
            .select("*, project_category(category(name)), project_speculation(sentence)")
            .eq("project_id", projectId)
            .eq("published", true)
            .order("created_at", { ascending: true, foreignTable: "project_speculation" })
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error("Project not found");
        }

        return data;
    },

    getCurrentUserProjects: async () => {
        const user = await HELPERS.getUser();

        if (!user) {
            return [];
        }

        const { data, error } = await APP.supabaseClient
            .from("project")
            .select("project_id, name")
            .eq("user_id", user.id)
            .order("name", { ascending: true });
        
        if (error) {
            console.error(error);
            throw new Error(error.message);
        }
        
        return data;
    },

    getCurrentUserProjectById: async (projectId) => {
        const user = await HELPERS.getUser();

        if (!user) {
            throw new Error("You must be authenticated to access this page.");
        }

        const { data, error } = await APP.supabaseClient
            .from("project")
            .select("*, project_category(category(category_id, name))")
            .eq("user_id", user.id)
            .eq("project_id", projectId)
            .maybeSingle();
        
        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error("Project not found");
        }

        return data;
    },

    insertProject: async (projectData, categoryIds) => {
        const user = await HELPERS.getUser();

        if (!user) {
            throw new Error("You must be authenticated to save a project.");
        }

        const project = { ...projectData, user_id: user.id };

        const { data: savedProject, error } = await APP.supabaseClient
            .from("project")
            .insert(project)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (categoryIds && categoryIds.length) {
            await DATABASE.saveProjectCategories(savedProject.project_id, categoryIds);
        }

        return savedProject;
    },

    updateProject: async (projectId, projectData, categoryIds) => {
        const user = await HELPERS.getUser();

        if (!user) {
            throw new Error("You must be authenticated to save a project.");
        }

        const project = { ...projectData };

        const { data: updatedProject, error } = await APP.supabaseClient
            .from("project")
            .update(project)
            .eq("project_id", projectId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (categoryIds && categoryIds.length) {
            await DATABASE.saveProjectCategories(updatedProject.project_id, categoryIds);
        }

        return updatedProject;
    },

    saveProjectCategories: async (projectId, categoryIds) => {
        const user = await HELPERS.getUser();

        if (!user) {
            throw new Error("You must be authenticated to save project categories.");
        }

        const projectCategories = categoryIds.map(categoryId => ({
            user_id: user.id,
            project_id: projectId,
            category_id: categoryId,
        }));

        const { error: errorDeletingCategories } = await APP.supabaseClient
            .from("project_category")
            .delete()
            .eq("project_id", projectId)
            .select();

        if (errorDeletingCategories) {
            throw new Error("Error: categories could not be saved.");
        }

        const { error: errorSavingCategories } = await APP.supabaseClient
            .from("project_category")
            .insert(projectCategories);

        if (errorSavingCategories) {
            throw new Error("Error: categories could not be saved.");
        }
    },
};

document.addEventListener("DOMContentLoaded", APP.init);
