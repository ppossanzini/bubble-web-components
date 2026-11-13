import {
  BolleButton,
  BolleIconButton,
  BolleFloatingActionButton,
  BolleExtendedFab,
  BolleButtonGroup,
} from "./buttons.js";
import {
  BolleCheckbox,
  BolleSwitch,
  BolleRadioButton,
  BolleTextField,
  BolleAutocomplete,
  BolleSearch,
  BolleSegmentedButtons,
} from "./forms.js";
import { BolleSlider, BolleSteps } from "./slider.js";
import { BolleSelect } from "./select.js";
import { BolleDatePicker, BolleTimePicker } from "./pickers.js";
import {
  BolleDialog,
  BolleBottomSheet,
  BolleSideSheet,
  BolleNavigationDrawer,
  BolleSnackbar,
  BolleTooltip,
  BolleFabMenu,
  BolleSplitButton,
} from "./overlays.js";
import {
  BolleAppBar,
  BolleToolbar,
  BolleCard,
  BolleBadge,
  BolleDivider,
  BolleList,
  BolleChip,
} from "./surfaces.js";
import {
  BolleNavigationBar,
  BolleNavigationRail,
  BolleTabs,
} from "./navigation.js";
import {
  BolleProgressIndicator,
  BolleLoadingIndicator,
  BolleCarousel,
} from "./feedback.js";

export {
  BolleButton,
  BolleIconButton,
  BolleFloatingActionButton,
  BolleExtendedFab,
  BolleButtonGroup,
  BolleCheckbox,
  BolleSwitch,
  BolleRadioButton,
  BolleTextField,
  BolleAutocomplete,
  BolleSelect,
  BolleSearch,
  BolleDatePicker,
  BolleTimePicker,
  BolleSlider,
  BolleSteps,
  BolleSegmentedButtons,
  BolleDialog,
  BolleBottomSheet,
  BolleSideSheet,
  BolleNavigationDrawer,
  BolleSnackbar,
  BolleTooltip,
  BolleFabMenu,
  BolleSplitButton,
  BolleAppBar,
  BolleToolbar,
  BolleCard,
  BolleBadge,
  BolleDivider,
  BolleList,
  BolleChip,
  BolleNavigationBar,
  BolleNavigationRail,
  BolleTabs,
  BolleProgressIndicator,
  BolleLoadingIndicator,
  BolleCarousel,
};
export type { BolleItem } from "./shared.js";
export type { PickerLabels } from "./localization.js";
export type * from "./catalogue.types.js";

export const catalogue = {
  "bolle-autocomplete": BolleAutocomplete,
  "bolle-app-bar": BolleAppBar,
  "bolle-badge": BolleBadge,
  "bolle-bottom-sheet": BolleBottomSheet,
  "bolle-button-group": BolleButtonGroup,
  "bolle-button": BolleButton,
  "bolle-card": BolleCard,
  "bolle-carousel": BolleCarousel,
  "bolle-checkbox": BolleCheckbox,
  "bolle-chip": BolleChip,
  "bolle-date-picker": BolleDatePicker,
  "bolle-dialog": BolleDialog,
  "bolle-divider": BolleDivider,
  "bolle-extended-fab": BolleExtendedFab,
  "bolle-fab-menu": BolleFabMenu,
  "bolle-floating-action-button": BolleFloatingActionButton,
  "bolle-icon-button": BolleIconButton,
  "bolle-list": BolleList,
  "bolle-loading-indicator": BolleLoadingIndicator,
  "bolle-navigation-bar": BolleNavigationBar,
  "bolle-navigation-drawer": BolleNavigationDrawer,
  "bolle-navigation-rail": BolleNavigationRail,
  "bolle-progress-indicator": BolleProgressIndicator,
  "bolle-radio-button": BolleRadioButton,
  "bolle-search": BolleSearch,
  "bolle-select": BolleSelect,
  "bolle-segmented-buttons": BolleSegmentedButtons,
  "bolle-side-sheet": BolleSideSheet,
  "bolle-slider": BolleSlider,
  "bolle-snackbar": BolleSnackbar,
  "bolle-split-button": BolleSplitButton,
  "bolle-steps": BolleSteps,
  "bolle-switch": BolleSwitch,
  "bolle-tabs": BolleTabs,
  "bolle-text-field": BolleTextField,
  "bolle-time-picker": BolleTimePicker,
  "bolle-toolbar": BolleToolbar,
  "bolle-tooltip": BolleTooltip,
} as const;

for (const [name, constructor] of Object.entries(catalogue)) {
  if (!customElements.get(name)) customElements.define(name, constructor);
}

declare global {
  interface HTMLElementTagNameMap {
    "bolle-autocomplete": BolleAutocomplete;
    "bolle-app-bar": BolleAppBar;
    "bolle-badge": BolleBadge;
    "bolle-bottom-sheet": BolleBottomSheet;
    "bolle-button-group": BolleButtonGroup;
    "bolle-button": BolleButton;
    "bolle-card": BolleCard;
    "bolle-carousel": BolleCarousel;
    "bolle-checkbox": BolleCheckbox;
    "bolle-chip": BolleChip;
    "bolle-date-picker": BolleDatePicker;
    "bolle-dialog": BolleDialog;
    "bolle-divider": BolleDivider;
    "bolle-extended-fab": BolleExtendedFab;
    "bolle-fab-menu": BolleFabMenu;
    "bolle-floating-action-button": BolleFloatingActionButton;
    "bolle-icon-button": BolleIconButton;
    "bolle-list": BolleList;
    "bolle-loading-indicator": BolleLoadingIndicator;
    "bolle-navigation-bar": BolleNavigationBar;
    "bolle-navigation-drawer": BolleNavigationDrawer;
    "bolle-navigation-rail": BolleNavigationRail;
    "bolle-progress-indicator": BolleProgressIndicator;
    "bolle-radio-button": BolleRadioButton;
    "bolle-search": BolleSearch;
    "bolle-select": BolleSelect;
    "bolle-segmented-buttons": BolleSegmentedButtons;
    "bolle-side-sheet": BolleSideSheet;
    "bolle-slider": BolleSlider;
    "bolle-snackbar": BolleSnackbar;
    "bolle-split-button": BolleSplitButton;
    "bolle-steps": BolleSteps;
    "bolle-switch": BolleSwitch;
    "bolle-tabs": BolleTabs;
    "bolle-text-field": BolleTextField;
    "bolle-time-picker": BolleTimePicker;
    "bolle-toolbar": BolleToolbar;
    "bolle-tooltip": BolleTooltip;
  }
}
