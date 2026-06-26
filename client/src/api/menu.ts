import { apiRequest } from "./client";
import type { MenuItem } from "../types";

export const menuApi = {
  list(): Promise<MenuItem[]> {
    return apiRequest<MenuItem[]>("/api/menu");
  },
};
