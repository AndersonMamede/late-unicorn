function getProjectHTML(project) {
    const template = document.querySelector("#project_card_template").innerHTML;

    const data = {
        ...project,
        url: `/manage-project/?q=${project.project_id}&n=${project.name}`,
        cover_attr_src: "src",
        cover_url: "/temp/img9.png", // @TODO
    };

    return HELPERS.parseTemplate(template, data);
}

async function renderProjectList() {
    const projects = await DATABASE.getCurrentUserProjects();
    document.querySelector("#project-list").innerHTML = projects.map(getProjectHTML).join("");
}

APP.onReady(async () => {
    // it should be accessible only to authenticated users
    if (!await HELPERS.isUserAuthenticated()) {
        window.location.href = "/login/";
        return;
    }

    try {
        await renderProjectList();
    } catch (error) {
        HELPERS.showFatalError(error.message);
    }
});
