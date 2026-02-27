// Navigation
function handleGlobalNav(targetView) {
    if (document.referrer.includes('index.html') && localStorage.getItem('targetView') === targetView) {
        history.back();
    } else {
        localStorage.setItem('targetView', targetView);
        window.location.href = 'index.html';
    }
}

// Initialize
async function init() {
    const caseId = localStorage.getItem('currentCaseId') || 'watergate';

    try {
        const data = await window.archiveDB.getCaseDetail(caseId);
        if (!data) throw new Error('Case not found');

        renderHeader(data);
        renderOverview(data);
        renderTimeline(data);
        renderPlayers(data);
        renderPhysicalEvidence(data);
        renderPhysicalDocuments(data);
        renderImpact(data);
        setupPhysicalTabs();

        document.title = `${data.title} | THE ARCHIVE`;
    } catch (err) {
        console.error('Case detail load error:', err);
        document.body.innerHTML = `<div style="padding: 10rem; text-align: center; color: #ff6b6b; font-family: var(--font-serif);">ERROR: Failed to retrieve case file from secure server.</div>`;
    }
}

function renderHeader(data) {
    document.getElementById('caseHeader').innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); margin-bottom: 1rem; letter-spacing: 0.2em;">CASE_FILE_AUTOGEN: #${data.id.toUpperCase()}</div>
        <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: -0.02em; margin-bottom: 1rem; color: #111;">${data.title}</h1>
        <div style="display: flex; gap: 3rem; font-family: var(--font-mono); font-size: 0.75rem; color: #555; text-transform: uppercase; letter-spacing: 0.1em;">
            <span>Period: ${data.year}</span>
            <span>Classification: ${data.category}</span>
        </div>
    `;
}

function renderOverview(data) {
    document.getElementById('overviewContent').innerHTML = `
        <div style="margin-top: 3rem;">
            <p style="font-family: var(--font-serif); font-size: 1.25rem; line-height: 1.8; color: #222; max-width: 90%;">${data.summary}</p>
            <div style="margin: 4rem 0; height: 1px; background: repeating-linear-gradient(to right, #ccc, #ccc 2px, transparent 2px, transparent 4px);"></div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                <div>
                    <h4 style="font-family: var(--font-mono); color: #888; font-size: 0.65rem; letter-spacing:0.2em; text-transform: uppercase; margin-bottom: 1.5rem;">Historiography / Significance</h4>
                    <p style="font-family: var(--font-serif); font-size: 1.1rem; line-height: 1.7;">${data.significance}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="font-family: var(--font-mono); color: #888; font-size: 0.65rem; letter-spacing:0.2em; text-transform: uppercase; margin-bottom: 0.8rem;">Provenance</h4>
                        <p style="font-family: var(--font-serif); color: #444;">${data.location}</p>
                    </div>
                    <div>
                        <h4 style="font-family: var(--font-mono); color: #888; font-size: 0.65rem; letter-spacing:0.2em; text-transform: uppercase; margin-bottom: 0.8rem;">Archive Status</h4>
                        <p style="font-family: var(--font-serif); color: #444;">${data.status}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTimeline(data) {
    const container = document.getElementById('timelineContent');
    const timeline = data.case_timeline || [];
    container.innerHTML = `
        <div style="margin-top: 2rem;">
            ${timeline.sort((a, b) => (a.order_rank || 0) - (b.order_rank || 0)).map(item => `
                <div style="display: grid; grid-template-columns: 180px 1fr; gap: 3rem; margin-bottom: 4rem; position: relative;">
                    <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #888; padding-top: 0.4rem;">${item.date.toUpperCase()}</div>
                    <div style="border-left: 1px solid #eee; padding-left: 3rem;">
                        <div style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.8rem; color: #111;">${item.title}</div>
                        <p style="font-family: var(--font-serif); color: #555; line-height: 1.7; font-size: 1.05rem;">${item.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPlayers(data) {
    const container = document.getElementById('playersContent');
    const players = data.case_players || [];
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 2rem;">
            ${players.map(p => `
                <div style="background: #f8f8f8; padding: 2rem; border: 1px solid #eee; display: flex; flex-direction: column; gap: 1rem;">
                    <div style="font-family: var(--font-mono); font-size: 0.6rem; color: var(--accent-gold); letter-spacing: 0.2em; text-transform: uppercase;">Person of Interest</div>
                    <div style="font-family: var(--font-display); font-size: 1.4rem; color: #111;">${p.name}</div>
                    <div style="font-family: var(--font-ui); font-size: 0.8rem; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">${p.role}</div>
                    <p style="font-family: var(--font-serif); font-size: 0.9rem; color: #444; line-height: 1.6; margin-top: 0.5rem; border-top: 1px solid #eee; padding-top: 1rem;">${p.bio}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPhysicalEvidence(data) {
    const container = document.getElementById('evidenceContent');
    const evidence = data.case_evidence || [];

    if (evidence.length === 0) {
        container.innerHTML = '<p style="font-family: var(--font-serif); font-style: italic; color: #999;">No physical evidence artifacts recovered.</p>';
        return;
    }

    container.innerHTML = evidence.sort((a, b) => (a.order_rank || 0) - (b.order_rank || 0)).map((e, index) => {
        let icon = '📄';
        let extraClass = '';
        if (e.type === 'AUDIO') icon = '📼';
        if (e.type === 'PHOTO') { icon = '📷'; extraClass = 'file-photo'; }
        if (e.type === 'LOG') icon = '📒';
        if (e.type === 'FRAGMENT') { icon = '✂️'; extraClass = 'file-sticky'; }

        const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 1);

        return `
            <div class="loose-file-item ${extraClass}" style="--rotation: ${rotation}deg;">
                <div class="file-label" style="font-family: var(--font-mono); font-size: 0.6rem; color: #111;">RECORD_${index + 1}</div>
                <div class="file-type-icon">${icon}</div>
                <div style="font-family: var(--font-ui); font-weight: 600; font-size: 0.8rem; margin-bottom: 0.3rem;">${e.title}</div>
                <div style="font-family: var(--font-mono); font-size: 0.55rem; color: #999;">ID: ${data.id.substring(0, 3).toUpperCase()}/EV/${index + 1}</div>
            </div>
        `;
    }).join('');
}

function renderPhysicalDocuments(data) {
    const container = document.getElementById('documentsContent');
    const documents = data.case_documents || [];

    if (documents.length === 0) {
        container.innerHTML = '<p style="font-family: var(--font-serif); font-style: italic; color: #999;">No financial or bureaucratic documents filed.</p>';
        return;
    }

    container.innerHTML = documents.sort((a, b) => (a.order_rank || 0) - (b.order_rank || 0)).map((d, index) => {
        const rotation = (index % 2 === 0 ? -1 : 1) * (Math.random() * 3);
        return `
            <div class="loose-file-item" style="background: #fff; border: 1px solid #ddd; padding: 2rem; --rotation: ${rotation}deg;">
                <div class="file-label" style="opacity: 0.5;">DEPT_RECORDS</div>
                <div class="file-type-icon" style="font-size: 1.5rem; margin: 1rem 0;">📎</div>
                <div style="font-family: var(--font-display); font-size: 1.1rem; color: #111;">${d.title}</div>
                <div style="font-family: var(--font-mono); font-size: 0.6rem; color: #888; margin-top: 1rem;">FILED: ${d.date}</div>
            </div>
        `;
    }).join('');
}

function renderImpact(data) {
    document.getElementById('impactContent').innerHTML = `
        <div style="margin-top: 3rem; max-width: 800px;">
            <div style="margin-bottom: 4rem;">
                <h4 style="font-family: var(--font-mono); color: var(--accent-gold); font-size: 0.65rem; letter-spacing:0.2em; text-transform: uppercase; margin-bottom: 1.5rem;">Direct Aftermath</h4>
                <p style="font-family: var(--font-serif); font-size: 1.2rem; line-height: 1.8; color: #222;">${data.immediate_impact}</p>
            </div>
            <div>
                <h4 style="font-family: var(--font-mono); color: var(--accent-gold); font-size: 0.65rem; letter-spacing:0.2em; text-transform: uppercase; margin-bottom: 1.5rem;">Historical Legacy</h4>
                <p style="font-family: var(--font-serif); font-size: 1.2rem; line-height: 1.8; color: #222;">${data.long_term_impact}</p>
            </div>
        </div>
    `;
}

function setupPhysicalTabs() {
    const tabs = document.querySelectorAll('.folder-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.querySelector(`[data-tab-content="${target}"]`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', init);


