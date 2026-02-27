// ============================================
// FIGURE PROFILE PAGE - LOGIC
// ============================================

function handleGlobalNav(targetView) {
    // Navigate back if we're going to the section we likely came from
    if (document.referrer.includes('index.html') && localStorage.getItem('targetView') === targetView) {
        history.back();
    } else {
        localStorage.setItem('targetView', targetView);
        window.location.href = 'index.html';
    }
}

async function init() {
    let figureId = localStorage.getItem('currentFigureId');

    // Fallback if no ID is found or if it's an invalid string
    if (!figureId || figureId === 'null' || figureId === 'undefined') {
        figureId = 'jeffrey-epstein';
        localStorage.setItem('currentFigureId', figureId);
    }

    try {
        console.log("Fetching dossier for figure:", figureId);
        const data = await window.archiveDB.getFigureDetail(figureId);

        if (!data) {
            console.error('Figure not found in database:', figureId);
            throw new Error('Personnel record not found in the encrypted archive.');
        }

        console.log("Dossier Data Received:", data);

        renderIdentity(data);
        renderQuickFacts(data);

        // Content sections restored
        renderDossierContent(data);
        renderNetwork(data);
        renderReferences(data);
        injectContextualImage();

        document.title = `Personnel Dossier: ${data.name} | THE ARCHIVE`;
        // setupScrollSpy(); - Disabled as navigation links are removed
    } catch (err) {
        console.error('Figure profile load error:', err);
        document.body.innerHTML = `<div style="padding: 10rem; text-align: center; color: #ff6b6b; font-family: var(--dossier-mono);">ERROR: Failed to retrieve personnel dossier from secure server.</div>`;
    }

}

