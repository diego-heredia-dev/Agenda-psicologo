const supabaseUrl = "https://migcihzdwmknwnpbrrhy.supabase.co";
const supabaseKey = "sb_publishable_T40d5CvGLsTftQUlmmwgIA_8fcu3kIc";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

async function testConnection() {

    const { data, error } = await supabaseClient
        .from("patients")
        .select("*")
        .eq("is_deleted", false);
    console.log("Supabase conexión:", data, error);
}

testConnection();

let calendar
let currentEvent = null;
let patients = [];
let selectedPatientDni = null;

document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendar');

    await loadPatients();

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        
        selectable: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "23:00:00",
        allDaySlot: false,
        height: "auto",
        nowIndicator: true,
        
        //abre formulario de nueva cita
        dateClick: function(info) {
            const clickedDate = info.date;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (clickedDate < today) {
                showToast("No se puede crear citas en fechas pasadas");
                return;
            }

            const year = clickedDate.getFullYear();
            const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
            const day = String(clickedDate.getDate()).padStart(2, '0');

            const dateOnly = `${year}-${month}-${day}`;

            document.getElementById("appointment-date").value = dateOnly;
            document.getElementById("appointment-start").value = "";
            document.getElementById("appointment-end").value = "";

            openForm();
        },

        //muestra info de la cita cuando se da click sobre ella
        eventClick: function(info) {
            const event = info.event;

            currentEvent = event;

            const start = event.start;
            const end = event.end;

            const date = start.toISOString().split("T")[0];
            const startTime = start.toTimeString().slice(0, 5);
            const endTime = end.toTimeString().slice(0, 5);

            const name = event.extendedProps.name;
            const lastname = event.extendedProps.lastname;

            selectedPatientDni = event.extendedProps.patientDNI;

            document.getElementById("patient-name").value = name;
            document.getElementById("patient-lastname").value = lastname;
            document.getElementById("patient-description").value = event.extendedProps.description;
            document.getElementById("patient-phone").value = event.extendedProps.phone;
            document.getElementById("patient-email").value = event.extendedProps.email;
            document.getElementById("appointment-date").value = date;
            document.getElementById("appointment-start").value = startTime;
            document.getElementById("appointment-end").value = endTime;

            openForm();
        }
    });

    calendar.render();

    await loadAppointments();

    //esto es para cerrar el overlay cuando se hace click en lugar diferente de new-appointment
    document.querySelector('.new-appointment__overlay').addEventListener("click", function(e) {
        if (e.target.classList.contains('new-appointment__overlay')) {
            closeForm();
        }
    });

    document.getElementById("appointment-date").min = new Date().toISOString().split("T")[0];
});

function openForm() {
    if(!currentEvent) {
        selectedPatientDni = null;
    }
    document.getElementById("patient-suggestions").innerHTML = "";

    document.querySelector(".new-appointment__title").textContent = 
    currentEvent ? "Editar cita" : "Registrar nueva cita";

    const deleteBtn = document.querySelector(".delete-button");
    if(deleteBtn) {
        deleteBtn.style.display = currentEvent ? "block" : "none";
    }

    document.querySelector('.new-appointment__overlay').style.display = "flex";
}

function closeForm() {
    document.querySelector('.new-appointment__overlay').style.display = "none";
    document.querySelector('.new-appointment').reset();

    currentEvent = null;
}

function openPatientForm() {
    document.getElementById("patient-modal").style.display = "flex";
}

function closePatientForm() {
    document.querySelector(".patient-form").reset();
    document.getElementById("patient-modal").style.display = "none";
}

