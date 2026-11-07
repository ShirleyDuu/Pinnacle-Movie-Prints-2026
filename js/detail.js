
// -------------------- browse poster details in context -------------------- //

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const requestedImage = params.get('imageUrl');
    const rail = document.getElementById('detail-rail');
    const poster = document.getElementById('poster-detail-img');

    const fileNameFrom = imagePath => {
        try {
            return decodeURIComponent(new URL(imagePath, window.location.href).pathname.split('/').pop());
        } catch (_) {
            return decodeURIComponent(String(imagePath).split('/').pop());
        }
    };
    const posterPath = fileName => `./assets/posters/${fileName}`;
    const allEntries = () => Object.entries(movies);

    function orderedHomePosters() {
        const mode = sessionStorage.getItem('currentSorting') || 'color';
        const entries = allEntries();
        if (mode === 'year') return entries.sort(([, a], [, b]) => a.year - b.year);
        if (mode === 'title') return entries.sort(([, a], [, b]) => a.title.localeCompare(b.title));
        if (mode === 'ranking') return entries.sort(([a], [b]) => Number(a.split(' ')[0]) - Number(b.split(' ')[0]));
        if (typeof fixedColorPosterOrder !== 'undefined') {
            const byRank = new Map(entries.map(entry => [Number(entry[0].split(' ')[0]), entry]));
            return fixedColorPosterOrder.map(({ rank }) => byRank.get(rank)).filter(Boolean);
        }
        return entries.sort(([a], [b]) => Number(a.split(' ')[0]) - Number(b.split(' ')[0]));
    }

    function currentSequence() {
        if (from === 'myFavorites') return JSON.parse(localStorage.getItem('starImages')) || [];
        if (from === 'seenBefore') return JSON.parse(localStorage.getItem('seenImages')) || [];
        return orderedHomePosters().map(([fileName]) => posterPath(fileName));
    }

    const sequence = currentSequence().filter(path => movies[fileNameFrom(path)]);
    const initial = sequence.find(path => fileNameFrom(path) === fileNameFrom(requestedImage || '')) || sequence[0];
    if (!initial) return;

    const syncCenteredLayout = () => {
        requestAnimationFrame(() => {
            const width = poster.getBoundingClientRect().width;
            if (!width) return;
            document.documentElement.style.setProperty('--detail-poster-half', `${width / 2}px`);

            // Keep the original back button fixed. The rail is placed midway
            // between that button and the (slightly left-biased) main poster.
            // The copy on the right intentionally has its own, tighter gap.
            if (window.innerWidth > 900) {
                const back = document.getElementById('back-circle');
                const railWidth = document.getElementById('detail-rail').getBoundingClientRect().width;
                const leftEdge = poster.getBoundingClientRect().left;
                const gap = (leftEdge - back.getBoundingClientRect().right - railWidth) / 2;
                if (gap > 0) document.documentElement.style.setProperty('--detail-rail-gap', `${gap}px`);
            }
        });
    };
    poster.addEventListener('load', syncCenteredLayout);
    window.addEventListener('resize', syncCenteredLayout);

    function updateDetail(imagePath, scrollRail = true) {
        const fileName = fileNameFrom(imagePath);
        const movie = movies[fileName];
        if (!movie) return;

        poster.src = imagePath;
        poster.alt = `${movie.title} poster`;
        document.getElementById('movie-title').innerText = movie.title;
        document.getElementById('year').innerText = movie.year;
        document.getElementById('director-detail').innerText = movie.director;
        document.getElementById('producer-detail').innerText = movie.producer;
        document.getElementById('writer-detail').innerText = movie.writer;
        document.getElementById('cast-detail').innerText = movie.cast;
        document.getElementById('time-detail').innerText = movie.time;
        document.title = `${movie.title} — Poster Detail`;

        rail.querySelectorAll('.detail-rail-poster').forEach(button => {
            const active = button.dataset.fileName === fileName;
            button.classList.toggle('is-selected', active);
            button.setAttribute('aria-current', active ? 'true' : 'false');
            if (active && scrollRail) button.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });

        params.set('imageUrl', imagePath);
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        document.dispatchEvent(new CustomEvent('posterchange'));
    }

    sequence.forEach(imagePath => {
        const fileName = fileNameFrom(imagePath);
        const movie = movies[fileName];
        const button = document.createElement('button');
        button.className = 'detail-rail-poster';
        button.type = 'button';
        button.dataset.fileName = fileName;
        button.setAttribute('aria-label', `View ${movie.title}`);
        const thumbnail = document.createElement('img');
        thumbnail.src = imagePath;
        thumbnail.alt = '';
        button.appendChild(thumbnail);
        button.addEventListener('click', () => updateDetail(imagePath));
        rail.appendChild(button);
    });

    updateDetail(initial, false);
    requestAnimationFrame(() => {
        syncCenteredLayout();
        updateDetail(initial, true);
    });
});
