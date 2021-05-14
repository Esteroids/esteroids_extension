/**
 * Backgroud functions related to Dweb infrastructure:
 * IPFS, ENS, Swarm etc.
 */

// every visit to UPDATESETTINGSUPDATETHRESHOLD dwebsites the extension
// updates settings from remote ipfs soure
// see also 'settingsUrl' variable in background.js
const UPDATESETTINGSUPDATETHRESHOLD = 10;

/**
 * RDNtoDS: redirected Decentralized Name to Decentralized storage
 * @param {string} domain [decentralized name URL]
 * @param {string} path   [path in the decentralized name]
 */
async function RDNtoDS(domain, path) {
  let TLD = domain.split(".").pop();

  switch (TLD) {
    case "eth":
      try {
        var address = await WEB3ENS.getContenthash(domain);

        if (address !== "0x")
          var redirect = await redirectENStoIPFS(address, domain, path);
        else var redirect = await getSkynet(domain, path);
      } catch (e) {
        var redirect = notFound(domain, e);
      }
      break;
    case "teth":
    case "testeth":
      // if testnet is diabled, return nothing
      if (!enableEteherumTestnet) return { redirectUrl: "about:blank" };

      // We transfer from the extension .teth and .testeth TLDs, to.eth and .test TLDs correspondingly
      switch (TLD) {
        case "teth":
          domain = domain.replace(".teth", ".eth");
          break;
        case "testeth":
          domain = domain.replace(".testeth", ".test");
      }

      try {
        var address = await WEB3ENS.getContenthashTestnet(domain);

        if (address !== "0x")
          var redirect = await redirectENStoIPFS(address, domain, path);
        else var redirect = notFound(domain, e);
      } catch (e) {
        var redirect = notFound(domain, e);
      }
  }

  return redirect;
}

// create IPFS link and redicrect to it
function redirectENStoIPFS(address, ensDomain, ensPath) {
  const codec = contentHash.getCodec(address);
  let ipfsHash = contentHash.decode(address);
  let protocol = "";

  switch (codec) {
    case "ipfs-ns":
      protocol = "/ipfs/";
      break;
    case "ipns-ns":
      protocol = "/ipns/";

      // if it's a human-readable name and and not IPFS CID
      if (ipfsHash.substring(0,2) !== 'Qm') {
        arraybuffer_ipns_name = Base58.decode(ipfsHash);
        var enc = new TextDecoder("utf-8");
        ipfsHash = enc.decode(arraybuffer_ipns_name).substring(2);
      }
      break;
    default:
      throw "protocol unknown";
  }

  let ipfsAddress =
    ipfsGateways.currentGateway.address + protocol + ipfsHash + ensPath;

  localENS[ipfsHash] = ensDomain;

  // increase counter each visit
  return promisify(browser.storage.local, "get", ["usageCounter"]).then(
    function (item) {
      increaseUsageCounter(item);

      return {
        redirectUrl: ipfsAddress,
      };
    },
    err
  );
}

// retrieve general ENS content field
async function getSkynet(ensDomain, ensPath) {
  try {
    var content = await WEB3ENS.getSkynet(ensDomain);
    if (content == "") var redirect = notFound(ensDomain, e);

    var redirect = redirectENStoSkynet(content, ensDomain, ensPath);
  } catch (e) {
    var redirect = notFound(ensDomain, e);
  }

  return redirect;
}

// create Skynet link and redicrect to it
function redirectENStoSkynet(CID, ensDomain, ensPath) {
  let skynetAddress =
    skynetGateways.currentGateway.address + "/" + CID + ensPath;

  localENS[skynetAddress] = ensDomain;

  // increase counter each visit
  return promisify(browser.storage.local, "get", ["usageCounter"]).then(
    function (item) {
      increaseUsageCounter(item);

      return {
        redirectUrl: skynetAddress,
      };
    },
    err
  );
}

function hextoIPFS(hex) {
  let dig = Multihashes.fromHexString(hex);
  let ipfsBuffer = Multihashes.encode(dig, 18, 32);
  let ipfsHash = Multihashes.toB58String(ipfsBuffer);

  return ipfsHash;
}

function increaseUsageCounter(item) {
  if (Object.entries(item).length != 0) {
    // increase counter
    let newCounter = item.usageCounter + 1;

    // we check for settings update each UPDATESETTINGSUPDATETHRESHOLD websites visits
    if (newCounter % UPDATESETTINGSUPDATETHRESHOLD == 0) checkforUpdates = true;

    promisify(browser.storage.local, "set", [{ usageCounter: newCounter }]);
  } else {
    // init counter
    promisify(browser.storage.local, "set", [{ usageCounter: 1 }]);
  }
}
