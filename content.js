// ---------------------

// Include TradingView script
// const script = document.createElement('script');
// script.type = 'text/javascript';
// script.src = chrome.runtime.getURL('tv.js');
// document.head.appendChild(script);


window.addEventListener('hashchange', () => {
  if (window.location.hash.includes('overview')) {
    setTimeout(() => {
      const section = document
        .querySelector('[data-name="productDetails"]')
        .querySelector('section');


      const button = document.createElement('button');
      button.innerText = 'TradingView';

      button.addEventListener('click', () => {
        const highcharts = section.querySelector('section');
        highcharts.setAttribute('id', 'highcharts');
        createWidget();
      });

      const header = section.querySelector('header');
      header.appendChild(button);

      // insertTradingViewTab();
    }, 200)
  }
});

// function insertTradingViewTab() {
//   const panel = document.querySelector('[role="tabpanel"]');
//
//   if (!panel.querySelector('#trading-view-tab')) {
//     const a = panel.lastChild.cloneNode(true);
//     a.setAttribute('id', 'trading-view-tab');
//     a.setAttribute('href', window.location.hash + '_arbuz');
//     a.innerText = "Trading View";
//     panel.appendChild(a);
//   }
// }

function createWidget() {
    new TradingView.MediumWidget(
      {
        "symbols": [
          [
            "Netflix",
            `${getOverviewExchange()}:${getOverviewTicker()}|1D`
          ]
        ],
        "chartOnly": false,
        "width": "100%",
        "height": 450,
        "locale": "en",
        "colorTheme": "dark",
        "autosize": true,
        "showVolume": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "Open Sans",
        fontSize: "10",
        noTimeScale: false,
        valuesTracking: "1",
        chartType: "line",
        lineWidth: 1,
        backgroundColor: "#23252d",
        widgetFontColor: "rgb(224, 232, 255)",
        "container_id": "highcharts"
      },
      // {
      //   "symbols": [
      //     [
      //       "Netflix",
      //       `${getOverviewExchange()}:${getOverviewTicker()}|1D`
      //     ]
      //   ],
      //   "chartOnly": false,
      //   // "width": 1000,
      //   // "height": 500,
      //   "locale": "en",
      //   "colorTheme": "dark",
      //   "autosize": true,
      //   "showVolume": false,
      //   "hideDateRanges": false,
      //   "hideMarketStatus": false,
      //   "scalePosition": "right",
      //   "scaleMode": "Normal",
      //   "fontFamily": "Open Sans",
      //   "fontSize": "10",
      //   "noTimeScale": false,
      //   "valuesTracking": "1",
      //   "chartType": "line",
      //   "container_id": "highcharts"
      // }
    );
}

function getOverviewExchange() {
  const info = document.querySelector('[data-name="productBriefInfo"]');
  const exchange = info.innerText.split('|')[0].trim();

  switch (exchange) {
    case 'TDG': return "TRADEGATE";
    case 'NDQ': return "NASDAQ";
    case 'TOR': return "TSX";
    case 'XET': return "XETR";
    case 'NSY': return "NYSE";
  }
}

function getOverviewTicker() {
  const info = document.querySelector('[data-name="productBriefInfo"]');
  return info.innerText.split('|')[1].trim();
}