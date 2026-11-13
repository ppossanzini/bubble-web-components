export type ActionVariant =
  | "filled"
  | "tonal"
  | "filled-tonal"
  | "outlined"
  | "elevated"
  | "text"
  | "standard";
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
export interface BubbleValueChangeDetail {
  value: string;
  upperValue?: number;
  endValue?: string;
  values?: string[];
}
export interface BubbleCheckedChangeDetail {
  checked: boolean;
  value: string;
}
export interface BubbleToggleChangeDetail {
  selected: boolean;
}
export interface BubbleActionDetail {
  id?: string;
}
export interface BubbleCarouselChangeDetail {
  index: number;
}
export interface BubbleClosedDetail {
  returnValue?: string;
  reason?: string;
}
