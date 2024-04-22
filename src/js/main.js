import '../scss/styles.scss';
import '../scss/font-styles.scss';
import '../scss/figures.scss';

import * as bootstrap from 'bootstrap';

// const http = require('http')

// const hostname = '127.0.0.1'
// const port = 3000

// const server = http.createServer((req, res) => {
//     res.statusCode = 200
//     res.setHeader('Content-Type', 'text/plain')
//     res.end('Hello World\n')
// })

// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`)
// })

const navbarToggle = navbar.querySelector('#navbar-toggle');
let isNavbarExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';

const toggleNavbarVisibility = () => {
	isNavbarExpanded = !isNavbarExpanded;
	navbarToggle.setAttribute('aria-expanded', isNavbarExpanded);
};

navbarToggle.addEventListener('click', toggleNavbarVisibility);

const navbarMenu = document.querySelector('#navbar-menu');
const navbarLinksContainer = navbarMenu.querySelector('.navbar-links');

navbarLinksContainer.addEventListener('click', (e) => e.stopPropagation());
// navbarMenu.addEventListener('click', toggleNavbarVisibility);