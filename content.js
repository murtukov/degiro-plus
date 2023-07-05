const observer = new MutationObserver(mutations => {
  // URL example: #/products/17676929/overview
  if(/\#\/products\/([0-9]+)(\/([a-z]*))?/g.test(window.location.hash)) {
    extendProductView(mutations);
  }
});

observer.observe(document, {
  subtree: true,
  attributes: true
});

function extendProductView(mutations) {
  for (const mutation of mutations) {
    if (mutation.target.tagName === 'HEADER') {
      appendTradingViewTab(mutation.target);
      break;
    }
  }
}

function appendTradingViewTab(header) {
  const tabPanel = header.querySelector('[role="tabpanel"]');

  if (tabPanel) {
    if (tabPanel.querySelector('#trading-view-tab')) {
      return;
    }

    const newTab = tabPanel.lastChild.cloneNode(true);
    newTab.removeAttribute('href');
    newTab.textContent = 'Trading View'
    newTab.setAttribute('id', 'trading-view-tab');
    tabPanel.appendChild(newTab);

    newTab.onclick = () => {
      const contentSection = document.querySelector('[data-name="productDetails"]').querySelector('section');
      contentSection.firstChild.classList.add('hidden');
      const div = document.createElement('div');
      div.setAttribute('id', 'trading-view-full-chart');
      contentSection.appendChild(div);
      createFullWidget();
    }

    for (let tab of tabPanel.children) {
      tab.addEventListener('click', (e) => {
        if (e.currentTarget.getAttribute('id')) {
          return;
        }

        const contentSection = document.querySelector('[data-name="productDetails"]').querySelector('section');
        contentSection.firstChild.classList.remove('hidden');
      });
    }
  }
}

// window.addEventListener('load', () => console.log('loaded...'));

window.addEventListener('hashchange', () => {
  if (window.location.hash.includes('overview')) {
    setTimeout(() => {
      const section = document
        .querySelector('[data-name="productDetails"]')
        .querySelector('section');


      const button = document.createElement('button');
      button.innerText = 'TradingView';
      button.classList.add('tv-switch-chart');

      const highcharts = section.querySelector('section');
      highcharts.setAttribute('id', 'highcharts');

      const tvContainer = document.createElement('div');
      tvContainer.setAttribute('id', 'tvContainer');
      tvContainer.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          display: none;
      `;

      highcharts.appendChild(tvContainer);
      createMediumWidget();

      button.addEventListener('click', () => {
        tvContainer.style.display = 'block';
      });

      const header = section.querySelector('header');
      header.appendChild(button);

      // insertTradingViewTab();
    }, 200)
  }
});

function createMediumWidget() {
    new TradingView.MediumWidget(
      {
        symbols: [
          [
            "Netflix",
            `${getOverviewExchange()}:${getOverviewTicker()}|1D`
          ]
        ],
        chartOnly: false,
        width: "100%",
        height: 450,
        locale: "en",
        colorTheme: "dark",
        autosize: true,
        showVolume: false,
        hideDateRanges: false,
        hideMarketStatus: false,
        scalePosition: "right",
        scaleMode: "Normal",
        fontFamily: "Open Sans",
        fontSize: "14",
        noTimeScale: false,
        chartType: "line",
        lineWidth: 1,
        valuesTracking: "3",
        backgroundColor: "#23252d",
        widgetFontColor: "rgb(224, 232, 255)",
        container_id: "tvContainer"
      },
    );
}

function createFullWidget() {
  return new TradingView.widget(
    {
      "autosize": true,
      "symbol": `${getOverviewExchange()}:${getOverviewTicker()}`,
      "interval": "1",
      "range": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "3",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hidevolume": false,
      "withdateranges": true,
      "allow_symbol_change": false,
      "save_image": false,
      "container_id": 'trading-view-full-chart'
    }
  );
}

function getOverviewExchange() {
  const info = document.querySelector('[data-name="productDetails"] [data-name="productBriefInfo"]');
  const exchange = info.innerText.split('|')[0].trim();

  switch (exchange) {
    case 'ASX': return "ASX";     // Australia
    case 'ATH': return "ATHEX";   // Greece (Athens)
    case 'FRA': return "FWB";     // Germany (Frankfurt)
    case 'HSE': return "OMXHEX";  // Finnland (Helsinki)
    case 'HKS': return "HKEX";    // Hong-Kong
    case 'LSE': return "LSE";     // London Stock Exchange
    case 'MAD': return "BME";
    case 'MIL': return "MIL";
    case 'NDQ': return "NASDAQ";
    case 'NSY': return "NYSE";
    case 'OMK': return "OMXCOP";
    case 'OSL': return "OSL";
    case 'TDG': return "TRADEGATE";
    case 'TOR': return "TSX";
    case 'TSE': return "TSE";
    case 'XET': return "XETR";
    case 'WSE': return "GPW";
    case 'EBR':
    case 'EPA':
    case 'ELI':
    case 'EAM': return "EURONEXT";
  }
}

function getOverviewTicker() {
  const info = document.querySelector('[data-name="productDetails"] [data-name="productBriefInfo"]');
  return info.innerText.split('|')[1].trim();
}