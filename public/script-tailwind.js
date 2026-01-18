/* ================================================================ */
/* TAILWIND-COMPATIBLE SCRIPT UPDATES                              */
/* Overrides for dynamically injected content with Tailwind classes*/
/* ================================================================ */

// Border Wait Times with Tailwind
function updateBorderWaitsTailwind() {
  fetch('/api/border-wait')
    .then(res => res.json())
    .then(data => {
      console.log('Parsed data:', data);

      const usPassenger = data.usa.passenger?.USbound || 'N/A';
      const usCommercial = data.usa.commercial?.USbound || 'N/A';
      const caPassenger = data.canada.passenger?.CAbound || 'N/A';
      const caCommercial = data.canada.commercial?.CAbound || 'N/A';

      let updated = null;
      if (data.usa?.lastUpdated && data.canada?.lastUpdated) {
        const usaTime = new Date(data.usa.lastUpdated).getTime();
        const canadaTime = new Date(data.canada.lastUpdated).getTime();
        updated = new Date(Math.max(usaTime, canadaTime));
      } else if (data.usa?.lastUpdated) {
        updated = new Date(data.usa.lastUpdated);
      } else if (data.canada?.lastUpdated) {
        updated = new Date(data.canada.lastUpdated);
      }

      let timeString = "Unknown";
      let dateString = "Unknown";

      if (updated && !isNaN(updated.getTime())) {
        timeString = updated.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
        dateString = updated.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
      }

      document.getElementById("border-time").innerText = `${dateString} @ ${timeString}`;

      const getStatusColor = (value) => {
        if (!value || value === "N/A" || value.includes("no wait times")) return "text-gray-400";
        if (value === "No Delay" || value === "0 min") return "text-green-600";
        const minutesMatch = value.match(/(\d+)\s*(min|minutes?)/i);
        if (minutesMatch) {
          const minutes = parseInt(minutesMatch[1]);
          if (minutes <= 5) return "text-yellow-500";
          if (minutes <= 15) return "text-orange-500";
          return "text-red-600";
        }
        return "text-gray-500";
      };

      const html = `
        <div class="space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
            <h3 class="font-semibold text-sm text-gray-700 mb-2">🇺🇸 Blue Water Bridge → USA Bound</h3>
            <div class="space-y-1 text-sm">
              <p class="${getStatusColor(usPassenger)} flex items-center gap-2">
                <span>🚗</span> <span class="font-medium">Passenger:</span> <span>${usPassenger}</span>
              </p>
              <p class="${getStatusColor(usCommercial)} flex items-center gap-2">
                <span>🚛</span> <span class="font-medium">Commercial:</span> <span>${usCommercial}</span>
              </p>
            </div>
          </div>

          <div class="bg-red-50 border-l-4 border-red-600 p-3 rounded">
            <h3 class="font-semibold text-sm text-gray-700 mb-2">🇨🇦 Blue Water Bridge → Canada Bound</h3>
            <div class="space-y-1 text-sm">
              <p class="${getStatusColor(caPassenger)} flex items-center gap-2">
                <span>🚗</span> <span class="font-medium">Passenger:</span> <span>${caPassenger}</span>
              </p>
              <p class="${getStatusColor(caCommercial)} flex items-center gap-2">
                <span>🚛</span> <span class="font-medium">Commercial:</span> <span>${caCommercial}</span>
              </p>
            </div>
          </div>
        </div>
      `;

      const allValues = [usPassenger, usCommercial, caPassenger, caCommercial];
      const allNA = allValues.every(val => val === 'N/A');

      if (allNA) {
        document.getElementById("border-data").innerHTML =
          `<div class="text-center text-gray-500 py-8">
             <p>Border wait data currently unavailable or outdated.</p>
             <p class="text-sm mt-2">Last checked: ${dateString} @ ${timeString}</p>
           </div>`;
      } else {
        document.getElementById("border-data").innerHTML = html;
      }
    })
    .catch(error => {
      console.error('CBSA fetch failed:', error);
      document.getElementById('border-data').innerHTML =
        `<div class="text-center text-red-500 py-8">Error loading border wait times.</div>`;
    });
}

// Weather Forecast with Tailwind
const renderTodayTailwind = (data) => {
  const container = document.getElementById('today-container');
  container.innerHTML = '';

  ['morning', 'afternoon', 'evening'].forEach(time => {
    const icon = data[time].icon;
    const block = document.createElement('div');
    block.className = 'flex flex-col items-center gap-1 p-2 bg-gray-50 rounded border border-gray-200 text-center';
    block.innerHTML = `
      <div class="font-semibold text-xs text-primary capitalize">${time}</div>
      <img src="https://openweathermap.org/img/wn/${typeof icon === 'string' ? icon : '03d'}@2x.png" 
           alt="${data[time].condition}" 
           class="w-10 h-10" />
      <div class="text-xs text-gray-700">${data[time].temp}</div>
      <div class="text-xs text-gray-500">${data[time].condition}</div>
    `;
    container.appendChild(block);
  });
};

