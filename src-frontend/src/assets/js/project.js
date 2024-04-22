function renderProjectDetails(project, originalProject) {
    document.title = `#${originalProject.project_id} - ${project.name}`;

    Object.keys(project).forEach((key) => {
        const element = document.querySelector(`[data-${key}]`);
        if (element) {
            element.innerHTML = HELPERS.escapeHTML(project[key] || "-");
        }
    });

    const categoryChipTemplate = document.querySelector("#category_chip_template").innerHTML;
    document.querySelector("#category-list").innerHTML = project.project_category.map((project_category) => {
        const data = { name: `#${project_category.category.name}` };
        return HELPERS.parseTemplate(categoryChipTemplate, data);
    }).join("");

    const speculationTemplate = document.querySelector("#speculation_template").innerHTML;
    document.querySelector("#speculations").innerHTML = project.project_speculation.map((project_speculation) => {
        return HELPERS.parseTemplate(speculationTemplate, project_speculation);
    }).join("");

    if (project.project_speculation?.length) {
        document.querySelector("#speculation-section").classList.remove("hidden");
    }
}

function getNormalizedProject(originalProject) {
    // Deep copy the project object to avoid side effects like modifying the original object
    const project = JSON.parse(JSON.stringify(originalProject));

    project.project_id = `#${project.project_id}`;
    project.total_users = project.total_users ? HELPERS.formatNumber(project.total_users) : 0;
    project.total_revenue = project.total_revenue ? `$ ${HELPERS.formatNumber(project.total_revenue)} USD` : "-";
    project.lifetime = project.lifetime_in_months ? `${project.lifetime_in_months} months` : "-";

    return project;
}

function getParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return { projectId: urlParams.get("q") };
}

APP.onReady(async () => {
    try {
        const { projectId } = getParameters();

        if (!projectId) {
            throw new Error("Project not found");
        }

        const project = await DATABASE.getPublishedProjectById(projectId);
        renderProjectDetails(getNormalizedProject(project), project);
    } catch (error) {
        document.querySelector("#project-details").innerHTML = `
            <div class="font-heading text-4xl text-white text-center">${error.message}</div>
        `;
    } finally {
        document.querySelector("#project-spinner")?.remove();
        document.querySelector("#project-details").classList.remove("hidden");
    }
});
