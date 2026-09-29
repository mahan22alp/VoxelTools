import {describe,expect,it} from "vitest";
import {minecraftCommands} from "./commands";
import {minecraftVersions,versionOptions} from "./versions";

describe("command catalog integrity",()=>{
  it("contains unique command names",()=>{
    const names=minecraftCommands.map(c=>c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps every introduced version inside the supported version registry",()=>{
    for(const command of minecraftCommands){
      if(command.introduced) expect(minecraftVersions).toContain(command.introduced);
      if(command.removed) expect(minecraftVersions).toContain(command.removed);
    }
  });

  it("exposes every supported version in the selector",()=>{
    expect(versionOptions).toEqual(["All versions",...minecraftVersions.slice().reverse()]);
  });

  it("contains the current 26.x command additions",()=>{
    expect(minecraftCommands.find(c=>c.name==="swing")?.introduced).toBe("26.1");
    expect(minecraftCommands.find(c=>c.name==="unpublish")?.introduced).toBe("26.2");
    expect(minecraftCommands.find(c=>c.name==="compute")?.introduced).toBe("26.3");
    expect(minecraftCommands.find(c=>c.name==="posteffect")?.introduced).toBe("26.3");
  });
});
