let keywords = JSON.parse(localStorage.getItem('job_keywords')) || [];
let jobLogs = JSON.parse(localStorage.getItem('job_logs')) || [];

window.onload = () => {
    loadSettings();
    renderKeywords();
    renderJobLogs();
};

function addKeyword() {
    const input = document.getElementById('new-keyword');
    const text = input.value.trim();
    if (text && !keywords.find(k => k.text === text)) {
        keywords.push({ text, starred: true });
        saveKeywords();
        input.value = '';
    }
}

function toggleStar(index) {
    keywords[index].starred = !keywords[index].starred;
    saveKeywords();
}

function removeKeyword(index) {
    keywords.splice(index, 1);
    saveKeywords();
}

function saveKeywords() {
    localStorage.setItem('job_keywords', JSON.stringify(keywords));
    renderKeywords();
}

function renderKeywords() {
    const container = document.getElementById('keyword-tags');
    container.innerHTML = keywords.map((k, i) => `
        <div class="tag ${k.starred ? 'starred' : ''}" onclick="toggleStar(${i})">
            <span>${k.starred ? '★' : '☆'}</span> ${k.text}
            <span onclick="event.stopPropagation(); removeKeyword(${i})" style="color:red; margin-left:5px;">×</span>
        </div>
    `).join('');
}

function saveLocation() {
    const loc = document.getElementById('location-select').value;
    localStorage.setItem('job_location', loc);
}

function loadSettings() {
    const loc = localStorage.getItem('job_location');
    if (loc) document.getElementById('location-select').value = loc;
}

function getActiveQuery() {
    const active = keywords.filter(k => k.starred).map(k => k.text);
    return active.length > 0 ? active.join(' ') : '';
}

function searchLinkedIn() {
    const query = getActiveQuery();
    const loc = document.getElementById('location-select').value;
    if (!query) return alert("Välj och stjärnmarkera sökord först!");
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(loc)}`, '_blank');
}

async function searchAF() {
    const query = getActiveQuery();
    const loc = document.getElementById('location-select').value;
    const resDiv = document.getElementById('af-results');
    if (!query) return alert("Välj och stjärnmarkera sökord först!");

    resDiv.innerHTML = "<p style='grid-column: 1/-1;'>Söker...</p>";
    try {
        const res = await fetch(`https://jobsearch.api.jobtechdev.se/search?q=${encodeURIComponent(query)}&l=${encodeURIComponent(loc)}&limit=10`);
        const data = await res.json();
        displayAFJobs(data.hits);
    } catch (e) { resDiv.innerHTML = "<p style='grid-column: 1/-1;'>Kunde inte hämta data.</p>"; }
}

function displayAFJobs(jobs) {
    const resultsDiv = document.getElementById('af-results');
    if (!jobs || jobs.length === 0) {
        resultsDiv.innerHTML = "<p style='grid-column: 1/-1;'>Inga träffar hittades.</p>";
        return;
    }
    resultsDiv.innerHTML = jobs.map(j => `
        <a href="${j.webpage_url}" target="_blank" class="job-card">
            <strong>${j.headline}</strong>
            <div class="employer">${j.employer.name}</div>
        </a>
    `).join('');
}

function addJobLog() {
    const company = document.getElementById('log-company').value;
    const role = document.getElementById('log-role').value;
    if (company && role) {
        jobLogs.unshift({ company, role, date: new Date().toLocaleDateString() });
        localStorage.setItem('job_logs', JSON.stringify(jobLogs));
        renderJobLogs();
        document.getElementById('log-company').value = '';
        document.getElementById('log-role').value = '';
    }
}

function renderJobLogs() {
    const list = document.getElementById('job-list');
    list.innerHTML = jobLogs.map(j => `<li><strong>${j.company}</strong> - ${j.role} <br><small>${j.date}</small></li>`).join('');
}