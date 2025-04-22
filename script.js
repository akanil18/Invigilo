document.addEventListener('DOMContentLoaded', () => {
    const navSearch = document.getElementById('nav-search');
    const navUpload = document.getElementById('nav-upload');
    const searchSection = document.getElementById('search-section');
    const uploadSection = document.getElementById('upload-section');

    // Toggle sections
    navSearch.addEventListener('click', () => {
        searchSection.style.display = 'block';
        uploadSection.style.display = 'none';
    });

    navUpload.addEventListener('click', () => {
        searchSection.style.display = 'none';
        uploadSection.style.display = 'block';
    });

    const searchButton = document.getElementById('search-button');
    const searchType = document.getElementById('search-type');
    const searchInput = document.getElementById('search-input');
    const resultsTableBody = document.querySelector('#results-table tbody');

    const filterDate = document.getElementById('filter-date');
    const filterRoom = document.getElementById('filter-room');
    const filterShift = document.getElementById('filter-shift');

    let currentResults = [];

    searchButton.addEventListener('click', () => {
        const type = searchType.value;
        const query = searchInput.value.trim();
        if (!query) {
            alert("Please enter a search term.");
            return;
        }

        let url;
        if (type === 'teacher') {
            url = `https://exam-inv-list-search.onrender.com/search/teacher?name=${encodeURIComponent(query)}`;
        } else {
            url = `https://exam-inv-list-search.onrender.com/search/room?room=${encodeURIComponent(query)}`;
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error("Expected array but got: " + JSON.stringify(data));
                }
                currentResults = data;
                displayResults(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert("Something went wrong: " + error.message);
            });
    });

    // Filters on change
    [filterDate, filterRoom, filterShift].forEach(filter => {
        filter.addEventListener('input', () => {
            displayResults(currentResults);
        });
    });

    function applyFilters(item) {
        const date = filterDate.value;
        const room = filterRoom.value.trim().toLowerCase();
        const shift = filterShift.value;
    
        if (date && !item.teacher.includes(date)) {
            return false;
        }
    
        // Change here: Check if the room includes the search term (instead of exact match)
        if (room && !item.room.toLowerCase().includes(room)) {
            return false;
        }
    
        const duration = item.duration;
        if (shift === 'morning' && !duration.includes('10:00')) {
            return false;
        }
        if (shift === 'afternoon' && !duration.includes('2:30')) {
            return false;
        }
    
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

    // Upload form
    const uploadForm = document.getElementById('upload-form');
    const pdfFileInput = document.getElementById('pdf-file');

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const file = pdfFileInput.files[0];
        if (!file) {
            alert('Please select a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch('https://exam-inv-list-search.onrender.com/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert('PDF uploaded successfully!');
                uploadForm.reset();
            } else {
                alert('Failed to upload PDF.');
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            alert('Error uploading file.');
        });
    });
});
