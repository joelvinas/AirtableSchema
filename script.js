document.addEventListener('DOMContentLoaded', () => {
    fetchSchema();
});

async function fetchSchema() {
    const errorContainer = document.getElementById('error-message');
    const tablesContainer = document.getElementById('tables-container');

    try {
        const response = await fetch('./schema.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const schemaData = await response.json();

        if (!schemaData.tables || !Array.isArray(schemaData.tables)) {
            throw new Error("Invalid schema format: Expected top-level 'tables' array.");
        }

        renderTables(schemaData.tables);
    } catch (error) {
        errorContainer.textContent = `Error loading schema.json: ${error.message}. Note: Local fetch requires running via a local web server (e.g., Live Server, http-server, or python -m http.server).`;
        errorContainer.classList.remove('hidden');
    }
}

function renderTables(tables) {
    const container = document.getElementById('tables-container');
    container.innerHTML = '';

    tables.forEach((table) => {
        const fieldCount = table.fields ? table.fields.length : 0;
        // Record count reads from schema if present, defaults to 0
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

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}