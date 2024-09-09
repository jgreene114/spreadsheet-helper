function clean_gSheet_data (data) {
  let unique_options = new Set();
  try {
    if (!data || data.length === 0) throw 'No data present';
    const headers = data[0];
    const cleanData = data.slice(1).map(row => {
      const obj = {};
      headers.forEach(( header, index ) => {
        switch (header) {
          case 'datetime': {
            let date = new Date(row[index])
            let _date = moment(date)
            obj[header] = date || ""
            obj.Date = _date.format("YYYY-MM-DD h:mm A");
            break;
          }
          case 'options': {
            try {
              let opts = JSON.parse(row[index])
              Object.keys(opts).forEach((key) => {unique_options.add(key)})
              obj[header] = opts
            } catch (e) {
              if (row[index]) unique_options.add(row[index])
              obj[header] = row[index] || '';
            }
            break
          }
          default: {
            obj[header] = row[index] || ''; // Handle cases where row might be shorter
          }
        }
        
      });
      return obj;
    });
    let sortedData = cleanData.sort(function (a, b) {return a.datetime - b.datetime})
    
    return [sortedData, unique_options];
    
  } catch (error) {
    console.error('Error loading sheet data:', error.message);
    throw error; // Re-throw error if needed
  }
  
}


function displayData(data) {
  if (!data || data.length === 0) {
    return '<h1>No data available</h1>';
  }
  
  let html = '<table class="data-table"><thead><tr>';
  let skip_headers = ['datetime', 'options', 'note']
  // Add headers
  const headers = Object.keys(data[0]);
  headers.forEach(header => {
    if (!skip_headers.includes(header)) {
      html += `<th>${header}</th>`;
    }
  });
  html += '</tr></thead><tbody>';
  
  // Add rows
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      if (!skip_headers.includes(header)) {
        html += `<td>${row[header] || ''}</td>`;
      }
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
}

function displayHomeView(_data) {
  if (!_data || _data.length === 0) {
    console.error('No data present');
    return '<h1>No data available</h1>';
  }
  const now = moment();
  const last24hrs = moment().subtract(24, 'hours'); // Now minus 24 hours
  
  // let now = new Date();
  // let last24hr = new Date(now.getTime() - 24 * 60*60*1000);
  //
  // const data = _data.filter(d => {return d.datetime <= last24hr})
  const data = _data.filter(d => {
    const itemDate = moment(d.datetime); // Assuming 'datetime' is in a format moment can parse
    let _match = itemDate.isBetween(last24hrs, now); // Check if the datetime is within the last 24 hours
    return _match
  });
  
  let item = {
    'datetime': new Date(),
    'note': 'afsdfasdfdsfadsf note!!!'
  }
  
  let html = ''
  html += `<button onclick="appendToGSheet(${JSON.stringify(item)})">Add to GSheet</button>`;
  
  html += displayData(data)
  
  return html;
}

