import { describe, test, expect } from "vitest";

import {
    isPastDate,
    isInvalidRange,
    hasAppointmentConflict,
    shouldRestorePatient,
    shouldScheduleReminder
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
})