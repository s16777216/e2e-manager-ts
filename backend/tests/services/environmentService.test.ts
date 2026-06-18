import { describe, it, expect } from "vitest";
import { mergeCookies, mergeLocalStorage } from "../../src/services/environmentService";

describe("Environment Service - Merging Logic", () => {
  describe("mergeCookies", () => {
    it("should merge cookies and overwrite with child values when name, domain, and path match", () => {
      const parentCookies = [
        { name: "token", value: "parent-token", domain: "example.com", path: "/" },
        { name: "session", value: "parent-session", domain: "example.com", path: "/app" },
        { name: "theme", value: "light", domain: "example.com", path: "/" }
      ];

      const childCookies = [
        { name: "token", value: "child-token", domain: "example.com", path: "/" }, // Overwrites
        { name: "session", value: "child-session", domain: "example.com", path: "/app-child" } // Does not overwrite session on path /app due to different path
      ];

      const result = mergeCookies(parentCookies, childCookies);

      expect(result).toHaveLength(4);
      
      // Token should be overridden by child
      const tokenCookie = result.find(c => c.name === "token");
      expect(tokenCookie?.value).toBe("child-token");

      // Theme should be inherited from parent
      const themeCookie = result.find(c => c.name === "theme");
      expect(themeCookie?.value).toBe("light");

      // Session with path /app should be inherited
      const sessionAppCookie = result.find(c => c.name === "session" && c.path === "/app");
      expect(sessionAppCookie?.value).toBe("parent-session");

      // Session with path /app-child should be added
      const sessionChildCookie = result.find(c => c.name === "session" && c.path === "/app-child");
      expect(sessionChildCookie?.value).toBe("child-session");
    });

    it("should handle empty or null values gracefully", () => {
      expect(mergeCookies(null, undefined)).toEqual([]);
      expect(mergeCookies([{ name: "test", value: "1" }], null)).toEqual([{ name: "test", value: "1" }]);
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
