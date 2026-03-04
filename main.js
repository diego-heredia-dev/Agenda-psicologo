let calendar

document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        selectable: true,
        slotMinTime: "08:00:00",
        slotMaxTime: "20:00:00",
        allDaySlot: false,

        eventClick: function(info) {
            const event = info.event;

            const title = event.title;
            const start = event.start;
            const end = event.end;
            const description = event.extendedProps.description;

            alert(
                "Paciente: " + title + "\n" +
                "Inicio: " + start.toLocaleString() + "\n" +
                "Fin: " + end.toLocaleString() + "\n" +
                "Descripción: " + description
            );
        }
    });

    calendar.render();
});

function openForm() {
    document.querySelector('.new-appointment__overlay').style.display = "flex";

}

function closeForm() {
    document.querySelector('.new-appointment__overlay').style.display = "none";
    document.querySelector('.new-appointment').reset();
}

document.querySelector('.new-appointment__overlay').addEventListener("click", function(e) {
    if (e.target.classList.contains('new-appointment__overlay')) {
        closeForm();
    }
})

function saveAppointment() {
    const name = document.getElementById("patient-name").value;
    const lastname = document.getElementById("patient-lastname").value;
    const description = document.getElementById("patient-description").value;
    const start = document.getElementById("appointment-start").value;
    const end = document.getElementById("appointment-end").value;

    if (!name || !lastname || !start || !end) {
        alert("Por favor completar todos los campos obligatorios");
        return;
    }

    if (new Date(start) >= new Date(end)) {
        alert("La feha de inicio debe ser menor que la fecha de fin");
        return;
    }

    calendar.addEvent({
        title: name + " " + lastname,
        start: start,
        end: end,
        extendedProps: {
            description: description
        }
    });

    document.querySelector('.new-appointment').reset();

    closeForm();
}