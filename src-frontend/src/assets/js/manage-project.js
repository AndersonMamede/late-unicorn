function showProjectData(project) {
    Object.keys(project).forEach(key => {
        const element = document.querySelector(`#${key}`);
        if (key === "published") {
            element.checked = project[key];
        } else if (element) {
            element.value = project[key] || "";
        }
    });

    project.project_category.forEach(({ category }) => {
        const checkbox = document.querySelector(`#category_dropdown input[data-category_id="${category.category_id}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    syncSelectedCategoriesWithChips();

    document.title = `#${project.project_id} - Edit`;
    document.querySelector("#page_title").innerText = "Edit project";
    document.querySelector("#save").innerText = "Update project";
}

function renderCategories(categories) {
    const categoryitemTemplate = document.querySelector("#category_dropdown_item_template").innerHTML;

    document.querySelector("#category_dropdown").innerHTML = categories.map(category => {
        return HELPERS.parseTemplate(categoryitemTemplate, category);
    }).join("");

    document.querySelectorAll(".category_dropdown-item").forEach(item => {
        item.addEventListener("change", syncSelectedCategoriesWithChips);
    });
}

function getSelectedCategories() {
    const selectedCheckboxes = document.querySelectorAll("#category_dropdown input[type=checkbox]:checked");

    return Array.from(selectedCheckboxes).map(item => ({
        category_id: item.dataset.category_id,
        name: item.dataset.name,
    }));
}

function syncSelectedCategoriesWithChips() {
    const categoryChipTemplate = document.querySelector("#category_chip_template").innerHTML;

    document.querySelector("#category_chips").innerHTML = getSelectedCategories().map(category => {
        return HELPERS.parseTemplate(categoryChipTemplate, category);
    }).join("");
}

function removeCategory(categoryId) {
    const checkbox = document.querySelector(`#category_dropdown input[data-category_id="${categoryId}"]`);
    checkbox.checked = false;
    syncSelectedCategoriesWithChips();
}

function hideSuccessMessage() {
    document.querySelector("#toast-success").classList.add("hidden");
}

function handleInputAndAcceptOnlyPositiveIntegers(field) {
    const value = field.value;
    field.value = value.replace(/[^0-9]/g, "");
}

function collectProjectData() {
    const lifetimeInMonths = document.querySelector("#lifetime_in_months").value.trim();
    const totalUsers = document.querySelector("#total_users").value.trim();
    const totalRevenue = document.querySelector("#total_revenue").value.trim();

    return {
        published: document.querySelector("#published").checked,
        name: document.querySelector("#name").value.trim(),
        founders: document.querySelector("#founders").value.trim(),
        lifetime_in_months: lifetimeInMonths.length ? parseInt(lifetimeInMonths, 10) : 0,
        total_users: totalUsers.length ? parseInt(totalUsers, 10) : 0,
        total_revenue: totalRevenue.length ? parseInt(totalRevenue, 10) : 0,
        description: document.querySelector("#description").value.trim(),
        features: document.querySelector("#features").value.trim(),
        technologies: document.querySelector("#technologies").value.trim(),
        failures: document.querySelector("#failures").value.trim(),
        learnings: document.querySelector("#learnings").value.trim(),
    };
}

function validateProjectData(data) {
    if (data.name.length < 3) {
        throw new Error("Error: field 'Project name' must be at least 3 characters long.");
    }

    if (data.description.length < 50) {
        throw new Error("Error: field 'Project description' must be at least 50 characters long.");
    }

    if (data.lifetime_in_months > 99999) {
        throw new Error("Error: field 'Lifespan (in months)' cannot be greater than 99999.");
    }

    if (data.total_users > 999999999999) {
        throw new Error("Error: field 'Total users' cannot be greater than 999,999,999,999.");
    }

    if (data.total_revenue > 999999999999) {
        throw new Error("Error: field 'Total revenue' cannot be greater than 999,999,999,999.");
    }
}

async function saveProject() {
    const saveButton = document.querySelector("#save");
    const originalSaveButtonText = saveButton.innerText;

    saveButton.disabled = true;
    saveButton.innerText = "Saving...";

    try {
        const projectId = document.querySelector("#project_id").value || null;
        const projectData = collectProjectData();
        const categoryIds = getSelectedCategories().map((category) => category.category_id);
        validateProjectData(projectData);

        let project;
        if (projectId) {
            project = await DATABASE.updateProject(projectId, projectData, categoryIds);
        } else {
            project = await DATABASE.insertProject(projectData, categoryIds);
        }

        window.history.replaceState(null, document.title, `/manage-project/?q=${project.project_id}`);

        // scroll to the top of the page so the user can see the success message
        document.querySelector("#toast-success").classList.remove("hidden");
        window.scrollTo(0, 0);

        document.querySelector("#project_id").value = project.project_id;
        document.querySelector("#page_title").innerText = "Edit project";
        document.querySelector("#save").innerText = "Update project";

        setTimeout(hideSuccessMessage, 5000);
    } catch (error) {
        saveButton.innerText = originalSaveButtonText;
        alert(error.message);
    } finally {
        saveButton.disabled = false;
    }
}

APP.onReady(async () => {
    // it should be accessible only to authenticated users
    if (!await HELPERS.isUserAuthenticated()) {
        window.location.href = "/login/";
        return;
    }

    try {
        const categories = await DATABASE.getAllCategories();
        renderCategories(categories);

        const projectId = new URLSearchParams(window.location.search).get("q");
        if (projectId) {
            const project = await DATABASE.getCurrentUserProjectById(projectId);
            showProjectData(project);
        }
    } catch (error) {
        document.querySelector("#project-form-container").innerHTML = `
            <div class="font-heading text-4xl text-white text-center">${error.message}</div>
        `;
    } finally {
        document.querySelector("#project-spinner")?.remove();
        document.querySelector("#project-form-container").classList.remove("hidden");
    }
});
