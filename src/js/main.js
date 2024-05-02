import '../scss/styles.scss';
import '../scss/font-styles.scss';
import '../scss/figures.scss';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
AOS.init();

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
navbarMenu.addEventListener('click', toggleNavbarVisibility);

const navbarLinks = document.querySelectorAll('.navbar-link');
// let navbarLinks2 = select('.navbar-link', true)

navbarLinks.forEach(item => {
  item.addEventListener('click', toggleNavbarVisibility);
})

var prevScrollPos = window.scrollY || window.pageYOffSet;
window.onscroll = function() {
  var currentScrollPos = window.scrollY || window.pageYOffSet;
  var position = currentScrollPos + 150;

  if (prevScrollPos > currentScrollPos) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-100px";
  }
  prevScrollPos = currentScrollPos;

  navbarLinks.forEach(item => {
    if (!item.hash) return;
    let section = document.querySelector(item.hash);
    if (!section) return;
    if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  })
}

// const navbarLinksActive = () => {
//   let position = window.scrollY + 200;

// }
// window.addEventListener('load', navbarLinksActive);
// onscroll(document, navbarLinksActive);