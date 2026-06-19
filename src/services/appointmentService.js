export function isPastDate(startDateTime, now = new Date()) {
    return startDateTime < now;
}

export function isInvalidRange(startDateTime, endDateTime) {
    return startDateTime >= endDateTime;
}

export function shouldRestorePatient(pacient) {
    return pacient.is_deleted === true;
}

export function hasAppointmentConflict(
    startDateTime,
    endDateTime,
    events,
    currentEventId = null
) {

    return events.some(event => {

        if (currentEventId && event.id === currentEventId) {
            return false;
        }

        const existingStart = event.start;
        const existingEnd = event.end;

        return (
            startDateTime < existingEnd &&
            endDateTime > existingStart
        );
    });
}

export function isPatientDataValid(
    name,
    lastname,
    dni
) {
    return !!(name && lastname && dni);
}

export function isPatientEditValid(
    name,
    lastname,
    phone,
    email
) {
    return !!(name && lastname && phone && email);
}

export function searchPatientsByName(
    patients,
    input
) {

    if (!input) {
        return [];
    }

    return patients.filter(p =>
        p.name.toLowerCase()
            .startsWith(input.toLowerCase())
    );
}

export function calculateReminderDelay(
    appointmentStart,
    now = new Date()
) {

    const reminderTime = new Date(
        appointmentStart.getTime() - 15 * 60000
    );

    return reminderTime - now;
}

export function mapAppointmentToCalendarEvent(app) {

    return {
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
    };
}