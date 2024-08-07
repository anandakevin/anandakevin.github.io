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

const tabsExp = document.querySelectorAll('.tab');
// let navbarLinks2 = select('.navbar-link', true)

tabsExp.forEach(item => {
	item.addEventListener('click', (e) => toggleExp(e, 'bca'));
})

// Tabs Toggler

// Variables
const $tabLink = $('#tabs-section .tab-link');
const $tabBody = $('#tabs-section .tab-body');
let timerOpacity;

// Toggle Class
const init = () => {
	var slidingComponent = $('.sliding-border');
	var listHeight = $('.tab-link').outerHeight();
	var listWidth = $('.tab-link').outerWidth();
	var docWidth = $(window).width();
	slidingComponent.css('height', listHeight);

	// Menu Click
	$tabLink.off('click').on('click', function (e) {
		// Prevent Default
		e.preventDefault();
		e.stopPropagation();

		// Clear Timers
		window.clearTimeout(timerOpacity);
		// Toggle Class Logic
		// Remove Active Classes on the same section
		// $tabLink.removeClass('active ');
		$(this).parent().parent().find('.active').removeClass('active ');
		$($(this).attr('href')).parent().find('.active').removeClass('active active-content');

		var currTab = $(this).attr('href');
		const currTabArray = currTab.split("-");
		var sectionIndex = currTabArray[1] - 1;

		// Add Active Classes
		$(this).addClass('active');
		$($(this).attr('href')).addClass('active');

		// Opacity Transition Class
		timerOpacity = setTimeout(() => {
			$($(this).attr('href')).addClass('active-content');
		}, 50);

		// slide the tab-slider
		docWidth = $(window).width();
		if (docWidth < 600) {
			let activePosition = $(this).position().left;
			listWidth = $(this).outerWidth();

			console.log('listHeight', listHeight);
			console.log('listWidth', listWidth);
			slidingComponent.eq(sectionIndex).css('height', '2px');
			slidingComponent.eq(sectionIndex).css('width', listWidth);
			slidingComponent.eq(sectionIndex).css('transform', 'translateX(' + activePosition + 'px)');
		}
		else if (docWidth >= 600) {
			let activePosition = $(this).position().top;
			listHeight = $(this).outerHeight();


			console.log('listHeight', listHeight);
			console.log('listWidth', listWidth);
			// slidingComponent.css('height', listHeight);
			// slidingComponent.css('width', '2px');
			// slidingComponent.css('transform', 'translateY(' + activePosition + 'px)');
			slidingComponent.eq(sectionIndex).css('height', listHeight);
			slidingComponent.eq(sectionIndex).css('width', '2px');
			slidingComponent.eq(sectionIndex).css('transform', 'translateY(' + activePosition + 'px)');
		}
	});


	setTimeout(function () {

		listHeight = $('.tab-link').outerHeight();
		listWidth = $('.tab-link').outerWidth();

		if (docWidth < 600) {
			slidingComponent.css('height', '2px');
			slidingComponent.css('width', listWidth);
		}
		else if (docWidth >= 600) {
			slidingComponent.css('height', listHeight);
			slidingComponent.css('width', '2px');
		}

		// 	$.each($tabLink, function (index, value) {
		// 		var currTab = $(this).attr('href');
		// 		const currTabArray = currTab.split("-");
		// 		var tabIndex = currTabArray[2] - 1;
		// 		if (tabIndex == 0) $(this).trigger('click');
		// 	})
	}, 100);

	$(window).on('resize', function () {
		var win = $(this); //this = window
		if (win.width() < 600) {
			slidingComponent.css('height', '2px');
			slidingComponent.css('width', listWidth);
		}
		if (win.width() >= 600) {
			slidingComponent.css('height', listHeight);
			slidingComponent.css('width', '2px');
		}
	});
};


// Document Ready
init();


// const navbarLinksActive = () => {
//   let position = window.scrollY + 200;

// }
// window.addEventListener('load', navbarLinksActive);
// onscroll(document, navbarLinksActive);
