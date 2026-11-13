import {
  BubbleButton,
  BubbleIconButton,
  BubbleFloatingActionButton,
  BubbleExtendedFab,
  BubbleButtonGroup,
} from "./buttons.js";
import {
  BubbleCheckbox,
  BubbleSwitch,
  BubbleRadioButton,
  BubbleTextField,
  BubbleAutocomplete,
  BubbleSearch,
  BubbleSlider,
  BubbleSegmentedButtons,
} from "./forms.js";
import { BubbleSelect } from "./select.js";
import { BubbleDatePicker, BubbleTimePicker } from "./pickers.js";
import {
  BubbleDialog,
  BubbleBottomSheet,
  BubbleSideSheet,
  BubbleNavigationDrawer,
  BubbleSnackbar,
  BubbleTooltip,
  BubbleFabMenu,
  BubbleSplitButton,
} from "./overlays.js";
import {
  BubbleAppBar,
  BubbleToolbar,
  BubbleCard,
  BubbleBadge,
  BubbleDivider,
  BubbleList,
  BubbleChip,
} from "./surfaces.js";
import {
  BubbleNavigationBar,
  BubbleNavigationRail,
  BubbleTabs,
} from "./navigation.js";
import {
  BubbleProgressIndicator,
  BubbleLoadingIndicator,
  BubbleCarousel,
} from "./feedback.js";

export {
  BubbleButton,
  BubbleIconButton,
  BubbleFloatingActionButton,
  BubbleExtendedFab,
  BubbleButtonGroup,
  BubbleCheckbox,
  BubbleSwitch,
  BubbleRadioButton,
  BubbleTextField,
  BubbleAutocomplete,
  BubbleSelect,
  BubbleSearch,
  BubbleDatePicker,
  BubbleTimePicker,
  BubbleSlider,
  BubbleSegmentedButtons,
  BubbleDialog,
  BubbleBottomSheet,
  BubbleSideSheet,
  BubbleNavigationDrawer,
  BubbleSnackbar,
  BubbleTooltip,
  BubbleFabMenu,
  BubbleSplitButton,
  BubbleAppBar,
  BubbleToolbar,
  BubbleCard,
  BubbleBadge,
  BubbleDivider,
  BubbleList,
  BubbleChip,
  BubbleNavigationBar,
  BubbleNavigationRail,
  BubbleTabs,
  BubbleProgressIndicator,
  BubbleLoadingIndicator,
  BubbleCarousel,
};
export type { BubbleItem } from "./shared.js";
export type { PickerLabels } from "./localization.js";
export type * from "./catalogue.types.js";

export const catalogue = {
  "bubble-autocomplete": BubbleAutocomplete,
  "bubble-app-bar": BubbleAppBar,
  "bubble-badge": BubbleBadge,
  "bubble-bottom-sheet": BubbleBottomSheet,
  "bubble-button-group": BubbleButtonGroup,
  "bubble-button": BubbleButton,
  "bubble-card": BubbleCard,
  "bubble-carousel": BubbleCarousel,
  "bubble-checkbox": BubbleCheckbox,
  "bubble-chip": BubbleChip,
  "bubble-date-picker": BubbleDatePicker,
  "bubble-dialog": BubbleDialog,
  "bubble-divider": BubbleDivider,
  "bubble-extended-fab": BubbleExtendedFab,
  "bubble-fab-menu": BubbleFabMenu,
  "bubble-floating-action-button": BubbleFloatingActionButton,
  "bubble-icon-button": BubbleIconButton,
  "bubble-list": BubbleList,
  "bubble-loading-indicator": BubbleLoadingIndicator,
  "bubble-navigation-bar": BubbleNavigationBar,
  "bubble-navigation-drawer": BubbleNavigationDrawer,
  "bubble-navigation-rail": BubbleNavigationRail,
  "bubble-progress-indicator": BubbleProgressIndicator,
  "bubble-radio-button": BubbleRadioButton,
  "bubble-search": BubbleSearch,
  "bubble-select": BubbleSelect,
  "bubble-segmented-buttons": BubbleSegmentedButtons,
  "bubble-side-sheet": BubbleSideSheet,
  "bubble-slider": BubbleSlider,
  "bubble-snackbar": BubbleSnackbar,
  "bubble-split-button": BubbleSplitButton,
  "bubble-switch": BubbleSwitch,
  "bubble-tabs": BubbleTabs,
  "bubble-text-field": BubbleTextField,
  "bubble-time-picker": BubbleTimePicker,
  "bubble-toolbar": BubbleToolbar,
  "bubble-tooltip": BubbleTooltip,
} as const;

for (const [name, constructor] of Object.entries(catalogue)) {
  if (!customElements.get(name)) customElements.define(name, constructor);
}

declare global {
  interface HTMLElementTagNameMap {
    "bubble-autocomplete": BubbleAutocomplete;
    "bubble-app-bar": BubbleAppBar;
    "bubble-badge": BubbleBadge;
    "bubble-bottom-sheet": BubbleBottomSheet;
    "bubble-button-group": BubbleButtonGroup;
    "bubble-button": BubbleButton;
    "bubble-card": BubbleCard;
    "bubble-carousel": BubbleCarousel;
    "bubble-checkbox": BubbleCheckbox;
    "bubble-chip": BubbleChip;
    "bubble-date-picker": BubbleDatePicker;
    "bubble-dialog": BubbleDialog;
    "bubble-divider": BubbleDivider;
    "bubble-extended-fab": BubbleExtendedFab;
    "bubble-fab-menu": BubbleFabMenu;
    "bubble-floating-action-button": BubbleFloatingActionButton;
    "bubble-icon-button": BubbleIconButton;
    "bubble-list": BubbleList;
    "bubble-loading-indicator": BubbleLoadingIndicator;
    "bubble-navigation-bar": BubbleNavigationBar;
    "bubble-navigation-drawer": BubbleNavigationDrawer;
    "bubble-navigation-rail": BubbleNavigationRail;
    "bubble-progress-indicator": BubbleProgressIndicator;
    "bubble-radio-button": BubbleRadioButton;
    "bubble-search": BubbleSearch;
    "bubble-select": BubbleSelect;
    "bubble-segmented-buttons": BubbleSegmentedButtons;
    "bubble-side-sheet": BubbleSideSheet;
    "bubble-slider": BubbleSlider;
    "bubble-snackbar": BubbleSnackbar;
    "bubble-split-button": BubbleSplitButton;
    "bubble-switch": BubbleSwitch;
    "bubble-tabs": BubbleTabs;
    "bubble-text-field": BubbleTextField;
    "bubble-time-picker": BubbleTimePicker;
    "bubble-toolbar": BubbleToolbar;
    "bubble-tooltip": BubbleTooltip;
  }
}
