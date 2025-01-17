export const NAVBAR_CONFIG = {
    links: [
        { href: '#about', text: 'About' },
        { href: '#exp', text: 'Experience' },
        { href: '#edu', text: 'Education' },
        { href: '#projects', text: 'Projects' },
        { href: '#awards', text: 'Awards' },
        { href: '#scholarships', text: 'Scholarships' },
        { href: '#tools', text: 'Stacks' },
        { href: '#contact', text: 'Contact' }
    ],
    resume: {
        href: 'https://1drv.ms/b/s!Apd7mJ6mZOk2iswqz8YZXuGliDU5vg?e=gjXe4j',
        text: 'Resume'
    }
};

export class Navbar {
    constructor() {
        // Initialize properties
        this.navbar = document.querySelector('#navbar');
        this.navbarToggle = document.querySelector('#navbar-toggle');
        this.navbarMenu = document.querySelector('#navbar-menu');
        this.navbarLinksContainer = this.navbarMenu.querySelector('.navbar-links');
        this.navbarLinks = document.querySelectorAll('.navbar-link');
        this.isNavbarExpanded = false;
        this.prevScrollPos = window.scrollY || window.pageYOffset;

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Navbar toggle functionality
        this.navbarToggle.addEventListener('click', () => this.toggleNavbarVisibility());
        this.navbarLinksContainer.addEventListener('click', (e) => e.stopPropagation());
        this.navbarMenu.addEventListener('click', () => this.toggleNavbarVisibility());

        // Setup link click handlers
        this.navbarLinks.forEach(item => {
            item.addEventListener('click', () => this.toggleNavbarVisibility());
        });

        // Setup scroll handlers
        window.addEventListener('load', () => this.updateActiveNavLinks());
        window.addEventListener('scroll', () => {
            this.handleStickyNavbar();
            this.updateActiveNavLinks();
        });
    }

    toggleNavbarVisibility() {
        this.isNavbarExpanded = !this.isNavbarExpanded;
        this.navbarToggle.setAttribute('aria-expanded', this.isNavbarExpanded);
    }

    handleStickyNavbar() {
        const currentScrollPos = window.scrollY || window.pageYOffset;

        if (this.prevScrollPos > currentScrollPos) {
            this.navbar.style.top = "0";
        } else {
            this.navbar.style.top = "-100px";
        }

        this.prevScrollPos = currentScrollPos;
    }

    updateActiveNavLinks() {
        const position = window.scrollY + 150;

        this.navbarLinks.forEach(item => {
            if (!item.hash) return;

            const section = document.querySelector(item.hash);
            if (!section) return;

            if (position >= section.offsetTop &&
                position <= (section.offsetTop + section.offsetHeight)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
} 