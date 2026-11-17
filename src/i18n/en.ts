export default {
  // Buttons / common
  "buttons.create": "Create",
  "buttons.save": "Save",
  "buttons.edit": "Edit",
  "buttons.delete": "Delete",
  "buttons.cancel": "Cancel",
  "buttons.show": "Show",
  "buttons.list": "List",
  "buttons.back": "Back",
  "buttons.confirm": "Confirm",
  "buttons.refresh": "Refresh",
  "buttons.clone": "Clone",
  "buttons.notAccessTitle": "You don't have access",
  "buttons.logout": "Logout",
  "buttons.undo": "Undo",
  "buttons.import": "Import",
  "buttons.export": "Export",
  "buttons.filter": "Filter",
  "buttons.clear": "Clear",
  "buttons.search": "Search",

  // Login page
  "pages.login.title": "Sign in to your account",
  "pages.login.signin": "Sign in",
  "pages.login.signup": "Sign up",
  "pages.login.divider": "or",
  "pages.login.fields.email": "Email",
  "pages.login.fields.password": "Password",
  "pages.login.errors.validEmail": "Invalid email",
  "pages.login.errors.requiredEmail": "Email is required",
  "pages.login.errors.requiredPassword": "Password is required",
  "pages.login.buttons.submit": "Sign in",
  "pages.login.buttons.forgotPassword": "Forgot password?",
  "pages.login.buttons.noAccount": "Don't have an account?",
  "pages.login.buttons.rememberMe": "Remember me",

  // Register page
  "pages.register.title": "Create a new account",
  "pages.register.signup": "Sign up",
  "pages.register.signin": "Sign in",
  "pages.register.fields.email": "Email",
  "pages.register.fields.password": "Password",
  "pages.register.errors.validEmail": "Invalid email",
  "pages.register.errors.requiredEmail": "Email is required",
  "pages.register.errors.requiredPassword": "Password is required",
  "pages.register.buttons.submit": "Sign up",
  "pages.register.buttons.haveAccount": "Already have an account?",

  // Forgot password
  "pages.forgotPassword.title": "Forgot password?",
  "pages.forgotPassword.fields.email": "Email",
  "pages.forgotPassword.errors.validEmail": "Invalid email",
  "pages.forgotPassword.errors.requiredEmail": "Email is required",
  "pages.forgotPassword.buttons.submit": "Send reset instructions",
  "pages.forgotPassword.buttons.haveAccount": "Already have an account?",
  "pages.forgotPassword.signin": "Sign in",

  // Update password
  "pages.updatePassword.title": "Update password",
  "pages.updatePassword.fields.password": "New password",
  "pages.updatePassword.fields.confirmPassword": "Confirm new password",
  "pages.updatePassword.errors.confirmPasswordNotMatch": "Passwords do not match",
  "pages.updatePassword.errors.requiredPassword": "Password is required",
  "pages.updatePassword.errors.requiredConfirmPassword": "Confirm password is required",
  "pages.updatePassword.buttons.submit": "Update password",

  // Error pages
  "pages.error.info": "Error",
  "pages.error.404": "Page not found",
  "pages.error.resource404": "Make sure you have created the resource",
  "pages.error.backHome": "Back to home",

  // Notifications
  "notifications.success": "Successful",
  "notifications.error": "Error when `{{action}}` on resource `{{resource}}`",
  "notifications.createSuccess": "Successfully created {{resource}}",
  "notifications.createError": "Failed to create {{resource}}",
  "notifications.deleteSuccess": "Successfully deleted {{resource}}",
  "notifications.deleteError": "Failed to delete {{resource}}",
  "notifications.editSuccess": "Successfully updated {{resource}}",
  "notifications.editError": "Failed to update {{resource}}",
  "notifications.undoable": "Undone in {{seconds}} seconds",
  "notifications.importProgress": "Importing: {{processed}}/{{total}}",
  "notifications.autoSave": "Auto saved",
  "notifications.autoSaveError": "Auto save failed",

  // Table
  "table.actions": "Actions",
  "table.noData": "No data",

  // Document title
  "documentTitle.default": "RSVQuick",
  "documentTitle.suffix": "RSVQuick",

  // Unsaved changes
  "warnWhenUnsavedChanges": "Unsaved changes will be lost. Are you sure?",

  // Resources — titles
  "requests.titles.list": "RSVP Invitations",
  "requests.titles.create": "Create Invitation",
  "requests.titles.show": "Invitation Detail",
  "requests.titles.edit": "Edit Invitation",
  "admin-users.titles.list": "Manage Users",

  // Resource names (used in notification {{resource}})
  "requests.requests": "Invitation",
  "responses.responses": "Response",
  "invitations.invitations": "Guest",
  "profiles.profiles": "Profile",
  "admin-users.admin-users": "User",
  "questions.questions": "Question",
  "choices.choices": "Choice",
  "answers.answers": "Answer",

  // Misc
  "loading": "Loading...",
} as const;