// DYNAMIC DOSSIER RENDERING (Direct from Database)
function renderDossierContent(data) {
    const mainContainer = document.getElementById('dossierContent');
    const navContainer = document.getElementById('dossierNav');
    if (!mainContainer || !navContainer) return;

    // 1. Prepare dynamic items list
    const sections = [];

    // Enhanced Helper for structure formatting
    const formatContent = (text) => {
        if (!text) return "";

        // Pass-through if already HTML
        if (text.includes('<p>') || text.includes('<h') || text.includes('<ul')) {
            return text;
        }

        // Remove raw # symbols that are not at the start of the line or are excessive
        let cleanText = text.replace(/#{2,}/g, '');

        // Split by lines to process each line specifically
        const lines = cleanText.split('\n');
        let html = "";
        let inList = false;
        let pBuffer = [];

        const flushParagraph = () => {
            if (pBuffer.length > 0) {
                const combined = pBuffer.join(' ').trim();
                if (combined) {
                    // Split long blocks into paragraphs of roughly 5-6 sentences
                    const sentences = combined.match(/[^\.!\?]+[\.!\?]+/g) || [combined];
                    let currentP = "";
                    sentences.forEach((s, i) => {
                        currentP += s;
                        if ((i + 1) % 5 === 0 || i === sentences.length - 1) {
                            html += `<p>${currentP.trim()}</p>`;
                            currentP = "";
                        }
                    });
                }
                pBuffer = [];
            }
        };

        const flushList = () => {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                flushParagraph();
                flushList();
                return;
            }

            // Subsections (### or ## at start of line)
            if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
                flushParagraph();
                flushList();
                const level = trimmed.startsWith('###') ? 4 : 3;
                const headerText = trimmed.replace(/^#+\s*/, '').trim();
                html += `<h${level}>${headerText}</h${level}>`;
            }
            // Bullet points
            else if (trimmed.startsWith('●') || trimmed.startsWith('○') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                flushParagraph();
                if (!inList) {
                    html += '<ul class="dossier-list">';
                    inList = true;
                }
                const cleanItem = trimmed.replace(/^[●○•\-\*]\s*/, '');
                html += `<li>${cleanItem}</li>`;
            }
            // Regular text
            else {
                flushList();
                pBuffer.push(trimmed);
            }
        });

        flushParagraph();
        flushList();

        return html;
    };

    // A. Lead Summary (Special Section 01 from figures table)
    if (data.executive_overview) {
        sections.push({
            id: 'summary',
            label: 'Section 01',
            title: 'Lead Summary',
            contentHtml: `
                <div class="block-content">${formatContent(data.executive_overview)}</div>
                ${data.public_impact ? `
                    <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--dossier-border);">
                        <h5 style="margin-bottom: 1.5rem;">Public Interest & Investigative Impact</h5>
                        <div class="block-content">${formatContent(data.public_impact)}</div>
                    </div>
                ` : ''}
            `
        });
    }

    // B. Investigative Sections (From figure_sections table)
    const dbSections = data.figure_sections || [];
    dbSections.sort((a, b) => (a.order_rank || 0) - (b.order_rank || 0));

    dbSections.forEach((item, index) => {
        const sectionNum = (sections.length + 1).toString().padStart(2, '0');
        const sectionId = `section-${item.id || index}`;
        const isAllegation = (item.section_type || "").toLowerCase() === 'allegations' || (item.section_type || "").toLowerCase() === 'investigation';

        sections.push({
            id: sectionId,
            label: `Section ${sectionNum}`,
            title: item.title || item.section_type || 'Investigative Record',
            isAllegation: isAllegation,
            contentHtml: `<div class="block-content">${formatContent(item.content)}</div>`
        });
    });

    // C. Legal Status Summary (Special Section 11 from figures + timeline)
    const timeline = data.figure_timeline || [];
    let timelineHTML = "";
    if (timeline.length > 0) {
        timelineHTML = `
            <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--dossier-border);">
                <h5 style="margin-bottom: 2rem;">Operational Chronology [SUMMARY]</h5>
                <div class="dossier-timeline">
                    ${timeline.sort((a, b) => (a.order_rank || 0) - (b.order_rank || 0)).map(event => `
                        <div class="timeline-event">
                            <div class="event-year">${event.year}</div>
                            <div class="event-description">${formatContent(event.description)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const nextNum = (sections.length + 1).toString().padStart(2, '0');
    sections.push({
        id: 'status-summary',
        label: `Section ${nextNum}`,
        title: 'Legal Status Summary',
        contentHtml: `
            <div class="block-content">
                <p><strong>Primary Legal Status:</strong> ${data.legal_status || 'NOT RECORDED'}</p>
                <p><strong>Dossier Category:</strong> <span class="dossier-status ${data.category || ''}" style="border:none; padding:0; background:none;">${(data.category || 'N/A').toUpperCase()}</span></p>
                <p><strong>Archive Identification:</strong> ${data.archive_id || 'UNKNOWN'}</p>
            </div>
            ${timelineHTML}
        `
    });

    // 2. Clear main container
    mainContainer.innerHTML = "";
    navContainer.innerHTML = ""; // Navigation links removed per request

    // 3. Render items
    sections.forEach((s) => {
        // Render Section to Main Content
        const sectionEl = document.createElement('section');
        sectionEl.id = s.id;
        sectionEl.className = 'content-section';
        const titleHtml = s.id === 'summary' ? '' : `<h2 class="section-title">${s.title}</h2>`;

        // Removed the info-block wrapper and allegation border for clean Wikipedia look
        sectionEl.innerHTML = `
            ${titleHtml}
            <div class="section-body">
                ${s.contentHtml}
            </div>
        `;
        mainContainer.appendChild(sectionEl);
    });
}

// RESTORING ORIGINAL IDENTITY RENDERING (Grid-based)
function renderIdentity(data) {
    const section = document.querySelector('.identity-section');
    if (!section) return;
    section.innerHTML = `
        <div class="profile-image-container">
            <img src="${data.image_path || 'profile_placeholder.png'}" alt="${data.name} Profile">
        </div>
        <div class="identity-info">
            <div class="status-row">
                <span class="dossier-status ${data.category}">${data.status.toUpperCase()} // CASE ${data.status === 'Deceased' ? 'CLOSED*' : 'ACTIVE'}</span>
            </div>
            <h1 class="full-name">${data.name}</h1>
            <p class="primary-descriptor">${data.role}</p>
            <div class="identity-summary">
                ${data.identity_summary}
            </div>
        </div>
    `;
}

// RESTORING ORIGINAL QUICK FACTS RENDERING
function renderQuickFacts(data) {
    const container = document.querySelector('.quick-facts');
    if (!container) return;
    container.innerHTML = `
        <h4>DATA_STRING // QUICK FACTS</h4>
        <div class="fact-item"><span class="fact-label">Full Name</span><div class="fact-value">${data.name || 'N/A'}</div></div>
        <div class="fact-item"><span class="fact-label">Born / Died</span><div class="fact-value">${data.born_died || 'UNKNOWN'}</div></div>
        <div class="fact-item"><span class="fact-label">Nationality</span><div class="fact-value">${data.nationality || 'UNKNOWN'}</div></div>
        <div class="fact-item"><span class="fact-label">Occupation</span><div class="fact-value">${data.occupation || 'UNKNOWN'}</div></div>
        <div class="fact-item"><span class="fact-label">Known For</span><div class="fact-value">${data.known_for || 'UNKNOWN'}</div></div>
        <div class="fact-item"><span class="fact-label">Legal Status</span><div class="fact-value">${data.legal_status || 'UNKNOWN'}</div></div>
        <div class="fact-item"><span class="fact-label">Primary Locations</span><div class="fact-value">${data.primary_locations || 'UNKNOWN'}</div></div>
        <div class="fact-item" style="border:none;"><span class="fact-label">Archive ID</span><div class="fact-value" style="font-family: var(--dossier-mono);">${data.archive_id || 'UNKNOWN'}</div></div>
    `;
}



// RESTORING ORIGINAL NETWORK RENDERING
function renderNetwork(data) {
    const container = document.getElementById('network');
    if (!container) return;
    const network = data.figure_network || [];

    let networkContent = "";
    if (network.length === 0) {
        networkContent = '<div class="placeholder-text" style="margin:0; border:none; background:transparent; text-align: left; padding: 0;">[ NO CONFIRMED ASSOCIATES RECORDED ]</div>';
    } else {
        networkContent = `
            <div class="network-grid">
                ${network.map(n => `
                    <div class="network-card">
                        <span class="network-tag">${n.tag}</span>
                        <div class="network-name">${n.associate_name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    container.innerHTML = `
        <h2 class="section-title">Network Analysis</h2>
        <div class="section-body">
            ${networkContent}
        </div>
    `;
}

// RESTORING ORIGINAL REFERENCES RENDERING
function renderReferences(data) {
    const container = document.getElementById('references');
    if (!container) return;
    const references = data.figure_references || [];

    let refContent = "";
    if (references.length === 0) {
        refContent = '<div class="placeholder-text" style="margin:0; border:none; background:transparent; text-align: left; padding: 0;">[ SOURCE LIBRARY EMPTY ]</div>';
    } else {
        refContent = `
            <div class="references-list">
                ${references.sort((a, b) => (a.order_rank || 0) - (b.order_rank || 0)).map((r, index) => `
                    <div class="ref-item">
                        <span class="ref-index">[${(index + 1).toString().padStart(2, '0')}]</span>
                        <a href="${r.link}" target="_blank" class="ref-link">${r.title}</a>
                    </div>
                `).join('')}
            </div>
        `;
    }

    container.innerHTML = `
        <h2 class="section-title">References</h2>
        <div class="section-body">
            ${refContent}
        </div>
    `;
}

function setupScrollSpy() {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.dossier-nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 250) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// ─── CONTEXTUAL IMAGE INJECTION ───────────────────────────────────────────────
// Places contextual images in the LEFT SIDEBAR, below the info card,
// vertically aligned with specific headings in the right column.

const CONTEXTUAL_IMAGES = [
    {
        titleMatch: 'maria farmer',
        src: 'maria.jpg',
        alt: 'Annie Farmer holding a photo of her sister Maria Farmer',
        caption: 'Annie Farmer holds a photo of herself and her sister Maria Farmer during a press conference on the Epstein Files Transparency Act outside the U.S. Capitol, November 18, 2025.'
    },
    {
        titleMatch: 'investigative process',
        src: 'michael.jpg',
        alt: 'Former Palm Beach police chief Michael Reiter',
        caption: 'Former Palm Beach police chief Michael Reiter spoke out to NBC News in one of his most extensive interviews to date.'
    },
    {
        titleMatch: 'prosecutorial developments',
        src: 'barry.webp',
        alt: 'Ex-Palm Beach County State Attorney Barry Krischer',
        caption: 'Ex-Palm Beach County State Attorney Barry Krischer',
        aspectRatio: '16/9'
    },
    {
        titleMatch: 'search warrants and evidence',
        src: 'mannhatan.jpg',
        alt: 'Manhattan townhouse',
        caption: 'Manhattan townhouse formerly owned by Jeffrey Epstein. (9 East 71st Street, New York, NY)'
    },
    {
        titleMatch: 'enactment and legal status',
        src: 'khanna.jpeg',
        alt: 'Press conference',
        caption: 'Rep. Ro Khanna, D-Calif., former Rep. Marjorie Taylor-Greene, R-Ga., and Rep. Thomas Massie, R-Ky., speak during a conference as the House prepares to vote on the Epstein Files Transparency Act'
    },
    {
        titleMatch: 'document requests and subpoena',
        src: 'comer.avif',
        alt: 'James Comer addressing reporters',
        caption: 'James Comer, Chairman of the House Oversight Committee addressing reporters at capitol hill.'
    },
    {
        titleMatch: 'proposed federal charges',
        src: 'acossta.jpg',
        alt: 'US labour secretary Alex Acosta',
        caption: 'US labour secretary Alex Acosta defends his role in striking a plea deal in Epstein case.'
    },
    {
        titleMatch: 'continued residency and travel',
        src: 'mexico.webp',
        alt: 'The Zorro ranch',
        caption: 'The Zorro ranch, one of the properties of Jeffrey Epstein, in Santa Fe, New Mexico on Highway 41.',
        aspectRatio: '16/9'
    },
    {
        titleMatch: 'civil litigation expansion',
        src: 'virginina.avif',
        alt: 'Virginia Giuffre',
        caption: '‘Prince Andrew believed having sex with me was his birthright’: Virginia Giuffre on her abuse at the hands of Epstein, Maxwell and the king’s brother',
        aspectRatio: '16/9'
    },
    {
        titleMatch: '2018 miami herald investigation',
        src: 'julie.avif',
        alt: 'Julie K. Brown',
        caption: 'Julie K. Brown, the Miami Herald reporter who dug deep into the Jeffrey Epstein case.',
        aspectRatio: '16/9',
        objectPosition: 'top'
    },
    {
        titleMatch: 'surveillance footage and review',
        src: 'barr.webp',
        alt: 'Attorney General William Barr',
        caption: 'Attorney General William Barr demoted the acting director of the Bureau of Prisons on Monday, nine days after Jeffrey Epstein killed himself in a federal jail cell.'
    },
    {
        titleMatch: 'federal investigations',
        src: 'thomas.jpg',
        alt: 'Michael Thomas and Tova Noel',
        caption: 'Michael Thomas and Tova Noel depart after a court hearing outside a federal court in New York City, U.S., November 25, 2019.',
        aspectRatio: '16/9'
    },
    {
        titleMatch: 'jean-luc brunel investigation',
        src: 'brrunel.avif',
        alt: 'Jeffrey Epstein and Jean-Luc Brunel',
        caption: 'Jeffrey Epstein and French model scout Jean-Luc Brunel in an undated photo.'
    }
];

function injectContextualImage() {
    const sidebarSlot = document.getElementById('sidebarContextualImage');
    if (!sidebarSlot) return;

    // Clear previous injections
    sidebarSlot.innerHTML = '';
    const renderedPairings = [];

    // Find all subheadings in the content area
    const allH3s = document.querySelectorAll('#dossierContent h3, #dossierContent h2');

    // Iterate through the actual page headings sequentially. This ensures that the 
    // images are placed into the sidebar DOM in the exact same top-to-bottom order 
    // as their parallel sections, preventing layout flow collisions.
    allH3s.forEach(h => {
        const headingText = h.textContent.toLowerCase();

        // Find the matching configured image for this heading
        const imgData = CONTEXTUAL_IMAGES.find(config => headingText.includes(config.titleMatch));

        if (imgData) {
            let aspectStyle = '';
            if (imgData.aspectRatio) {
                const objPos = imgData.objectPosition ? `object-position: ${imgData.objectPosition};` : '';
                aspectStyle = `style="aspect-ratio: ${imgData.aspectRatio}; object-fit: cover; ${objPos}"`;
            }
            const figure = document.createElement('figure');
            figure.className = 'contextual-figure';
            figure.innerHTML = `
                <img
                    src="${imgData.src}"
                    alt="${imgData.alt}"
                    class="contextual-img"
                    ${aspectStyle}
                >
                <figcaption class="contextual-caption">
                    ${imgData.caption}
                </figcaption>
            `;

            // Build the DOM element explicitly
            sidebarSlot.appendChild(figure);

            // Store the coupling for layout phase
            renderedPairings.push({
                figure: figure,
                target: h,
            });
        }
    });

    window.__contextualPairings = renderedPairings;

    // Wait for all injected images to fully load before calculating alignment.
    // An unloaded image has 0 height, which throws off margin computations.
    const images = Array.from(sidebarSlot.querySelectorAll('img'));
    Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // proceed even if image fails
        });
    })).then(() => {
        requestAnimationFrame(alignSidebarImage);
    });
}

