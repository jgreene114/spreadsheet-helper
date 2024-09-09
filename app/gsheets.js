
let initComplete = false;  // This will track if the API client has been initialized

// Start and initialize Google API client
function start() {
  gapi.load('client', initClient);
}

async function initClient() {
  try {
    await gapi.client.init({
      apiKey: G$V.gConfigParams.api_key,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    });
    
    await loadGSheetData();  // Load the Google Sheets data once the client is ready
    initComplete = true;     // Set the flag to indicate the API is ready
    router();                // Trigger the router after initialization is complete
  } catch (err) {
    console.error("Error initializing Google API Client:", err.error.message);
  }
}

// Function to fetch and process data from Google Sheets
async function loadGSheetData() {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: G$V.gConfigParams.spreadsheet_id,
      range: 'Sheet1!A1:C',
    });
    
    const range = response.result.values;
    const [sortedData, uniqueOptions] = clean_gSheet_data(range);
    G$V.data = sortedData;
    G$V.unique_options = uniqueOptions;

    console.log("G$V.data", G$V.data);
    console.log("G$V.unique_options", G$V.unique_options);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function appendToGSheet(item) {
  try {
    const response = gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: G$V.gConfigParams.spreadsheet_id,
      range: 'Sheet1!A1:C',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: Object.values(item),
      }
    })
    window.dispatchEvent('dataUpdate')
  } catch (error) {
    console.error('Error appending data', error);
    throw error;
  }
}


// Router function to handle navigation
async function router() {
  const hash = window.location.hash || '#home'; // Default to '#home' if no hash
  let file = 'sub_pages/' + routes[hash];
  
  if (file) {
    try {
      if (!initComplete && hash === '#data-list') {
        $('#app').html('<h1>Loading...</h1>'); // Display a loading message if API is not ready yet
        return;  // Exit the router until the API is ready
      }
      
      if (hash === '#data-list') {
        // Data-list route - load and display the Google Sheets data
        $("#app").html(displayData(G$V.data));
      } else {
        // Load static HTML page
        let response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to load ${file}: ${response.statusText}`);
        }
        const content = await response.text();
        $("#app").html(content);
      }
    } catch (error) {
      console.error(error);
      $('#app').html('<h1>Error loading page</h1>');
    }
  } else {
    $('#app').html('<h1>Page not found</h1>');
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
  if (initComplete) {
    router();  // Run the router immediately if API is already initialized
  }
});

// Load the API client library
gapi.load('client', start);
