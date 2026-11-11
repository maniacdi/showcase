import { beforeEach, describe, expect, it } from "vitest";
import { usePrefsStore } from "./usePrefsStore";

describe("usePrefsStore", () => {
  beforeEach(() => {
    usePrefsStore.setState({ colorScheme: "light", font: "archivo", style: "swiss" });
  });

  it("defaults to light + archivo", () => {
    expect(usePrefsStore.getState().colorScheme).toBe("light");
    expect(usePrefsStore.getState().font).toBe("archivo");
  });

  it("toggleColorScheme flips light/dark", () => {
    usePrefsStore.getState().toggleColorScheme();
    expect(usePrefsStore.getState().colorScheme).toBe("dark");
    usePrefsStore.getState().toggleColorScheme();
    expect(usePrefsStore.getState().colorScheme).toBe("light");
  });

  it("setFont updates the active font", () => {
    usePrefsStore.getState().setFont("fraunces");
    expect(usePrefsStore.getState().font).toBe("fraunces");
  });

  it("defaults to the swiss design style and switches styles", () => {
    expect(usePrefsStore.getState().style).toBe("swiss");
    usePrefsStore.getState().setStyle("brutalism");
    expect(usePrefsStore.getState().style).toBe("brutalism");
  });
});