async function saveAppointment() {
    const name = document.getElementById("patient-name").value;
    const lastname = document.getElementById("patient-lastname").value;
    const phone = document.getElementById("patient-phone").value;
    const email = document.getElementById("patient-email").value;
    const description = document.getElementById("patient-description").value;
    const date = document.getElementById("appointment-date").value;
    const start = document.getElementById("appointment-start").value;
    const end = document.getElementById("appointment-end").value;

    if (!name || !lastname || !phone || !email || !date || !start || !end) {
        showToast("Por favor completar todos los campos obligatorios");
        return;
    }

    const startDateTime = new Date(date + "T" + start);
    const endDateTime = new Date(date + "T" + end);

    const now = new Date();
    if (startDateTime < now) {
        showToast("No se puede registrar citas en fechas pasadas");
        return;
    }

    if (startDateTime >= endDateTime) {
        showToast("La fecha de inicio debe ser menor que la fecha de fin");
        return;
    }

    if (!selectedPatientDni) {
        showToast("Debe seleccionar un paciente registrado");
        return;
    }

    const events = calendar.getEvents();

    for (let existingEvent of events) {

        if (currentEvent && existingEvent.id === currentEvent.id) {
            continue;
        }

        const existingStart = existingEvent.start;
        const existingEnd = existingEvent.end;

        if (startDateTime < existingEnd && endDateTime > existingStart) {
            showToast("La cita se superpone con otra");
            return;
        }
    }

    let event;

    if (currentEvent) {
        currentEvent.setProp("title", name + " " + lastname);

        currentEvent.setStart(startDateTime);
        currentEvent.setEnd(endDateTime);

        currentEvent.setExtendedProp("patientDNI", selectedPatientDni);
        currentEvent.setExtendedProp("name", name);
        currentEvent.setExtendedProp("lastname", lastname);
        currentEvent.setExtendedProp("phone", phone);
        currentEvent.setExtendedProp("email", email);
        currentEvent.setExtendedProp("description", description);
        currentEvent.setExtendedProp("notified", false);

        await supabaseClient
            .from("appointments")
            .update({
                patient_dni: selectedPatientDni,
                description: description,
                start_time: startDateTime,
                end_time: endDateTime
            })
            .eq("id", currentEvent.id);

        event = currentEvent;
        currentEvent = null;
    } 
    else {
        const { data, error } = await supabaseClient
            .from("appointments")
            .insert({
                patient_dni: selectedPatientDni,
                description: description,
                start_time: startDateTime,
                end_time: endDateTime,
                is_deleted: false
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            showToast("Error al guardar cita");
            return;
        }

        event = calendar.addEvent({
            id: data.id, 
            title: name + " " + lastname,
            start: startDateTime,
            end: endDateTime,
            extendedProps: {
                patientDNI: selectedPatientDni,
                name,
                lastname,
                phone,
                email,
                description
            }
        });
    }

    scheduleReminder(event);

    document.querySelector('.new-appointment').reset();

    showToast("Cita guardada correctamente", "success");
    closeForm();
}

async function savePatient() {

    const name = document.getElementById("patient-new-name").value;
    const lastname = document.getElementById("patient-new-lastname").value;
    const dni = document.getElementById("patient-new-dni").value;
    const phone = document.getElementById("patient-new-phone").value;
    const email = document.getElementById("patient-new-email").value;

    if (!name || !lastname || !dni) {
        showToast("Nombre, apellido y DNI son obligatorios");
        return;
    }

    const { error } = await supabaseClient
        .from("patients")
        .insert({
            dni: dni,
            name: name,
            lastname: lastname,
            phone: phone,
            email: email,
            is_deleted: false
        });

    if (error) {
        showToast("Error al registrar paciente");
        console.error(error);
        return;
    }

    showToast("Paciente registrado", "success");

    await loadPatients();

    closePatientForm();
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

    patients = data;
}

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

function scheduleReminder(event) {
    const start = event.start;
    const reminderTime = new Date(start.getTime() - 1 * 60000);
    const now = new Date();

    const delay = reminderTime - now;

    if (delay <= 0) {
        return;
    }

    //setTimeout(..., delay) basicamente dice:
    //Espera una cantidad de tiempo (delay) y luego ejecuta lo que está adentro
    //Lo que esta adentro es ...
    setTimeout(() => {
        showReminder(`Paciente: ${event.title}. La cita comienza en 15 minutos.`);
    }, delay);
}

function showReminder(message) {
    const popup = document.getElementById("reminder-popup");
    const text = document.getElementById("reminder-message");

    text.textContent = message;
    popup.classList.remove("hidden");
}

function closeReminder() {
    document.getElementById("reminder-popup").classList.add("hidden");
}

function searchPatients() {
    selectedPatientDni = null;

    const input = document.getElementById("patient-name").value.toLowerCase();
    const suggestions = document.getElementById("patient-suggestions");

    suggestions.innerHTML = "";

    if (!input) return;

    const matches = patients.filter(p =>
        p.name.toLowerCase().startsWith(input)
    );

    matches.forEach(patient => {

        const div = document.createElement("div");
        div.classList.add("patient-suggestion");

        div.textContent = `${patient.name} ${patient.lastname}`;

        div.onclick = () => selectPatient(patient);

        suggestions.appendChild(div);
    });
}

function selectPatient(patient) {

    document.getElementById("patient-name").value = patient.name;
    document.getElementById("patient-lastname").value = patient.lastname;
    document.getElementById("patient-phone").value = patient.phone || "";
    document.getElementById("patient-email").value = patient.email || "";

    selectedPatientDni = patient.dni;

    document.getElementById("patient-suggestions").innerHTML = "";
}

async function deletePatient(dni) {

    await supabaseClient
        .from("patients")
        .update({ is_deleted: true })
        .eq("dni", dni);

    showToast("Paciente eliminado", "success");

    await loadPatients();
}

async function loadAppointments() {

    const { data, error } = await supabaseClient
        .from("appointments")
        .select(`
            *,
            patients(name, lastname, phone, email)
        `)
        .eq("is_deleted", false);

    if (error) {
        console.error(error);
        return;
    }

    calendar.removeAllEvents();

    data.forEach(app => {

        calendar.addEvent({
            id: app.id,
            title: `${app.patients?.name || ""} ${app.patients?.lastname || ""}`,
            start: app.start_time,
            end: app.end_time,
            extendedProps: {
                patientDNI: app.patient_dni,
                name: app.patients?.name,
                lastname: app.patients?.lastname,
                phone: app.patients?.phone,
                email: app.patients?.email,
                description: app.description
            }
        });

    });
}

async function deleteAppointment() {

    if (!currentEvent) return;

    const confirmDelete = confirm("¿Seguro que quieres eliminar esta cita?");
    if (!confirmDelete) return;

    const id = currentEvent.id;

    const { error } = await supabaseClient
        .from("appointments")
        .update({ is_deleted: true })
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Error al eliminar cita");
        return;
    }

    // eliminar del calendario
    currentEvent.remove();

    showToast("Cita eliminada", "success");

    closeForm();
}