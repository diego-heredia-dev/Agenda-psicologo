let calendar

document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendar');

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
        slotMaxTime: "20:00:00",
        allDaySlot: false,
        height: "auto",
        
        //abre formulario de nueva cita
        dateClick: function(info) {
            const clickedDate = info.date;

            const year = clickedDate.getFullYear();
            const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
            const day = String(clickedDate.getDate()).padStart(2, '0');

            const dateOnly = `${year}-${month}-${day}`;

            document.getElementById("appointment-date").value = dateOnly;

            openForm();
        },

        //muestra info de la cita cuando se da click sobre ella
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
    const date = document.getElementById("appointment-date").value;
    const start = document.getElementById("appointment-start").value;
    const end = document.getElementById("appointment-end").value;

    if (!name || !lastname || !date || !start || !end) {
        alert("Por favor completar todos los campos obligatorios");
        return;
    }

    const startDateTime = new Date(date + "T" + start);
    const endDateTime = new Date(date + "T" + end);

    if (startDateTime >= endDateTime) {
        alert("La feha de inicio debe ser menor que la fecha de fin");
        return;
    }

    calendar.addEvent({
        title: name + " " + lastname,
        start: startDateTime,
        end: endDateTime,
        extendedProps: {
            description: description
        }
    });

    document.querySelector('.new-appointment').reset();

    closeForm();
}