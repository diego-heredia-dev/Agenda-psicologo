const supabaseUrl = "https://migcihzdwmknwnpbrrhy.supabase.co";
const supabaseKey = "sb_publishable_T40d5CvGLsTftQUlmmwgIA_8fcu3kIc";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

let currentPatientDni = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPatients();

    document.getElementById("edit-modal").addEventListener("click", function(e) {
        if (e.target.id === "edit-modal") {
            closeEditForm();
        }
    });
});

function showToast(message, type = "error") {
    const container =  document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast", type);

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");

    }, 10);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function loadPatients() {
    const { data, error } = await supabaseClient
        .from("patients")
        .select("*")
        .eq("is_deleted", false);

    if (error) {
        console.error(error);
        return;
    }

    const tbody = document.getElementById("patients-body");
    tbody.innerHTML = "";

    data.forEach(p => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.dni}</td>
            <td>${p.name}</td>
            <td>${p.lastname}</td>
            <td>${p.phone || ""}</td>
            <td>${p.email || ""}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editPatient('${p.dni}')">Editar</button>
                <button class="action-btn delete-btn" onclick="deletePatient('${p.dni}')">Eliminar</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

async function editPatient(dni) {

    const { data, error } = await supabaseClient
        .from("patients")
        .select("*")
        .eq("dni", dni)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    currentPatientDni = dni;

    document.getElementById("edit-name").value = data.name;
    document.getElementById("edit-lastname").value = data.lastname;
    document.getElementById("edit-phone").value = data.phone || "";
    document.getElementById("edit-email").value = data.email || "";

    document.getElementById("edit-modal").style.display = "flex";
}

async function updatePatient() {

    const name = document.getElementById("edit-name").value;
    const lastname = document.getElementById("edit-lastname").value;
    const phone = document.getElementById("edit-phone").value;
    const email = document.getElementById("edit-email").value;

    if (!name || !lastname || !phone || !email) {
        showToast("Nombre y apellido son obligatorios");
        return;
    }

    const { error } = await supabaseClient
        .from("patients")
        .update({
            name,
            lastname,
            phone,
            email
        })
        .eq("dni", currentPatientDni);

    if (error) {
        console.error(error);
        showToast("Error al actualizar");
        return;
    }

    closeEditForm();
    loadPatients();
}

async function deletePatient(dni) {

    const confirmDelete = confirm("¿Eliminar paciente?");
    if (!confirmDelete) return;

    const { error } = await supabaseClient
        .from("patients")
        .update({ is_deleted: true })
        .eq("dni", dni);

    if (error) {
        console.error(error);
        showToast("Error al eliminar");
        return;
    }

    loadPatients();
}

function closeEditForm() {
    document.getElementById("edit-modal").style.display = "none";
    document.querySelector(".patient-form").reset();
    currentPatientDni = null;
}

