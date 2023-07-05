// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { assert } from "chai";
import * as td from "testdouble";

describe("Mocking", () => {

  beforeEach(async () => {
    await td.replaceEsm("node-fetch", {
      default: () => {
        return {
          status: 200,
        }
      }
    });
  });

  afterEach(async () => {
    td.reset();
  });

  it("should work", async () => {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch('https://example.com/data');
    assert.equal(response.status, 200);
  });
});
