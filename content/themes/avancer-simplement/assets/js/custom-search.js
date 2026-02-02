/**
 * Custom Search for Ghost - Circle Style
 * Uses Ghost Content API for searching posts
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // DOM Elements
    const overlay = document.getElementById('customSearchOverlay');
    const input = document.getElementById('customSearchInput');
    const closeBtn = document.getElementById('customSearchClose');
    const emptyState = document.getElementById('customSearchEmpty');
    const resultsList = document.getElementById('customSearchList');
    const noResults = document.getElementById('customSearchNoResults');

    // Search triggers (buttons with data-custom-search attribute)
    const searchTriggers = document.querySelectorAll('[data-custom-search]');

    // Debug
    console.log('Custom Search Init:', {
        overlay: !!overlay,
        input: !!input,
        triggers: searchTriggers.length
    });

    if (!overlay || !input) {
        console.error('Custom Search: Required elements not found');
        return;
    }

    // Debounce timer
    let searchTimeout = null;

    // Ghost Content API configuration
    const ghostHost = window.location.origin;

    /**
     * Open search modal
     */
    function openSearch() {
        console.log('Opening search modal');
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        setTimeout(function() { input.focus(); }, 100);
    }

    /**
     * Close search modal
     */
    function closeSearch() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        input.value = '';
        showEmptyState();
    }

    /**
     * Show empty state
     */
    function showEmptyState() {
        if (emptyState) emptyState.style.display = 'flex';
        if (resultsList) resultsList.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
    }

    /**
     * Show results
     */
    function showResults(posts) {
        if (emptyState) emptyState.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        if (resultsList) resultsList.style.display = 'block';

        if (posts.length === 0) {
            if (resultsList) resultsList.style.display = 'none';
            if (noResults) noResults.style.display = 'flex';
            return;
        }

        resultsList.innerHTML = posts.map(function(post) {
            return '<a href="' + post.url + '" class="custom-search-result">' +
                (post.feature_image ? '<div class="custom-search-result-image"><img src="' + post.feature_image + '" alt="" loading="lazy"></div>' : '') +
                '<div class="custom-search-result-content">' +
                    '<h4 class="custom-search-result-title">' + escapeHtml(post.title) + '</h4>' +
                    (post.excerpt ? '<p class="custom-search-result-excerpt">' + escapeHtml(post.excerpt.substring(0, 100)) + '...</p>' : '') +
                    (post.primary_tag ? '<span class="custom-search-result-tag">' + escapeHtml(post.primary_tag.name) + '</span>' : '') +
                '</div>' +
            '</a>';
        }).join('');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Try to get API key from page scripts
     */
    function getApiKeyFromPage() {
        // Look for Ghost's sodo-search script which contains the key
        var scripts = document.querySelectorAll('script[data-sodo-search]');
        for (var i = 0; i < scripts.length; i++) {
            var key = scripts[i].getAttribute('data-key');
            if (key) return key;
        }

        // Look for any script containing the API key pattern
        var pageHtml = document.documentElement.innerHTML;
        var keyMatch = pageHtml.match(/key=([a-f0-9]{26})/);
        if (keyMatch) return keyMatch[1];

        return null;
    }

    /**
     * Search posts using Ghost Content API
     */
    function searchPosts(query) {
        if (!query || query.length < 2) {
            showEmptyState();
            return;
        }

        var apiKey = getApiKeyFromPage();
        if (!apiKey) {
            console.error('Custom Search: No API key found');
            showResults([]);
            return;
        }

        var url = ghostHost + '/ghost/api/content/posts/?key=' + apiKey +
            '&fields=title,url,excerpt,feature_image&include=tags&limit=50';

        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var posts = data.posts || [];
                var queryLower = query.toLowerCase();
                var filtered = posts.filter(function(post) {
                    return post.title.toLowerCase().indexOf(queryLower) !== -1 ||
                        (post.excerpt && post.excerpt.toLowerCase().indexOf(queryLower) !== -1);
                }).slice(0, 10);
                showResults(filtered);
            })
            .catch(function(error) {
                console.error('Search error:', error);
                showResults([]);
            });
    }

    /**
     * Handle input changes
     */
    function handleInput(e) {
        var query = e.target.value.trim();

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(function() {
            searchPosts(query);
        }, 300);
    }

    /**
     * Handle keyboard events
     */
    function handleKeydown(e) {
        if (e.key === 'Escape') {
            closeSearch();
        }

        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (overlay.classList.contains('is-open')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
    }

    /**
     * Handle overlay click (close on backdrop click)
     */
    function handleOverlayClick(e) {
        if (e.target === overlay) {
            closeSearch();
        }
    }

    // Event listeners for search triggers
    for (var i = 0; i < searchTriggers.length; i++) {
        searchTriggers[i].addEventListener('click', function(e) {
            e.preventDefault();
            openSearch();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSearch);
    }

    input.addEventListener('input', handleInput);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeydown);

    // Initialize
    showEmptyState();
    console.log('Custom Search ready');
});
