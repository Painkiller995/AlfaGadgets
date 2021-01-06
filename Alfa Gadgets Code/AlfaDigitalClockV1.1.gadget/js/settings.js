System.Gadget.onSettingsClosing = SettingsClosing;

function onLoad() {
  loadSettings();
}

function onUnload() {}

function SettingsClosing(event) {
  if (event.closeAction == event.Action.commit) saveSettings();
  event.cancel = false;
}

function loadSettings() {
  background.value = System.Gadget.Settings.read("background");
}

function saveSettings() {
  System.Gadget.Settings.write("background", background.value);
}
