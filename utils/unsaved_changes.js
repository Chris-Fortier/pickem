// keeps track of whether the current page has changes that haven't been saved to the server
// this is shared so the nav bar can warn before changing the season/week or logging out
let has_unsaved_changes = false;

export const UNSAVED_CHANGES_MESSAGE =
   "You have unsaved changes. Are you sure you want to leave without saving them?";

export function set_has_unsaved_changes(value) {
   has_unsaved_changes = value;
}

export function get_has_unsaved_changes() {
   return has_unsaved_changes;
}

// asks the user to confirm discarding any unsaved changes
// returns true if it is ok to continue (no unsaved changes or the user confirmed)
export function confirm_discard_unsaved_changes() {
   if (!has_unsaved_changes) {
      return true;
   }
   if (window.confirm(UNSAVED_CHANGES_MESSAGE)) {
      has_unsaved_changes = false; // so the user isn't asked again for the same changes
      return true;
   }
   return false;
}
