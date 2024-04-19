APP.onReady(async () => {
    // dashboard should be accessible only to authenticated users
    if (!await HELPERS.isUserAuthenticated()) {
        window.location.href = "/login/";
        return;
    }
});
