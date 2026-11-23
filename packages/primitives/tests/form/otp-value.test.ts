import { describe, expect, it } from "vitest";
import {
    normalizeOtp,
    otpAccepts,
    otpPattern,
    removeOtpCharacter,
    replaceOtp,
} from "../../src/form/otp-value.ts";

// spec/otp-field.md, "Typing"
describe("an OTP field's value", () => {
    it("accepts the characters of its type", () => {
        expect(otpAccepts("4", "numeric")).toBe(true);
        expect(otpAccepts("a", "numeric")).toBe(false);
        expect(otpAccepts("a", "alpha")).toBe(true);
        expect(otpAccepts("4", "alpha")).toBe(false);
        expect(otpAccepts("Z", "alphanumeric")).toBe(true);
        expect(otpAccepts("-", "alphanumeric")).toBe(false);
        expect(otpAccepts("-", "none")).toBe(true);
        expect(otpAccepts(" ", "none")).toBe(false);
        expect(otpAccepts("B", /[A-F0-9]/)).toBe(true);
        expect(otpAccepts("G", /[A-F0-9]/g)).toBe(false);
        expect(otpAccepts("BB", /[A-F0-9]/)).toBe(false);
    });

    it("drops whitespace silently, rejects other characters, and keeps at most length", () => {
        expect(normalizeOtp("12 34", 6, "numeric")).toEqual({
            value: "1234",
            rejected: false,
        });
        expect(normalizeOtp("12-34", 6, "numeric")).toEqual({
            value: "1234",
            rejected: true,
        });
        expect(normalizeOtp("1234567", 6, "numeric")).toEqual({
            value: "123456",
            rejected: true,
        });
    });

    it("replaces from a slot and stays contiguous", () => {
        expect(replaceOtp("12", 2, "3", 6, "numeric")).toBe("123");
        expect(replaceOtp("123", 1, "9", 6, "numeric")).toBe("193");
        expect(replaceOtp("", 0, "987654", 6, "numeric")).toBe("987654");
        expect(replaceOtp("12", 1, "98765", 6, "numeric")).toBe("198765");
        expect(removeOtpCharacter("12345", 4)).toBe("1234");
        expect(removeOtpCharacter("12345", 1)).toBe("1345");
        expect(removeOtpCharacter("12", 5)).toBe("12");
    });

    it("gives the hidden input a complete-code pattern", () => {
        expect(otpPattern("numeric", 6)).toBe("\\d{6}");
        expect(otpPattern("alphanumeric", 4)).toBe("[a-zA-Z0-9]{4}");
        expect(otpPattern(/[a-f]/i, 4)).toBe(".{4}");
    });
});
