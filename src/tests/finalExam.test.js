import { describe, test, expect } from "vitest";

import {
    isPastDate,
    isInvalidRange,
    hasAppointmentConflict,
    shouldRestorePatient,
    shouldScheduleReminder,
    searchPatientsByName
} from "../services/appointmentService";

describe("appointmentService.js", () => {
    test("shouldRestorePacient_DeletedPacient_ReturnTrue", () => {
        //Arrange
        const pacient = {
            dni: "1234",
            is_deleted: true
        }

        //Act
        const result = shouldRestorePatient(pacient);

        //Assert
        expect(result).toBe(true);
    });

    test("shouldScheduleReminder_NegativeDelay_ReturnFalse", () => {
        //Arrange
        const delay = -1000;

        //Act
        const result = shouldScheduleReminder(delay);
        
        //Assert
        expect(result).toBe(false);
    });

    test("isDuplicatePatientDNI_ExistingDNI_ReturnsTrue", () => {
        //Arrange
        const dni = "123";

        const patients = 
        [
            {
                dni: "111"
            },
            {
                dni: "222"
            }
        ];

        //Act
        const result = isDuplicatePatientDNI(dni, patients);

        //Assert
        expect(result).toBe(true);
    });
})