const renderThreeDayTailwind = (data) => {
  const container = document.getElementById('three-day-container');
  container.innerHTML = '';

  Object.entries(data).forEach(([day, info]) => {
    const icon = info.icon;
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center gap-1 p-2 bg-gray-50 rounded border border-gray-200 text-center';
    card.innerHTML = `
      <div class="font-semibold text-xs text-primary">${day}</div>
      <img src="https://openweathermap.org/img/wn/${typeof icon === 'string' ? icon : '03d'}@2x.png" 
           alt="${info.condition}" 
           class="w-10 h-10" />
      <div class="text-xs text-gray-700">${info.high} / ${info.low}</div>
      <div class="text-xs text-gray-500">${info.condition}</div>
    `;
    container.appendChild(card);
  });
};

// VIA Rail with Tailwind
function fetchViaRailDataTailwind() {
  const container = document.getElementById('via-rail-data');
  if (!container) return;

  container.innerHTML = '<p class="text-gray-500 text-sm">Loading VIA Rail data...</p>';

  fetch('/api/via-rail')
    .then(res => res.json())
    .then(data => {
      if (!data || !data.trains || data.trains.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No train data available.</p>';
        return;
      }

      const table = document.createElement('table');
      table.className = 'w-full text-xs border-collapse';

      table.innerHTML = `
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 font-semibold">Train</th>
            <th class="p-2 font-semibold">Scheduled</th>
            <th class="p-2 font-semibold">Estimated</th>
            <th class="p-2 font-semibold">Delay</th>
          </tr>
        </thead>
        <tbody></tbody>`;

      const tbody = table.querySelector('tbody');

      data.trains.forEach(train => {
        if (train.status === 'active') {
          if (train.stations.length === 0) {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200';
            row.innerHTML = `
              <td class="p-2 font-medium">${train.train}</td>
              <td colspan="3" class="p-2 text-gray-500">No station data available</td>`;
            tbody.appendChild(row);
          } else {
            train.stations.forEach(station => {
              const delayNum = parseInt(station.delay);
              let delayClass = 'text-gray-500';
              
              if (!isNaN(delayNum)) {
                if (delayNum === 0) delayClass = 'text-green-600';
                else if (delayNum <= 5) delayClass = 'text-yellow-500';
                else if (delayNum <= 15) delayClass = 'text-orange-500';
                else delayClass = 'text-red-600';
              } else if (station.delay.toLowerCase().includes('on time')) {
                delayClass = 'text-green-600';
              }
              
              const row = document.createElement('tr');
              row.className = 'border-b border-gray-200 hover:bg-gray-50';
              row.innerHTML = `
                <td class="p-2 font-medium">${train.train}</td>
                <td class="p-2">${station.scheduled}</td>
                <td class="p-2">${station.expected}</td>
                <td class="p-2 font-semibold ${delayClass}">${station.delay}</td>`;
              tbody.appendChild(row);
            });
          }
        }
      });

      container.innerHTML = '';
      container.appendChild(table);
    })
    .catch(err => {
      console.error('VIA Rail fetch failed:', err);
      container.innerHTML = '<p class="text-red-500 text-sm">Error loading train data.</p>';
    });
}

// Initialize Tailwind version if on index-tailwind.html
if (window.location.pathname.includes('index-tailwind') || document.querySelector('script[src*="tailwindcss"]')) {
  console.log('✅ Tailwind mode detected - using Tailwind-compatible renders');
  
  // Override original functions
  if (typeof updateBorderWaits !== 'undefined') {
    updateBorderWaits = updateBorderWaitsTailwind;
  }
  if (typeof renderToday !== 'undefined') {
    renderToday = renderTodayTailwind;
  }
  if (typeof renderThreeDay !== 'undefined') {
    renderThreeDay = renderThreeDayTailwind;
  }
  if (typeof fetchViaRailData !== 'undefined') {
    fetchViaRailData = fetchViaRailDataTailwind;
  }
  
  // Call the Tailwind versions
  updateBorderWaitsTailwind();
  setInterval(updateBorderWaitsTailwind, 60000);
  
  fetch('/weather/today')
    .then(res => res.json())
    .then(renderTodayTailwind)
    .catch(err => console.error('Today forecast error:', err));
  
  fetch('/weather/threeday')
    .then(res => res.json())
    .then(renderThreeDayTailwind)
    .catch(err => console.error('3-day forecast error:', err));
  
  fetchViaRailDataTailwind();
  setInterval(fetchViaRailDataTailwind, 300000);
}
