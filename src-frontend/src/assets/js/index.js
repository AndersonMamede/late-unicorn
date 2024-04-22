function getProjectHTML(project) {
    const template = document.querySelector("#project_card_template").innerHTML;

    const data = {
        ...project,
        url: `/project/?q=${project.project_id}&n=${project.name}`,
        categories: project.project_category.map((category) => `#${category.category.name}`).join(" "),
        description: project.description.length > 130 ? `${project.description.slice(0, 130)}...` : project.description,
        name_first_letter: project.name[0].toUpperCase(),
    };

    return HELPERS.parseTemplate(template, data);
}

async function renderProjectList() {
    const projects = await DATABASE.getPublishedProjects();
    document.querySelector("#project-list").innerHTML = projects.map(getProjectHTML).join("");
}

APP.onReady(async () => {
    try {
        await renderProjectList();
    } catch (error) {
        HELPERS.showFatalError(error.message);
    }
});
