export class TabSystem {
    constructor(container) {
        // Core elements
        this.container = container;
        this.slidingBorder = $('.sliding-border');

        // jQuery elements
        this.tabLink = $('#tabs-section .tab-link');
        this.tabBody = $('#tabs-section .tab-body');

        // State
        this.timerOpacity = null;
        this.listHeight = null;
        this.listWidth = null;

        this.init();
    }

    init() {
        this.setupTabClickHandlers();
        this.initializeSlidingBorder();
        this.setupResizeHandler();
    }

    setupTabClickHandlers() {
        this.tabLink.off('click').on('click', (e) => {
            e.preventDefault();
            const index = Array.from(this.tabLink).indexOf(e.currentTarget);
            this.handleTabClick(e, index);
        });
    }

    handleTabClick(e, index) {
        e.preventDefault();
        e.stopPropagation();

        clearTimeout(this.timerOpacity);

        const $currentTab = $(e.currentTarget);
        const $parent = $currentTab.parent().parent();
        const targetId = $currentTab.attr('href');
        const sectionIndex = targetId.split("-")[1] - 1;

        // Remove active classes
        $parent.find('.active').removeClass('active');
        $(targetId).parent().find('.active').removeClass('active active-content');

        // Add active classes
        $currentTab.addClass('active');
        $(targetId).addClass('active');

        // Handle content transition
        this.timerOpacity = setTimeout(() => {
            $(targetId).addClass('active-content');
        }, 50);

        this.updateSlidingBorder($currentTab, sectionIndex);
    }

    updateSlidingBorder($tab, sectionIndex) {
        const docWidth = $(window).width();
        const position = $tab.position();
        // console.log('sectionIndex ', sectionIndex);
        // console.log('position ', position);

        if (docWidth < 600) {
            this.listWidth = $tab.outerWidth();
            this.slidingBorder.eq(sectionIndex)
                .css({
                    height: '2px',
                    width: this.listWidth,
                    transform: `translateX(${position.left}px)`
                });
        } else {
            this.listHeight = $tab.outerHeight();
            this.slidingBorder.eq(sectionIndex)
                .css({
                    height: this.listHeight,
                    width: '2px',
                    transform: `translateY(${position.top}px)`
                });
        }
    }

    initializeSlidingBorder() {
        setTimeout(() => {
            const tabLink = $('.tab-link');
            this.listHeight = tabLink.outerHeight();
            this.listWidth = tabLink.outerWidth();
            const docWidth = $(window).width();

            this.slidingBorder.css({
                height: docWidth < 600 ? '2px' : this.listHeight,
                width: docWidth < 600 ? this.listWidth : '2px'
            });
        }, 100);
    }

    setupResizeHandler() {
        $(window).on('resize', () => {
            const width = $(window).width();
            this.slidingBorder.css({
                height: width < 600 ? '2px' : this.listHeight,
                width: width < 600 ? this.listWidth : '2px'
            });
        });
    }


}