function alignSidebarImage() {
    const pairings = window.__contextualPairings;
    if (!pairings || pairings.length === 0) return;

    const NUDGE = 28; // px to push below the h3 top baseline
    const MIN_GAP = 32; // minimum px gap between stacked sidebar images
    let previousFigureBottom = -Infinity;

    // 1. Reset all margins to measure natural stacked flow correctly
    pairings.forEach(pair => {
        pair.figure.style.marginTop = '0px';
    });

    // 2. Compute true required offset for each based on target
    pairings.forEach(pair => {
        const { figure, target } = pair;

        // Read positions relative to viewport
        const headingTop = target.getBoundingClientRect().top + window.scrollY;
        const currentFigureTop = figure.getBoundingClientRect().top + window.scrollY;

        let requiredOffset = (headingTop - currentFigureTop) + NUDGE;

        // Ensure we don't overlap the previous image if headings are very close
        const minimumAllowedOffset = (previousFigureBottom + MIN_GAP) - currentFigureTop;
        if (requiredOffset < minimumAllowedOffset) {
            requiredOffset = minimumAllowedOffset;
        }

        if (requiredOffset < 0) {
            requiredOffset = 0;
        }

        figure.style.marginTop = requiredOffset + 'px';

        // Update document layout before the next measurement
        previousFigureBottom = figure.getBoundingClientRect().bottom + window.scrollY;

        console.log(`[Archive] Aligned image for ${target.textContent.trim()} offset: ${requiredOffset}px`);
    });
}

// Re-align on resize so they stay pinned correctly when layout shifts
window.addEventListener('resize', () => {
    requestAnimationFrame(alignSidebarImage);
});

document.addEventListener('DOMContentLoaded', init);
