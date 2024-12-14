const watchlistId = '00a83900-8a0c-11ef-a3d4-e904b357a2e3';
const userId = '67ce5b1c-a4a4-4133-9204-95792e61fb8d';
const deviceId = '7ad7ef67-693f-4f5b-9e21-d2ce5f6de8a4';

function readEntries() {
  const rows = document
    .querySelector('[data-product-type-id="1"]')
    .querySelector('tbody')
    .querySelectorAll('tr');

  const data = [];
  for (const r of rows) {
    data.push([
      ...r.querySelector('[data-name="symbolIsin"]').innerText.split('|'),
      r.querySelector('[data-name="exchangeAbbr"]').innerText,
      r.querySelector('[data-field="size"]').innerText.replace('.', ''),
    ]);
  }

  const final = [];

  for (const item of data) {
    final.push({
      ticker: item[0].trim(),
      isin: item[1].trim(),
      exchange: item[2],
      shares: item[3]
    });
  }

  return final;
}

function createGraphQLPayload() {
  const payload = {
    query: `mutation(
       $userId: String,
       $deviceId: String,
       $platform: String,
       $appVersion: String,
       $isPro: Boolean,
       $purchaseId: String,
       $userSymbols: [UserSymbolInput]
     ) {
       syncPush(
         userId: $userId,
         deviceId: $deviceId,
         platform: $platform,
         appVersion: $appVersion,
         isPro: $isPro,
         purchaseId: $purchaseId,
         userSymbols: $userSymbols,
       ) {
         ok
         validationErrors
       }
    }`,
    variables: {
      "userId": `${userId}`,
      "deviceId": `${deviceId}`,
      "platform":"Web",
      "appVersion":"7.0.1",
      "isPro":false,
      "purchaseId":null,
      "userSymbols": buildUserSymbols()
    }
  };

  return payload;
}

function buildUserSymbols() {
  const symbols = [];
  for (const entry of readEntries()) {
    let symbol = '';
    switch (entry.exchange) {
      case 'TDG':
      case 'XET':
        symbol = entry.ticker + '.F';
        break;
      case 'LSE':
        symbol = entry.ticker + 'LSE';
        break;
      default:
        symbol = entry.ticker;
    }

    symbols.push({
      avgCost: -1,
      dividendTax: -1,
      dripActive: false,
      shareMode: "Simple",
      shares: entry.shares,
      symbol,
      watchlistId,
      isDeleted: false
    })
  }

  return symbols;
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('copy-button').addEventListener('click', function () {
    buildUserSymbols();
  });
});