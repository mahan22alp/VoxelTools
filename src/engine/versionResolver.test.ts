import {describe,expect,it} from "vitest";
import {compareVersions,isCommandAvailable,syntaxFor,versionAtLeast,versionRank} from "./versionResolver";
import {minecraftCommands} from "../data/commands";

describe("version resolver",()=>{
  it("orders the modern 26.x releases after 1.21.x",()=>{
    expect(versionRank("26.3")).toBeGreaterThan(versionRank("1.21.11"));
    expect(compareVersions("26.3","26.1")).toBeGreaterThan(0);
    expect(versionAtLeast("1.21.11","1.21.6")).toBe(true);
  });

  it("filters commands introduced in later releases",()=>{
    const waypoint=minecraftCommands.find(c=>c.name==="waypoint")!;
    expect(isCommandAvailable(waypoint,"1.21.5")).toBe(false);
    expect(isCommandAvailable(waypoint,"1.21.6")).toBe(true);
  });

  it("resolves syntax overrides by selected version",()=>{
    const give=minecraftCommands.find(c=>c.name==="give")!;
    expect(syntaxFor(give,"1.20.4")).toContain("[count]");
    expect(syntaxFor(give,"1.20.5")).toContain("[components]");
  });
});