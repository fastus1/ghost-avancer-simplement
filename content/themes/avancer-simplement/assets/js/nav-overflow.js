(function() {
    function initNavOverflow() {
        const nav = document.getElementById('mainNav');
        const moreItem = document.getElementById('navMore');
        const dropdown = document.getElementById('navDropdown');
        const moreBtn = moreItem ? moreItem.querySelector('.circle-nav__more-btn') : null;

        if (!nav || !moreItem || !dropdown || !moreBtn) return;

        const navItems = Array.from(nav.querySelectorAll('[data-nav-item]'));

        // Store original widths when all items are visible
        let itemWidths = [];

        function measureItems() {
            // Temporarily show all items to measure
            navItems.forEach(item => item.classList.remove('is-hidden'));
            moreItem.classList.remove('is-visible');

            itemWidths = navItems.map(item => item.getBoundingClientRect().width);
        }

        function updateNav() {
            const headerNav = document.querySelector('.circle-header__nav');
            if (!headerNav) return;

            // Reset all items to visible first
            navItems.forEach(item => item.classList.remove('is-hidden'));
            moreItem.classList.remove('is-visible');
            dropdown.innerHTML = '';

            // Get the nav container width
            const navRect = headerNav.getBoundingClientRect();
            const availableWidth = navRect.width;

            // Calculate total width of all nav items
            let totalWidth = 0;
            navItems.forEach((item, i) => {
                totalWidth += item.getBoundingClientRect().width + 8; // 8px gap
            });

            // If everything fits, we're done
            if (totalWidth <= availableWidth) {
                return;
            }

            // Items don't fit - show "Plus" and calculate what fits
            moreItem.classList.add('is-visible');
            const moreWidth = moreItem.getBoundingClientRect().width + 16; // plus some margin
            const spaceForItems = availableWidth - moreWidth;

            let usedWidth = 0;
            let itemsToHide = [];

            navItems.forEach((item, index) => {
                const itemWidth = item.getBoundingClientRect().width + 8;

                if (usedWidth + itemWidth <= spaceForItems) {
                    usedWidth += itemWidth;
                } else {
                    itemsToHide.push(item);
                }
            });

            // Hide overflow items and add to dropdown
            itemsToHide.forEach(item => {
                item.classList.add('is-hidden');

                const link = item.querySelector('a');
                if (link) {
                    const li = document.createElement('li');
                    const clonedLink = link.cloneNode(true);
                    li.appendChild(clonedLink);
                    dropdown.appendChild(li);
                }
            });

            // If no items to hide, hide the "Plus" button
            if (itemsToHide.length === 0) {
                moreItem.classList.remove('is-visible');
            }
        }

        // Toggle dropdown
        moreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
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
            resizeTimeout = setTimeout(updateNav, 50);
        });
    }

    // Wait for DOM and fonts to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initNavOverflow, 100);
        });
    } else {
        setTimeout(initNavOverflow, 100);
    }
})();
