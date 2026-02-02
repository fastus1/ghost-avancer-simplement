(function() {
    const nav = document.getElementById('mainNav');
    const moreItem = document.getElementById('navMore');
    const dropdown = document.getElementById('navDropdown');
    const moreBtn = moreItem ? moreItem.querySelector('.circle-nav__more-btn') : null;

    if (!nav || !moreItem || !dropdown || !moreBtn) return;

    const navItems = Array.from(nav.querySelectorAll('[data-nav-item]'));
    let hiddenItems = [];

    function updateNav() {
        // Reset all items to visible
        navItems.forEach(item => {
            item.classList.remove('is-hidden');
        });
        dropdown.innerHTML = '';
        hiddenItems = [];
        moreItem.classList.remove('is-visible');

        // Get available width
        const header = document.querySelector('.circle-header__inner');
        const logo = document.querySelector('.circle-header__logo');
        const rightSection = document.querySelector('.circle-header__right');

        if (!header || !logo || !rightSection) return;

        const headerWidth = header.offsetWidth;
        const logoWidth = logo.offsetWidth;
        const rightWidth = rightSection.offsetWidth;
        const gap = 32; // gaps between sections
        const moreWidth = 80; // approximate width of "Plus" button

        const availableWidth = headerWidth - logoWidth - rightWidth - gap - moreWidth;

        // Calculate which items fit
        let totalWidth = 0;
        let itemsToHide = [];

        navItems.forEach((item, index) => {
            const itemWidth = item.offsetWidth + 8; // 8px gap
            totalWidth += itemWidth;

            if (totalWidth > availableWidth) {
                itemsToHide.push(item);
            }
        });

        // Hide overflow items and add to dropdown
        if (itemsToHide.length > 0) {
            moreItem.classList.add('is-visible');

            itemsToHide.forEach(item => {
                item.classList.add('is-hidden');

                // Clone the link to dropdown
                const link = item.querySelector('a');
                if (link) {
                    const li = document.createElement('li');
                    const clonedLink = link.cloneNode(true);
                    li.appendChild(clonedLink);
                    dropdown.appendChild(li);
                }
            });

            hiddenItems = itemsToHide;
        }
    }

    // Toggle dropdown
    moreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!moreItem.contains(e.target)) {
            moreBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close dropdown on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            moreBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Run on load and resize
    updateNav();

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateNav, 100);
    });
})();
