import { describe, it, expect } from "vitest";
import { mergeCookies, mergeLocalStorage } from "../../src/services/environmentService";

describe("Environment Service - Merging Logic", () => {
  describe("mergeCookies", () => {
    it("should deep merge cookies and overwrite with child values when domain keys match", () => {
      const parentCookies = {
        "example.com/": {
          token: "parent-token",
          theme: "light"
        },
        "example.com/app": {
          session: "parent-session"
        }
      };

      const childCookies = {
        "example.com/": {
          token: "child-token"
        },
        "example.com/app-child": {
          session: "child-session"
        }
      };

      const result = mergeCookies(parentCookies, childCookies);

      expect(result).toEqual({
        "example.com/": {
          token: "child-token",
          theme: "light"
        },
        "example.com/app": {
          session: "parent-session"
        },
        "example.com/app-child": {
          session: "child-session"
        }
      });
    });

    it("should handle empty or null values gracefully", () => {
      expect(mergeCookies(null, undefined)).toEqual({});
      expect(mergeCookies({ "example.com/": { test: "1" } }, null)).toEqual({ "example.com/": { test: "1" } });
    });
  });

  describe("mergeLocalStorage", () => {
    it("should shallow merge local storage objects and child keys should override parent keys", () => {
      const parentLS = {
        theme: "dark",
        sidebar: "open",
        user: { name: "John" }
      };

      const childLS = {
        sidebar: "closed", // Overwrites
        token: "jwt-xyz" // New key
      };

      const result = mergeLocalStorage(parentLS, childLS);

      expect(result).toEqual({
        theme: "dark",
        sidebar: "closed",
        user: { name: "John" },
        token: "jwt-xyz"
      });
    });

    it("should handle empty or null values gracefully", () => {
      expect(mergeLocalStorage(null, undefined)).toEqual({});
      expect(mergeLocalStorage({ theme: "dark" }, null)).toEqual({ theme: "dark" });
    });
  });
});
