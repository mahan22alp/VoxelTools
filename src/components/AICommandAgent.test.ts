import {describe,expect,it} from "vitest";
import {parseReply} from "./AICommandAgent";

describe("agent reply parsing",()=>{
  it("reads the fenced command from a normal reply",()=>{
    const parsed=parseReply("Here you go:\n```\n/time set night\n```\nShort and sweet.","fallback");
    expect(parsed.command).toBe("/time set night");
    expect(parsed.text).toContain("Here you go:");
  });

  it("recovers the command from a truncated think-only reply",()=>{
    const raw="<think>The user wants night. The right call is /time set night";
    const parsed=parseReply(raw,"fallback");
    expect(parsed.command).toBe("/time set night");
  });

  it("prefers the final fenced draft inside reasoning text",()=>{
    const raw="<think>draft one ```\n/time set day\n``` then better ```\n/time set night\n``` done";
    const parsed=parseReply(raw,"fallback");
    expect(parsed.command).toBe("/time set night");
  });

  it("falls back to the last slash line when there is no fence",()=>{
    const parsed=parseReply("Maybe /say hi, but really:\n/tp @p 0 100 0","fallback");
    expect(parsed.command).toBe("/tp @p 0 100 0");
  });

  it("keeps plain answers without a command",()=>{
    const parsed=parseReply("Which effect did you want?","fallback");
    expect(parsed.text).toBe("Which effect did you want?");
    expect(parsed.command).toBeUndefined();
  });

  it("returns empty text for a fully empty reply",()=>{
    expect(parseReply("   ","fallback").text).toBe("");
  });
});
