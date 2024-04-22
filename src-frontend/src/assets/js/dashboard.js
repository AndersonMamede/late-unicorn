function getProjectHTML(project) {
    const template = document.querySelector("#project_card_template").innerHTML;

    const data = {
        ...project,
        url: `/manage-project/?q=${project.project_id}&n=${project.name}`,
        name_first_letter: project.name[0].toUpperCase(),
    };

    return HELPERS.parseTemplate(template, data);
}

async function renderProjectList() {
    const projects = await DATABASE.getCurrentUserProjects();

    if (projects.length) {
        document.querySelector("#project-list").innerHTML = projects.map(getProjectHTML).join("");
    } else {
        document.querySelector("#project-list").innerHTML = `
            <div class="w-full mt-20 text-gray-400 text-2xl text-center">You have not created any projects yet.</div>
        `;
    }
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
