// ============================================
// THE DIGITAL ARCHIVE - LOGIC (Noir Redesign)
// ============================================

// State
let currentView = 'landing';
let revealObserver = null;

// DOM Elements
const views = document.querySelectorAll('.view');
const nav = document.querySelector('.global-nav');
const navHome = document.getElementById('navHome');
const shelfSystem = document.getElementById('shelfSystem');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('closeOverlay');
const fileList = document.getElementById('fileList');
const boxTitle = document.getElementById('boxTitle');

// Initialize
// Initialize
async function init() {
    setupScrollReveal(); // Must be first to define revealObserver
    await renderArchiveList();
    setupNavigation();

    // Initial State Check or History Popstate
    const targetView = localStorage.getItem('targetView');

    // Handle specific URL hashes if present
    const hash = window.location.hash.replace('#', '');

    if (hash && document.getElementById(hash)) {
        showView(hash, false);
    } else if (targetView) {
        showView(targetView, false);
    } else {
        showView('landing', false);
    }

    // Listen for back/forward navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.viewId) {
            showView(e.state.viewId, false);
        } else if (window.location.hash) {
            showView(window.location.hash.replace('#', ''), false);
        } else {
            showView('landing', false);
        }
    });
}

// Scroll Reveal Logic
function setupScrollReveal() {
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
}

function applyReveal(element) {
    if (!element) return;
    element.classList.add('reveal');
    if (revealObserver) revealObserver.observe(element);
}

// Navigation Logic
function setupNavigation() {
    // Nav Links
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showView(section);
        });
    });

    // Enter Button
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => showView('hub'));
    }

    // Nav Brand / Home
    if (navHome) {
        navHome.addEventListener('click', () => {
            localStorage.removeItem('targetView');
            showView('landing');
        });
    }

    // Overlay handlers
    if (closeOverlay) {
        closeOverlay.addEventListener('click', () => {
            overlay.classList.remove('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    }

    // Search
    const search = document.getElementById('globalSearch');
    if (search) {
        search.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Searching for:', search.value);
            }
        });
    }
}

