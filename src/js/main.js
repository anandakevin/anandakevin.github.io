import '../scss/styles.scss';
import '../scss/base/font-styles.scss';
import '../scss/components/figures.scss';

import { loadComponents } from './utils/components';
import { Navbar } from './components/navbar';
import { TabSystem } from './components/tab-system';
import { initializeAOS } from './utils/aos-config';

// Load components first
loadComponents().then(() => {
	document.addEventListener('DOMContentLoaded', () => {
		console.log('asd');
		// Initialize components
		new Navbar();

		// Initialize tab systems
		document.querySelectorAll('#tabs-section').forEach(section => {
			new TabSystem(section);
		});

		// Initialize AOS
		initializeAOS();
	});
});
