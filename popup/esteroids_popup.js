if (!isFirefox) {
  window.addEventListener("click", function (e) {
    if (e.target.parentElement.href !== undefined) {
      browser.tabs.create({
        active: true,
        url: e.target.parentElement.href,
      });
    }
  });
}

let getSettings = promisify(browser.storage.local, "get", ["settings"]);
getSettings.then(loadCurrentSettings, onError);

function loadCurrentSettings(result) {
  let settings = result.settings;

  document.getElementById(
    "testnetIndicator"
  ).innerText = settings.enableEteherumTestnet
    ? `+ ${settings.ethereumTestnets.currentGateway.key}`
    : "";
  document.getElementById("ethereumGatewayOption").innerText =
    settings.ethereumGateways.option === "force_gateway"
      ? "forced"
      : settings.ethereumGateways.option === "other_gateway"
      ? "other"
      : settings.ethereumGateways.option;
  document.getElementById("ethereumCurrentGateway").innerText =
    settings.ethereumGateways.currentGateway.name;

  document.getElementById("ipfsGatewayOption").innerText =
    settings.ipfsGateways.option === "force_gateway"
      ? "forced"
      : settings.ipfsGateways.option === "other_gateway"
      ? "other"
      : settings.ipfsGateways.option;
  document.getElementById("ipfsCurrentGateway").innerText =
    settings.ipfsGateways.currentGateway.name;

  document.getElementById("siaGatewayOption").innerText =
    settings.skynetGateways.option === "force_gateway"
      ? "forced"
      : settings.skynetGateways.option === "other_gateway"
      ? "other"
      : settings.skynetGateways.option;
  document.getElementById("siaCurrentGateway").innerText =
    settings.skynetGateways.currentGateway.name;
}

function onError(error) {
  console.log(`Error: ${error}`);
}
