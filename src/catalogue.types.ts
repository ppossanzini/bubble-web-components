export type ActionVariant =
  | "filled"
  | "tonal"
  | "filled-tonal"
  | "outlined"
  | "elevated"
  | "text"
  | "standard"
  | "accent";
export type ActionSize = "xs" | "small" | "medium" | "large" | "xl" | "fab";
export type ActionShape = "round" | "square";
export type FabColor =
  | "primary-container"
  | "secondary-container"
  | "tertiary-container"
  | "primary"
  | "secondary"
  | "tertiary"
  | "surface";
export interface BolleValueChangeDetail {
  value: string;
  upperValue?: number;
  endValue?: string;
  values?: string[];
}
export interface BolleCheckedChangeDetail {
  checked: boolean;
  value: string;
}
export interface BolleToggleChangeDetail {
  selected: boolean;
}
export interface BolleActionDetail {
  id?: string;
}
export interface BolleCarouselChangeDetail {
  index: number;
}
export interface BolleClosedDetail {
  returnValue?: string;
  reason?: string;
}
