import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseSshConfig } from "../src/ssh-config.js";

test("parseSshConfig reads concrete Host blocks and ignores wildcards", () => {
  const hosts = parseSshConfig(readFileSync("fixtures/ssh_config", "utf8"));
  assert.deepEqual(hosts.map((host) => host.alias), ["gpu", "mini"]);
  assert.equal(hosts[0]?.hostName, "gpu-box.tailnet.ts.net");
  assert.equal(hosts[0]?.user, "roger");
});
