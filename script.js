document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');
    const resultsTableBody = document.querySelector('#results-table tbody');

    const filterSection = document.getElementById('filter-section');
    const filterDate = document.getElementById('filter-date');
    const filterRoom = document.getElementById('filter-room');
    const filterShift = document.getElementById('filter-shift');

    let currentResults = [];

    // Toggle room filter visibility based on search type
    searchType.addEventListener('change', () => {
        if (searchType.value === 'room') {
            filterRoom.style.display = 'none';
        } else {
            filterRoom.style.display = 'block';
        }
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        const type = searchType.value;

        if (!query) {
            alert("Please enter a search term.");
            return;
        }

        const endpoint = type === 'teacher'
            ? `https://exam-inv-list-search.onrender.com/search/teacher?name=${encodeURIComponent(query)}`
            : `https://exam-inv-list-search.onrender.com/search/room?room=${encodeURIComponent(query)}`;

        fetch(endpoint)
            .then(res => {
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                currentResults = data;
                displayResults(data);
                filterSection.classList.remove('hidden');
                if (type === 'room') {
                    filterRoom.style.display = 'none';
                } else {
                    filterRoom.style.display = 'block';
                }
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                alert('Something went wrong. Please try again.');
            });
    });

    [filterDate, filterRoom, filterShift].forEach(input => {
        input.addEventListener('input', () => {
            displayResults(currentResults);
        });
    });

    function applyFilters(item) {
        const date = filterDate.value.trim().toLowerCase();
        const room = filterRoom.value.trim().toLowerCase();
        const shift = filterShift.value;
        const isTeacherSearch = searchType.value === 'teacher';

        if (date && !item.date.toLowerCase().includes(date)) return false;
        if (isTeacherSearch && room && !item.room.toLowerCase().includes(room)) return false;
        if (shift === 'morning' && !item.duration.includes('10:00')) return false;
        if (shift === 'afternoon' && !item.duration.includes('5:00')) return false;

        return true;
    }

    function displayResults(data) {
        resultsTableBody.innerHTML = '';
        data.forEach(item => {
            if (applyFilters(item)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.duration}</td>
                    <td>${item.room}</td>
                    <td>${item.teacher}</td>
                `;
                resultsTableBody.appendChild(row);
            }
        });
    }
});
