import '../scss/styles.scss';
import '../scss/font-styles.scss';
import '../scss/figures.scss';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import * as bootstrap from 'bootstrap';
import $ from 'jquery';

// ..
AOS.init({
  // Global settings:
  disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
  startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
  initClassName: 'aos-init', // class applied after initialization
  animatedClassName: 'aos-animate', // class applied on animation
  useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
  throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
  

  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 400, // values from 0 to 3000, with step 50ms
  easing: 'ease', // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

});


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

// function for navbar
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

// function for sticky navbar
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

// function for tabs
// export function toggleExp(e, exp) {
export const toggleExp = (e, exp) => {
	// Declare all variables
	var i, tabcontent, tablinks;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}

	// Show the current tab, and add an "active" class to the link that opened the tab
	document.getElementById(exp).style.display = "block";
	e.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
navbarLinksContainer.addEventListener('click', (e) => e.stopPropagation());

const tabsExp = document.querySelectorAll('.tab');
// let navbarLinks2 = select('.navbar-link', true)

tabsExp.forEach(item => {
	item.addEventListener('click', (e) => toggleExp(e, 'bca'));
})

document.getElementById("defaultOpen").click();

// Tabs Toggler

// Variables
const $tabLink = $('#tabs-section .tab-link');
const $tabBody = $('#tabs-section .tab-body');
let timerOpacity;

// Toggle Class
const init = () => {
	console.log("abc");
	// Menu Click
	$tabLink.off('click').on('click', function (e) {
		// Prevent Default
		e.preventDefault();
		e.stopPropagation();

		// Clear Timers
		window.clearTimeout(timerOpacity);

		console.log("abc");
		// Toggle Class Logic
		// Remove Active Classes
		$tabLink.removeClass('active ');
		$tabBody.removeClass('active ');
		$tabBody.removeClass('active-content');

		// Add Active Classes
		$(this).addClass('active');
		$($(this).attr('href')).addClass('active');

		// Opacity Transition Class
		timerOpacity = setTimeout(() => {
			$($(this).attr('href')).addClass('active-content');
		}, 50);
	});
};

// Document Ready
init();


// const navbarLinksActive = () => {
//   let position = window.scrollY + 200;

// }
// window.addEventListener('load', navbarLinksActive);
// onscroll(document, navbarLinksActive);
