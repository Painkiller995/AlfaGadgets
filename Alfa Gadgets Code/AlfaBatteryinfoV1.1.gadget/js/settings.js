System.Gadget.onSettingsClosing = SettingsClosing;

function onLoad() {
  initSettings();
}

function onUnload() {}

function SettingsClosing(event) {
  if (event.closeAction == event.Action.commit) saveSettings();
  event.cancel = false;
}

function initSettings() {
  loadSettings();
}

function loadSettings() {
  background.value = System.Gadget.Settings.read("background");
  bar.value = System.Gadget.Settings.read("barcolor");
}

function saveSettings() {
  System.Gadget.Settings.write("background", background.value);
  System.Gadget.Settings.write("barcolor", bar.value);
}
