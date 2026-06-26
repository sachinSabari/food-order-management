import { menuStore } from "../data/store.js";
import type { MenuItem } from "../types/index.js";

export const menuService = {
  listAvailable(): MenuItem[] {
    return menuStore.findAll().filter((item) => item.available);
  },
  getById(id: string): MenuItem | undefined {
    return menuStore.findById(id);
  },
};
