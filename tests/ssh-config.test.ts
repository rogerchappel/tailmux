import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseSshConfig } from "../src/ssh-config.js";

test("parseSshConfig reads concrete Host blocks and ignores wildcards", () => {
  const hosts = parseSshConfig(readFileSync("fixtures/ssh_config", "utf8"));
  assert.deepEqual(hosts.map((host) => host.alias), ["gpu", "gpu-admin", "gpu-equals", "gpu-ip", "mini", "quoted"]);
  assert.equal(hosts[0]?.hostName, "gpu-box.tailnet.ts.net");
  assert.equal(hosts[0]?.user, "roger");
  assert.equal(hosts[1]?.hostName, "gpu-box.tailnet.ts.net");
  assert.equal(hosts[2]?.hostName, "gpu-box.tailnet.ts.net");
  assert.equal(hosts[3]?.hostName, "100.64.0.2");
  assert.equal(hosts[5]?.hostName, "quoted#host.tailnet.ts.net");
  assert.equal(hosts[5]?.identityFile, "~/.ssh/key #1");
});

test("parseSshConfig excludes negated and wildcard Host patterns", () => {
  const hosts = parseSshConfig(`
Host app !blocked *.internal
  HostName app.internal
`);

  assert.deepEqual(hosts, [{ alias: "app", hostName: "app.internal" }]);
});

test("parseSshConfig keeps hashes inside quoted option values", () => {
  const hosts = parseSshConfig(`
Host quoted # a real comment
  HostName "server#1.internal" # another comment
  User 'user #1'
  IdentityFile "~/.ssh/key #1"
`);

  assert.deepEqual(hosts, [{
    alias: "quoted",
    hostName: "server#1.internal",
    user: "user #1",
    identityFile: "~/.ssh/key #1",
  }]);
});

test("parseSshConfig stops concrete hosts at Match and keeps first scalar values", () => {
  const hosts = parseSshConfig(`
Host box alias-box
  HostName box.ts.net
  User first
  User second
  Port 22
  Port 2200
Match host other
  User matched
  Port 2022
`);

  assert.deepEqual(hosts, [
    { alias: "alias-box", hostName: "box.ts.net", user: "first", port: 22 },
    { alias: "box", hostName: "box.ts.net", user: "first", port: 22 },
  ]);
});

test("parseSshConfig resumes after Match at the next Host boundary", () => {
  const hosts = parseSshConfig(`
Host before
  HostName before.ts.net
Match all
  User matched
Host after
  HostName after.ts.net
  User roger
`);

  assert.deepEqual(hosts, [
    { alias: "after", hostName: "after.ts.net", user: "roger" },
    { alias: "before", hostName: "before.ts.net" },
  ]);
});

test("parseSshConfig accepts case-insensitive equals directives", () => {
  const hosts = parseSshConfig(`
hOsT=gpu-equals gpu-secondary
  HOSTNAME=gpu-box.tailnet.ts.net
  user=roger
  Port=2222
  identityFILE="~/.ssh/gpu key"
`);

  assert.deepEqual(hosts, [
    { alias: "gpu-equals", hostName: "gpu-box.tailnet.ts.net", user: "roger", port: 2222, identityFile: "~/.ssh/gpu key" },
    { alias: "gpu-secondary", hostName: "gpu-box.tailnet.ts.net", user: "roger", port: 2222, identityFile: "~/.ssh/gpu key" },
  ]);
});

test("parseSshConfig ignores empty equals assignments", () => {
  const hosts = parseSshConfig(`
Host=box
  HostName=
  User=
  Port=
  IdentityFile=
`);

  assert.deepEqual(hosts, [{ alias: "box" }]);
});
