APP.onReady(async () => {
    // it should be accessible only to authenticated users
    if (!await HELPERS.isUserAuthenticated()) {
        window.location.href = "/login/";
        return;
    }
});
