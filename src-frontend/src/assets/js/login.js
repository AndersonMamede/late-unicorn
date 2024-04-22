APP.onReady(async () => {
    // just redirect to dashboard if user is already authenticated
    if (await HELPERS.isUserAuthenticated()) {
        window.location.href = "/dashboard/";
        return;
    }
});
