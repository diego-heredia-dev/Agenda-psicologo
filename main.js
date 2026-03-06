let calendar
let currentEvent = null;

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    //Solicitar permiso para notificaciones
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    //esto es para cerrar el overlay cuando se hace click en lugar diferente de new-appointment
    document.querySelector('.new-appointment__overlay').addEventListener("click", function(e) {
        if (e.target.classList.contains('new-appointment__overlay')) {
            closeForm();
        }
    });

    document.getElementById("appointment-date").min = new Date().toISOString().split("T")[0];

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
        scrollTime: true,
        
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

            document.getElementById("patient-name").value = name;
            document.getElementById("patient-lastname").value = lastname;
            document.getElementById("patient-description").value = event.extendedProps.description;

            document.getElementById("appointment-date").value = date;
            document.getElementById("appointment-start").value = startTime;
            document.getElementById("appointment-end").value = endTime;

            openForm();
        }
    });

    calendar.render();
});

function openForm() {
    document.querySelector(".new-appointment__title").textContent = 
    currentEvent ? "Editar cita" : "Registrar nueva cita";

    document.querySelector('.new-appointment__overlay').style.display = "flex";
}

function closeForm() {
    document.querySelector('.new-appointment__overlay').style.display = "none";
    document.querySelector('.new-appointment').reset();

    currentEvent = null;
}

function saveAppointment() {
    const name = document.getElementById("patient-name").value;
    const lastname = document.getElementById("patient-lastname").value;
    const description = document.getElementById("patient-description").value;
    const date = document.getElementById("appointment-date").value;
    const start = document.getElementById("appointment-start").value;
    const end = document.getElementById("appointment-end").value;

    if (!name || !lastname || !date || !start || !end) {
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

    const events = calendar.getEvents();

    for (let event of events) {

        if (event === currentEvent) {
            continue;
        }

        const existingStart = event.start;
        const existingEnd = event.end;

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

        currentEvent.setExtendedProp("name", name);
        currentEvent.setExtendedProp("lastname", lastname);
        currentEvent.setExtendedProp("description", description);
        currentEvent.setExtendedProp("notified", false);

        event = currentEvent;
        currentEvent = null;
    } 
    else {
        event = calendar.addEvent({
            title: name + " " + lastname,
            start: startDateTime,
            end: endDateTime,
            extendedProps: {
                name: name,
                lastname: lastname,
                description: description,
                notified: false
            }
        });
    }

    scheduleReminder(event);

    document.querySelector('.new-appointment').reset();

    showToast("Cita guardada correctamente", "success");
    closeForm();
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

