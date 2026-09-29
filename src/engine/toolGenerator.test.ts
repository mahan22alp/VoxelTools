import {describe,expect,it} from "vitest";
import {generateToolCommand} from "./toolGenerator";

const form={player:"@p",item:"stone",count:"4",mob:"zombie",enchant:"unbreaking",level:"3",effect:"speed",duration:"30",amplifier:"1",x:"0",y:"64",z:"0",x1:"0",y1:"63",z1:"0",x2:"5",y2:"68",z2:"5",block:"stone"};

describe("specialized generators",()=>{
  it("uses version-correct effect syntax",()=>{
    expect(generateToolCommand("effect",form,"1.12.2")).toBe("/effect @p speed 30 1");
    expect(generateToolCommand("effect",form,"1.13.2")).toBe("/effect give @p speed 30 1");
  });
  it("handles fill availability by version",()=>{
    expect(generateToolCommand("fill",form,"1.7.10")).toContain("not available");
    expect(generateToolCommand("fill",form,"1.8.9")).toBe("/fill 0 63 0 5 68 5 stone");
  });
});
