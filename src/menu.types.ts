export interface MenuAction {
  id: string;
  label: string;
  supportingText?: string;
  trailingText?: string;
  badge?: string;
  icon?: string;
  disabled?: boolean;
  selected?: boolean;
  href?: string;
  children?: MenuEntry[];
}

export interface MenuDivider {
  separator: true;
}

export interface MenuGroup {
  group: true;
  label: string;
  items: MenuAction[];
}

export type MenuEntry = MenuAction | MenuDivider | MenuGroup;
export type SelectionMode = "none" | "single" | "multi";

export interface MenuSelectDetail {
  item: MenuAction;
  selectedIds: string[];
}

export function isAction(entry: MenuEntry): entry is MenuAction {
  return !("separator" in entry) && !("group" in entry);
}

export function isGroup(entry: MenuEntry): entry is MenuGroup {
  return "group" in entry;
}

export function flattenMenu(entries: MenuEntry[], depth = 0): MenuAction[] {
  if (depth > 3) throw new Error("Menu groups nest at most four levels deep.");
  return entries.flatMap((entry) =>
    isAction(entry)
      ? [entry]
      : isGroup(entry)
        ? flattenMenu(entry.items, depth + 1)
        : [],
  );
}
