const observer = new MutationObserver(mutations => {
  // debugger;
  // URL example: #/products/17676929/overview
  if(/\#\/products\/([0-9]+)(\/([a-z]*))?/g.test(window.location.hash)) {
    extendProductView(mutations);
  }

  // URL example: #/portfolio/assets
  // change the regexp below to match the URL of your portfolio
  if(window.location.hash.includes('#/portfolio/assets')) {
    // console.log(mutations);
    for (const mutation of mutations) {
      // if (mutation.target.tagName === 'TBODY') {
      //   // console.log(mutation);
      //
      //   mutation.addedNodes.forEach(node => {
      //     console.log(node);
      //     // if (node.tagName === 'TR' && node.querySelector('[data-name="symbolIsin"]').innerText.contains('ARCC')) {
      //     //   console.log(node.querySelector('span[data-name="symbolName"]').innerText);
      //     // }
      //   });
      // }

      if (mutation.target.tagName === 'DIV') {
        if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].tagName === 'DIV' && mutation.addedNodes[0].querySelector('table')) {
          mutation.addedNodes[0].querySelectorAll('[data-name="symbolIsin"]').forEach(span => {
            const row = span.closest('tr');
            const category = row.querySelector('[data-name="productCategory"]');

            if (!category) {
              return;
            }

            const exchange = row.querySelector('[data-name="exchangeAbbr"]').innerText;
            let [symbol, isin] = span.innerText.split('| ');

            symbol = normalizeSymbol(symbol);

            switch (category.innerText) {
              case 'A':
              case 'B':
                category.classList.add('category-a');
                break;
              case 'C':
                category.classList.add('category-c');
                break;
              case 'D':
                category.classList.add('category-d');
                break;
            }

            const titleHTML = row.querySelector('[data-name="productName"]');

            let ICONS = [];
            switch (exchange) {
              case 'NSY':
                ICONS = NYSE_ICONS;
                break;
              case 'NDQ':
                ICONS = NASDAQ_ICONS;
                break;
              case 'XET':
                ICONS = XETRA_ICONS;
                break;
              case 'TDG':
              case 'FRA':
                ICONS = TRADEGATE_ICONS;
                break;
              case 'LSE':
                ICONS = LSE_ICONS;
                break;
              case 'TOR':
                ICONS = TSX_ICONS;
                break;
              case 'OMX':
                ICONS = OMX_ICONS;
                break;
              default:
                return;
            }

            if (ICONS[symbol]) {
              titleHTML.innerHTML = createIcon(ICONS[symbol], titleHTML.innerText);
            } else {
              titleHTML.innerHTML = `<span>${symbol[0]}</span>${titleHTML.innerText}`;
            }
          })
        }

        // рабочая схема
        // if (mutation.target.firstChild.getAttribute('data-name') === 'positions') {
        //   console.log(mutation);
        //   console.log(mutation.target.firstChild.querySelector('tbody').children.length);
        //   // break;
        // }

        // mutation.addedNodes.forEach(node => {
        //   console.log(node);
        //   // if (node.tagName === 'TR' && node.querySelector('[data-name="symbolIsin"]').innerText.contains('ARCC')) {
        //   //   console.log(node.querySelector('span[data-name="symbolName"]').innerText);
        //   // }
        // });
      }
    }
  }
});

function createIcon(url, title) {
  return `<img alt="" class="stock-icon" width="30" height="30" src="${iconUrlBase}${url}.svg"/><span>${title}</span>`;
}

function normalizeSymbol(symbol) {
  const [normalized] = symbol.trim().split('^');
  return normalized;
}

observer.observe(document, {
  childList: true,
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
      "hide_side_toolbar": true,
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

const baseURL = 'https://s3-symbol-logo.tradingview.com/';

// Create a functional react component with a state

const iconUrlBase = 'https://s3-symbol-logo.tradingview.com/';
