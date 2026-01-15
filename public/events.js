function formatEventDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getEventEmoji(title) {
  const lower = title.toLowerCase();
  if (lower.includes("karaoke")) return "🎤";
  if (lower.includes("bingo")) return "🎲";
  if (lower.includes("trivia")) return "🧠";
  if (lower.includes("concert") || lower.includes("music")) return "🎶";
  if (lower.includes("sports") || lower.includes("game")) return "🏒";
  return "🎉"; // default
}

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('event-carousel');
  let currentIndex = 0;
  let eventCards = [];

  fetch('sarnia_events.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load events');
      return response.json();
    })
    .then(events => {
      if (!Array.isArray(events) || events.length === 0) {
        carousel.innerHTML = '<p>No upcoming events found.</p>';
        return;
      }

      eventCards = events.map(event => `
        <div class="event-card">
          <h3>${getEventEmoji(event.title)} <a href="${event.link || '#'}" target="_blank">${event.title}</a></h3>
          <p>📍 <strong>Location:</strong> ${event.location || "TBA"}</p>
          <p>📅 <strong>Date:</strong> ${formatEventDate(event.date)}</p>
        </div>
      `);

      function renderCard(index) {
        carousel.innerHTML = eventCards[index];
      }

      renderCard(currentIndex);

      setInterval(() => {
        currentIndex = (currentIndex + 1) % eventCards.length;
        renderCard(currentIndex);
      }, 4000); // scroll every 4 seconds
    })
    .catch(error => {
      console.error('Error loading events:', error);
      carousel.innerHTML = '<p>Error loading events. Please try again later.</p>';
    });
});