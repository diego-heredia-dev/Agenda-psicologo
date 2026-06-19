import { describe, test, expect } from "vitest";

import {
    isPastDate,
    isInvalidRange,
    hasAppointmentConflict,
    shouldRestorePatient
} from "../services/appointmentService";

describe("appointmentService.js", () => {
    test("shouldRestorePacient_DeletedPacient_ReturnTrue", () => {
        //Arrange
        const pacient = {
            dni: "1234",
            is_deleted: true
        }

        //Act
        const result = shoudlRestorePacient(pacient);

        //Assert
        expect(result).toBe(true);
    });
})