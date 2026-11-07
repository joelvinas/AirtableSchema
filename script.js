document.addEventListener('DOMContentLoaded', () => {
    fetchSchema();
    setupCopyButton();
});

async function fetchSchema() {
    const errorContainer = document.getElementById('error-message');

    try {
        const response = await fetch('./schema.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const schemaData = await response.json();

        if (!schemaData.tables || !Array.isArray(schemaData.tables)) {
            throw new Error("Invalid schema format: Expected top-level 'tables' array.");
        }

        renderSummaryGrid(schemaData.tables);
        renderTables(schemaData.tables);
    } catch (error) {
        errorContainer.textContent = `Error loading schema.json: ${error.message}. Note: Local fetch requires running via a local web server (e.g., Live Server, http-server, or python -m http.server).`;
        errorContainer.classList.remove('hidden');
    }
}

function renderSummaryGrid(tables) {
    const gridBody = document.getElementById('summary-grid-body');
    gridBody.innerHTML = '';

    tables.forEach((table) => {
        const fieldCount = table.fields ? table.fields.length : 0;
        const recordCount = table.recordsCount !== undefined ? table.recordsCount : (table.records ? table.records.length : 0);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(table.name || 'Unnamed Table')}</td>
            <td>${escapeHtml(table.id || 'N/A')}</td>
            <td>${fieldCount}</td>
            <td>${recordCount}</td>
        `;
        gridBody.appendChild(row);
    });
}

function renderTables(tables) {
    const container = document.getElementById('tables-container');
    container.innerHTML = '';

    tables.forEach((table) => {
        const fieldCount = table.fields ? table.fields.length : 0;
        const recordCount = table.recordsCount !== undefined ? table.recordsCount : (table.records ? table.records.length : 0);

        const card = document.createElement('div');
        card.className = 'table-card';

        card.innerHTML = `
            <div class="table-header">
                <div class="table-title">
                    <h2>${escapeHtml(table.name || 'Unnamed Table')}</h2>
                    <span class="table-id">${escapeHtml(table.id || 'N/A')}</span>
                </div>
                <div class="table-stats">
                    <span class="stat-badge">Fields: ${fieldCount}</span>
                    <span class="stat-badge">Records: ${recordCount}</span>
                </div>
            </div>
            
            <button class="collapsible-trigger">
                <span>View Field Details</span>
                <span class="arrow-icon">▼</span>
            </button>
            
            <div class="collapsible-content">
                <table class="fields-table">
                    <thead>
                        <tr>
                            <th>Field Name</th>
                            <th>Field ID</th>
                            <th>Data Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderFieldsList(table.fields || [])}
                    </tbody>
                </table>
            </div>
        `;

        container.appendChild(card);
    });

    setupCollapsibles();
}

function renderFieldsList(fields) {
    if (fields.length === 0) {
        return `<tr><td colspan="3" style="text-align:center; color: var(--text-secondary);">No fields defined</td></tr>`;
    }

    return fields.map(field => `
        <tr>
            <td><strong>${escapeHtml(field.name || '')}</strong></td>
            <td><code class="table-id">${escapeHtml(field.id || '')}</code></td>
            <td><span class="type-tag">${escapeHtml(field.type || 'unknown')}</span></td>
        </tr>
    `).join('');
}

function setupCollapsibles() {
    const triggers = document.querySelectorAll('.collapsible-trigger');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

function setupCopyButton() {
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', () => {
        const table = document.getElementById('summary-excel-table');
        let tsvContent = '';

        // Extract headers
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        tsvContent += headers.join('\t') + '\n';

        // Extract rows
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
            tsvContent += cells.join('\t') + '\n';
        });

        // Copy TSV string to clipboard
        navigator.clipboard.writeText(tsvContent).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#059669';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            alert('Failed to copy to clipboard: ' + err);
        });
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}