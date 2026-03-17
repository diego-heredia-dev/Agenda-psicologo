const tableBody = document.querySelector("#patients-table tbody");

function loadPatients() {

    tableBody.innerHTML = "";

    patients.forEach(patient => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${patient.dni}</td>
            <td>${patient.name}</td>
            <td>${patient.lastname}</td>
            <td>${patient.phone || ""}</td>
            <td>${patient.email || ""}</td>
            <td class="patient-actions">
                <button onclick="editPatient('${patient.dni}')">Editar</button>
                <button onclick="deletePatient('${patient.dni}')">Eliminar</button>
            </td>
        `;

        tableBody.appendChild(row);

    });

}

document.addEventListener("DOMContentLoaded", loadPatients);

function deletePatient(dni) {

    patients = patients.filter(p => p.dni !== dni);

    loadPatients();
}

function deletePatient(dni) {

    patients = patients.filter(p => p.dni !== dni);

    loadPatients();
}