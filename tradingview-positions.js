let bottomArea = null;

// Create a MutationObserver instance
const observer = new MutationObserver((mutationsList, observerInstance) => {
  for (const mutation of mutationsList) {
    // Loop through all added nodes in this mutation
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if the added node matches your target criteria
        // For example, by ID, class, tag name, etc.

        // If node's class contains 'layout__area--bottom'
        if (node.classList.contains('layout__area--bottom')) {
          observerInstance.disconnect(); // Stop observing after finding the target
          observeDOM(node); // Observe the target node for further mutations
          return;
        }

        // Example 1: By ID
        if (node.id === 'bottom-area') {
          bottomArea = node;
          observerInstance.disconnect();
          observeDOM(node); // Observe the target node for further mutations
          setTimeout(() => {
            // createPositionsPopup(node);
          }, 10000);
          return;
        }

        if (node.className.startsWith("headerWrapper")) {
          const brokerBlock = node.querySelector('[class^="brokerBlock"]');

          // Create a button to open the positions in a new window by cloning an existing button to preserve styles
          const button = document.querySelector('#header-toolbar-properties').cloneNode(true);

          // Replace icon with a new one
          button.querySelector('span').innerHTML = `<svg fill="currentColor" width="22px" height="22px" viewBox="-3.6 -3.6 43.20 43.20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.072"></g><g id="SVGRepo_iconCarrier"><path class="clr-i-outline clr-i-outline-path-1" d="M27,33H5a2,2,0,0,1-2-2V9A2,2,0,0,1,5,7H15V9H5V31H27V21h2V31A2,2,0,0,1,27,33Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M18,3a1,1,0,0,0,0,2H29.59L15.74,18.85a1,1,0,1,0,1.41,1.41L31,6.41V18a1,1,0,0,0,2,0V3Z"></path> <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect> </g></svg>`;
          button.setAttribute('data-tooltip', 'Popup to new window');
          button.classList.add('popup-to-new-window');

          // Set handler
          button.onclick = () => {
            createPositionsPopup(bottomArea);
            document.querySelector('[data-name="toggle-visibility-button"]').click();
          };

          // Add button to the DOM
          brokerBlock.appendChild(button);

          // Stop observer
          observerInstance.disconnect();
        }
      }
    }
  }
});

// Function to observe DOM mutations
function observeDOM(targetNode = document) {
  if (!targetNode) {
    console.error('Unable to find the target node to observe.');
    return;
  }

  // Define the observer options
  const config = {
    childList: true, // Listen for added or removed child elements
    subtree: true    // Observe all descendants, not just direct children
  };

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

observeDOM();

function createPositionsPopup(bottomArea) {
  const newWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!newWindow) {
    alert('Unable to open a new window. Please allow pop-ups for this site.');
    return;
  }

  // Close the child when parent unloads
  window.addEventListener("beforeunload", () => {
    if (newWindow && !newWindow.closed) {
      newWindow.close();
    }
  });

  // Clone the <head> Content (Styles)
  let headContent = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    headContent += node.outerHTML;
  });

  // (Optional) Clone the <base> Tag
  const baseTag = document.querySelector('base');
  if (baseTag) {
    headContent = baseTag.outerHTML + headContent;
  }

  // Copy All Classes from the Original <html> Element
  const originalHtmlClasses = document.documentElement.className; // Get class names as a string
  // Ensure proper escaping of class names if necessary
  const sanitizedHtmlClasses = originalHtmlClasses.replace(/"/g, '&quot;');

  // Construct the Complete HTML for the New Window
  const completeHTML = `
      <!DOCTYPE html>
      <html class="${sanitizedHtmlClasses}">
      <head>
          <meta charset="UTF-8">
          <title>Moved Element</title>
          ${headContent}
          <style>
            body {
              overflow: auto !important;
            }
          
            #bottom-area {
              height: 100vh !important;  
            }
            
            .bottom-widgetbar-loading-overlay,
            .bottom-widgetbar-content {
              display: none !important;
            }
            
            .paper_trading {
              display: flex !important;
            }
            
            [data-account-manager-page-id="positions"] {
              [data-row-linked="false"] {
                &:hover td {
                  background-color: #1b1f2a !important;
                }
              }
            
              [data-row-linked="true"] {
                td {
                  background-color: #2a2e39 !important;
                }
              }
            }
            
            .popup-to-new-window {
              display: none !important;
            }
            
            [data-label="Symbol"] {
              .ka-cell-text,
              [class^="wrapper-"] {
                width: 100% !important;
              }
              
              [class^="wrapper-"] {
                align-items: center;
              }
            
              .company-name {
                flex-grow: 1;
              }
              
              img {
                border-radius: 4px !important;
              }
            }
          </style>
      </head>
      <body></body>
      </html>
  `;

  // Write the HTML to the New Window
  newWindow.document.open();
  newWindow.document.write(completeHTML);
  newWindow.document.close();

  const currentParent = bottomArea.parentNode;
  currentParent.removeChild(bottomArea);

  // Move the Element to the New Window's Body
  newWindow.document.body.appendChild(bottomArea);

  // Set attributes observer to scroll positions into view
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'attributes'
        && mutation.attributeName === 'data-row-linked'
        && mutation.target.getAttribute('data-row-linked') === 'true'
      ) {
        mutation.target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        for (const node of mutation.addedNodes) {
          // Update titles
          if (node.classList.contains('ka-table-wrapper')) {
            for (const tr of node.querySelector('tbody').children) {
              extendTitle(tr);
            }
          }
        }
      }
    });
  });

  // Start observing the positions table
  observer.observe(bottomArea.querySelector('[data-account-manager-page-id="positions"]'), {
    attributes: true,
    childList: true,
    characterData: true,
    attributeFilter: ['data-row-linked'],
    subtree: true
  });

  // (Optional) Focus on the New Window
  newWindow.focus();
}

function extendTitle(tr) {
  const badge = tr.querySelector('[data-tooltip]');
  const fullTitle = badge.getAttribute('data-tooltip');
  const span = document.createElement('span');
  span.classList.add('company-name');
  span.innerText = removeTickerFromTitle(fullTitle);
  badge.insertAdjacentElement('beforebegin', span);
}

function removeTickerFromTitle(title) {
  return title.split(' - ')[1];
}