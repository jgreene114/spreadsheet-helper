const routes = {
  '#home': 'home.html',
  '#data-list': 'data-list.html',
};

async function router() {
  const hash = window.location.hash || '#home'; // Default to '#home' if no hash
  let file = 'sub_pages/' + routes[hash];
  
  if (file) {
    try {
      await loadGSheetData()
      switch (hash) {
        case '#data-list': {
          $("#app").html(displayData(G$V.data))
          break;
        }
        case '#home': {
          $("#app").html(displayHomeView(G$V.data));
          break;
        }
        default: {
          let response = await fetch(file);
          if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.statusText}`);
          }
          const content = await response.text();
          $("#app").html(content);
          break;
        }
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
window.addEventListener('load', router);
window.addEventListener('dataUpdate', router);


