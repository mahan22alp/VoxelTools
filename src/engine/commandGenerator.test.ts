import {describe,expect,it} from "vitest";
import {naturalCommand} from "./commandGenerator";

describe("natural command generator",()=>{
  it("generates simple offline commands",()=>{
    expect(naturalCommand("weather rain","1.21.11")).toBe("/weather rain");
    expect(naturalCommand("set time to night","1.21.11")).toBe("/time set night");
    expect(naturalCommand("tp @p 0 64 0","1.21.11")).toBe("/tp @p 0 64 0");
  });

  it("rejects a command before its introduction",()=>{
    expect(naturalCommand("/waypoint list","1.21.5")).toContain("not available");
    expect(naturalCommand("/waypoint list","1.21.6")).toBe("/waypoint list");
  });
});