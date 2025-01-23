import '../scss/styles.scss';
import '../scss/base/font-styles.scss';
import '../scss/components/figures.scss';

import { loadComponents } from './utils/components';
import { Navbar } from './components/navbar';
import { TabSystem } from './components/tab-system';
import { initializeAOS } from './utils/aos-config';

// Check if DOM is already loaded
const domReadyHandler = () => {
	// Initialize components
	new Navbar();

	// Initialize tab systems
	document.querySelectorAll('#tabs-section').forEach(section => {
		new TabSystem(section);
	});

	// Initialize AOS
	initializeAOS();
};

// Load components first
loadComponents().then(() => {

	// Check if DOM is already loaded
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReadyHandler);
	} else {
		// DOM is already loaded, run handler immediately
		domReadyHandler();
	}
});
