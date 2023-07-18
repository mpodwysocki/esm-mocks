// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as td from "testdouble";
import { ClientRequest, IncomingHttpHeaders, IncomingMessage } from "http";
import { PassThrough } from "stream";
import { assert } from "chai";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ReplaceEsmResponse {

  default?: any;
  [namedExport: string]: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

class FakeResponse extends PassThrough {
  public statusCode?: number;
  public headers?: IncomingHttpHeaders;
}

class FakeRequest extends PassThrough {}

function createRequest(): ClientRequest {
  const request = new FakeRequest();
  return request as unknown as ClientRequest;
}

function createResponse(statusCode: number, body = ""): IncomingMessage {
  const response = new FakeResponse();
  response.headers = {};
  response.statusCode = statusCode;
  response.write(body);
  response.end();
  return response as unknown as IncomingMessage;
}

describe("Mocking", () => {

  let nodeFetch: ReplaceEsmResponse;
  let https: ReplaceEsmResponse;

  beforeEach(async () => {
    nodeFetch = await td.replaceEsm("node-fetch");
    https = await td.replaceEsm("https");
  });

  afterEach(async () => {
    td.reset();
  });

  it("node-fetch should work", async () => {
    td.when(nodeFetch.default(td.matchers.anything())).thenResolve({
      status: 200,
    });
    const response = await nodeFetch.default("https://example.com/data");
    assert.equal(response.status, 200);
  });

  it("https should work", async () => {
    const request = createRequest();
    const callbackResponse = createResponse(200, "Hello World");
    td.when(https.get(td.matchers.anything(), td.callback(callbackResponse)))
      .thenReturn(request);

    const madeRequest = https.get("https://example.com/data", (res: IncomingMessage) => {
      assert.equal(res.statusCode, 200);
      res.on("data", (data) => {
        assert.equal(data.toString(), "Hello World");
      });
    });
    madeRequest.end();

    td.verify(https.get("https://example.com/data", td.matchers.anything()));
  });
});
