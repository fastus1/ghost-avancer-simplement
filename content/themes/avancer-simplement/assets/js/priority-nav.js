class PriorityNav {
    constructor(selector) {
        this.nav = document.querySelector(selector);
        if (!this.nav) return;

        this.list = this.nav.querySelector('.nav-list');
        if (!this.list) return;

        this.items = Array.from(this.list.querySelectorAll(':scope > li:not(.nav-more)'));
        this.moreItem = null;
        this.moreBtn = null;
        this.moreDropdown = null;

        this.createMoreButton();
        this.bindEvents();
        this.update();
    }

    createMoreButton() {
        this.moreItem = document.createElement('li');
        this.moreItem.className = 'nav-more';
        this.moreItem.innerHTML = `
            <button class="nav-more-btn" type="button">
                Plus
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4l4 4 4-4"/>
                </svg>
            </button>
            <ul class="nav-more-dropdown"></ul>
        `;

        this.list.appendChild(this.moreItem);
        this.moreBtn = this.moreItem.querySelector('.nav-more-btn');
        this.moreDropdown = this.moreItem.querySelector('.nav-more-dropdown');
    }

    bindEvents() {
        const resizeObserver = new ResizeObserver(() => this.update());
        resizeObserver.observe(this.nav);

        this.moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.moreItem.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            this.moreItem.classList.remove('open');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.moreItem.classList.remove('open');
            }
        });
    }

    update() {
        // Reset all items to visible
        this.items.forEach(item => {
            item.style.display = '';
            item.classList.remove('is-hidden');
        });
        this.moreDropdown.innerHTML = '';
        this.moreItem.style.display = 'none';

        // Calculate available space
        const navWidth = this.nav.offsetWidth;
        const moreWidth = 80;
        let totalWidth = 0;
        let overflowItems = [];

        // Measure each item
        this.items.forEach(item => {
            totalWidth += item.offsetWidth + 8;

            if (totalWidth > navWidth - moreWidth) {
                overflowItems.push(item);
            }
        });

        // Hide overflow items
        overflowItems.forEach(item => {
            item.style.display = 'none';
            item.classList.add('is-hidden');

            const clone = item.cloneNode(true);
            clone.style.display = '';
            clone.classList.remove('is-hidden');
            this.moreDropdown.appendChild(clone);
        });

        // Show "Plus" button if there are hidden items
        if (overflowItems.length > 0) {
            this.moreItem.style.display = '';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PriorityNav('#priority-nav');
});