function showView(viewId, pushToHistory = true) {
    views.forEach(v => {
        v.classList.add('hidden');
        v.style.opacity = '0';
    });

    const target = document.getElementById(viewId) || document.getElementById('dynamicView');
    if (!target) return;

    target.classList.remove('hidden');

    // Smooth Entrance
    setTimeout(() => {
        target.style.opacity = '1';
        target.style.transition = 'opacity 0.8s ease';
    }, 50);

    // Nav Controls
    if (viewId === 'landing') {
        nav.classList.remove('visible');
    } else {
        nav.classList.add('visible');
    }

    // History & State Preservation
    if (viewId !== 'landing') {
        localStorage.setItem('targetView', viewId);
    }

    if (pushToHistory) {
        history.pushState({ viewId }, "", viewId === 'landing' ? " " : `#${viewId}`);
    }

    // Header reveal (if hub/archive)
    const header = target.querySelector('.view-header');
    if (header) applyReveal(header);

    // Dynamic Logic
    if (viewId !== 'landing' && viewId !== 'hub' && viewId !== 'archive') {
        renderDynamicSection(viewId);
    }

    // Reveal hub cards
    if (viewId === 'hub') {
        target.querySelectorAll('.hub-card').forEach(card => applyReveal(card));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    currentView = viewId;
}

// Dynamic Rendering
async function renderDynamicSection(sectionId, filter = 'all') {
    const header = document.getElementById('dynamicHeader');
    const content = document.getElementById('dynamicContent');
    if (!header || !content) return;

    content.innerHTML = '';

    try {
        if (sectionId === 'figures') {
            const categories = [
                { id: 'all', label: 'All Records' },
                { id: 'convicted', label: 'Convicted' },
                { id: 'charged', label: 'Charged' },
                { id: 'accused', label: 'Accused' },
                { id: 'deceased', label: 'Deceased' }
            ];

            header.innerHTML = `
                <div class="view-header">
                    <p class="text-uppercase" style="color: var(--accent-gold); margin-bottom: 2rem;">Personnel Dossiers</p>
                    <h1>Subject Directory</h1>
                    <div class="filter-bar">
                        ${categories.map(cat => `
                            <button class="filter-btn ${filter === cat.id ? 'active' : ''}" onclick="renderDynamicSection('figures', '${cat.id}')">
                                ${cat.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            applyReveal(header.querySelector('.view-header'));

            const figures = await window.archiveDB.getFigures(filter);

            if (!figures || figures.length === 0) {
                content.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 10rem; color: var(--text-muted); font-family: var(--font-serif); font-style: italic;">No declassified records matching this criteria.</div>`;
                return;
            }

            figures.forEach(f => {
                const card = document.createElement('div');
                card.className = 'profile-card';
                card.innerHTML = `
                    <div class="profile-card-image">
                        ${f.image_path ? `<img src="${f.image_path}" alt="${f.name}">` : '👤'}
                    </div>
                    <div style="flex: 1;">
                        <span class="status-badge ${f.tag}">${f.status.toUpperCase()}</span>
                        <h3 style="margin: 0.8rem 0 0.4rem; font-family: var(--font-display); letter-spacing: 0.05em;">${f.name}</h3>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono); text-transform: uppercase;">${f.role}</p>
                    </div>
                `;

                card.addEventListener('click', () => {
                    localStorage.setItem('currentFigureId', f.id);
                    window.location.href = 'figure-profile.html';
                });

                content.appendChild(card);
                applyReveal(card);
            });

        } else if (sectionId === 'orgs') {
            header.innerHTML = `
                <div class="view-header">
                    <p class="text-uppercase" style="color: var(--accent-gold); margin-bottom: 2rem;">Intelligence & Entities</p>
                    <h1>Organizations</h1>
                </div>
            `;
            applyReveal(header.querySelector('.view-header'));

            const orgs = await window.archiveDB.getOrganizations();
            orgs.forEach(o => {
                const card = document.createElement('div');
                card.className = 'hub-card';
                card.innerHTML = `
                    <div style="font-size: 0.7rem; color: var(--accent-gold); font-family: var(--font-mono); letter-spacing: 0.2em;">${o.type.toUpperCase()}</div>
                    <h3>${o.name}</h3>
                    <p style="color: var(--text-secondary); opacity: 0.7;">Status: ${o.status}</p>
                `;
                content.appendChild(card);
                applyReveal(card);
            });
        } else if (sectionId === 'ops') {
            header.innerHTML = `<div class="view-header"><p class="text-uppercase" style="color: var(--accent-gold);">Classified</p><h1>Operations</h1></div>`;
            applyReveal(header.querySelector('.view-header'));

            const ops = await window.archiveDB.getOperations();
            if (!ops || ops.length === 0) {
                content.innerHTML = `<div style="grid-column: 1/-1; border: 1px dashed var(--border-dim); padding: 8rem; text-align: center;"><p style="font-family: var(--font-serif); font-style: italic; color: var(--text-muted); font-size: 1.2rem;">Access Restricted / No Records Found.</p></div>`;
            } else {
                ops.forEach(o => {
                    const card = document.createElement('div');
                    card.className = 'hub-card';
                    card.innerHTML = `
                        <div style="font-size: 0.7rem; color: var(--accent-gold); font-family: var(--font-mono); letter-spacing: 0.2em;">${o.type.toUpperCase()}</div>
                        <h3>${o.name}</h3>
                        <p style="color: var(--text-secondary); opacity: 0.7;">Status: ${o.status}</p>
                    `;
                    content.appendChild(card);
                    applyReveal(card);
                });
            }
        }
    } catch (err) {
        console.error('Archive Data Error:', err);
        content.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 10rem; color: #ff6b6b; font-family: var(--font-serif); font-style: italic;">Connection to secure archive failed. Pleace check credentials.</div>`;
    }
}

// Archive List Generation
const MOCK_CASES = [
    {
        title: "Watergate Scandal",
        year: "1972–1974",
        category: "Political Corruption",
        jurisdiction: "United States",
        status: "Concluded",
        summary: "Break-in at DNC headquarters leading to resignation of President Nixon."
    },
    {
        title: "ABSCAM Sting Operation",
        year: "1978–1980",
        category: "Political Corruption",
        jurisdiction: "United States",
        status: "Concluded",
        summary: "An FBI sting operation leading to the convictions of seven members of the United States Congress."
    },
    {
        title: "Larry Nassar Case",
        year: "1992–2016",
        category: "Institutional Abuse",
        jurisdiction: "United States",
        status: "Concluded",
        summary: "Decades of serial abuse by USA Gymnastics national team osteopathic physician."
    },
    {
        title: "NXIVM / Keith Raniere Case",
        year: "1998–2018",
        category: "Sex Trafficking",
        jurisdiction: "United States",
        status: "Concluded",
        summary: "Multi-level marketing company exposed as a cult engaging in sex trafficking and forced labor."
    },
    {
        title: "Jimmy Savile Scandal",
        year: "1955–2009",
        category: "Institutional Abuse",
        jurisdiction: "United Kingdom",
        status: "Concluded",
        summary: "Prolific and unprecedented scale of predatory sex offenses committed by a prominent BBC television and radio personality."
    },
    {
        title: "Rotherham Child Exploitation Scandal",
        year: "1997–2013",
        category: "Systemic Failure",
        jurisdiction: "United Kingdom",
        status: "Ongoing",
        summary: "Widespread organized child sexual abuse in South Yorkshire, characterized by significant police and council inaction."
    },
    {
        title: "Catholic Church Abuse Scandals",
        year: "1980s–Present",
        category: "Institutional Abuse",
        jurisdiction: "International",
        status: "Ongoing",
        summary: "Global, systemic cover-up and abuse by members of the Catholic clergy spanning multiple decades and continents."
    },
    {
        title: "Harvey Weinstein Case",
        year: "1970s–2017",
        category: "Sexual Abuse",
        jurisdiction: "United States / UK",
        status: "Concluded / Appeals",
        summary: "Widespread media industry sexual abuse allegations that catalyzed the global #MeToo movement and resulted in multiple criminal convictions."
    },
    {
        title: "Marc Dutroux Case",
        year: "1980s–1996",
        category: "Serial Crimes",
        jurisdiction: "Belgium",
        status: "Concluded",
        summary: "Abduction, abuse, and murder of young girls, leading to massive public outrage over perceived police incompetence and corruption."
    }
];

async function renderArchiveList() {
    const archiveList = document.getElementById('archiveList');
    if (!archiveList) return;

    archiveList.innerHTML = '';

    MOCK_CASES.forEach(c => {
        const item = document.createElement('div');
        item.className = 'archive-item';

        item.innerHTML = `
            <div class="archive-item-top">
                <span class="archive-item-year">${c.year}</span>
                <span class="archive-item-title">— ${c.title}</span>
            </div>
            <div class="archive-item-meta">${c.category} &nbsp;|&nbsp; ${c.jurisdiction} &nbsp;|&nbsp; ${c.status}</div>
            <div class="archive-item-summary">${c.summary}</div>
        `;

        item.addEventListener('click', () => {
            console.log('Viewing case details for: ', c.title);
        });

        archiveList.appendChild(item);
        applyReveal(item);
    });
}

document.addEventListener('DOMContentLoaded', init);

