process.env.NODE_ENV = "test";

import { beforeEach } from "vitest";
import { orderStore } from "../src/data/store.js";

beforeEach(() => {
  orderStore._reset();
});
