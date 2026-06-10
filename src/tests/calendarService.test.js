import { describe, test, expect } from "vitest";
import {
    isPastDate,
    isInvalidRange,
    hasAppointmentConflict
} from "../services/appointmentService";

describe("appointmentService.js", () => {

    test("isPastDate_PastDate_ReturnsTrue", () => {

        // Arrange
        const pastDate = new Date("2026-01-01");
        const now = new Date("2026-01-02");

        // Act
        const result = isPastDate(pastDate, now);

        // Assert
        expect(result).toBe(true);

    });

    test("isInvalidRange_StartAfterEnd_ReturnsTrue", () => {

        // Arrange
        const start = new Date("2026-01-01T12:00");
        const end = new Date("2026-01-01T10:00");

        // Act
        const result = isInvalidRange(start, end);

        // Assert
        expect(result).toBe(true);

    });

    test("hasAppointmentConflict_OverlappingAppointment_ReturnsTrue", () => {

        // Arrange
        const events = [
            {
                id: 1,
                start: new Date("2026-01-01T10:00"),
                end: new Date("2026-01-01T11:00")
            }
        ];

        const start = new Date("2026-01-01T10:30");
        const end = new Date("2026-01-01T11:30");

        // Act
        const result = hasAppointmentConflict(start, end, events
        );

        // Assert
        expect(result).toBe(true);

    });

    test("hasAppointmentConflict_ValidAppointment_ReturnsFalse", () => {

        // Arrange
        const events = [
            {
                id: 1,
                start: new Date("2026-01-01T10:00"),
                end: new Date("2026-01-01T11:00")
            }
        ];

        const start = new Date("2026-01-01T12:00");
        const end = new Date("2026-01-01T13:00");

        // Act
        const result = hasAppointmentConflict(start, end, events
        );

        // Assert
        expect(result).toBe(false);

    });
});