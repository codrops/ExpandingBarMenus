/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 *
 *
 * todos:
 * 		Need to fix extramovable elements animations. For example, for the demos provided, need to fix the direction of the animation for the content element when it's on the left or under the tabs.
 *	  	Add animation settings for the toggle visibility function.
 *	    Count with scroll values in the calculations.
 *		Control the tite better so one could remove it from the page once open.
 *		...
 */
;(function(window) {

	'use strict';

	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	// From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	var win = {width: window.innerWidth, height: window.innerHeight};

	/**
	 * TabsNav obj.
	 */
	function TabsNav(el, options) {
		this.DOM = {};
		this.DOM.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this._init();
	}

	/**
	 * TabsNav default options.
	 */
	TabsNav.prototype.options = {
		movable: 'all', // 'all': all the tabs || 'single': only the clicked tab
		//extramovable: null,
		layout: 'vertical', // or 'horizontal'
		animeduration: 1300,
		animeeasing: 'easeOutExpo',
		animedelay: 0,
		onOpenTab: function(idx, tab) { return false; },
		onCloseTab: function(idx, tab) { return false; },
		onOpenBarsUpdate: function(anim, idx, tab) {return false; }
	};

	/**
	 * Init. Create layout and initialize/bind any events.
	 */
	TabsNav.prototype._init = function() {
		this.DOM.tabs = [].slice.call(this.DOM.el.querySelectorAll('.tabsnav__item'));
		this.DOM.bars = [].slice.call(this.DOM.el.querySelectorAll('.tabsnav__bar'));

		this.totalTabs = this.DOM.tabs.length;
		this.extraEl = document.querySelector(this.options.extramovable);

		this._initEvents();
	};

	/**
	 * Initialize/Bind any events.
	 */
	TabsNav.prototype._initEvents = function() {
		var self = this;

		// Clicking a tab.
		this._openTabFn = function(ev) {
			if( !self.isOpen ) {
				self._openTab(ev.target);
			}
		};
		this.DOM.tabs.forEach(function(tab) {
			// Clicking a tab...
			tab.addEventListener('click', self._openTabFn);
		});

		// Window resize.
		this.debounceResizeFn = debounce(function() {
			self._resize();
		}, 10);
		window.addEventListener('resize', this.debounceResizeFn);

		enquire.register('screen and (min-width:0) and (max-width:40em)', { 
			match: function() {
				// hide if tabs are not open
				if(!self.isOpen && !self.isVisible) {
					self.DOM.el.classList.add('tabsnav--hidden');
				}
			}
		});
		enquire.register('screen and (min-width:40em)', { 
			match: function() {
				// show
				if( !self.DOM.el.classList.contains('tabsnav--hidden-default') ) {
					self.DOM.el.classList.remove('tabsnav--hidden');
				}
			}
		});
	};

	/**
	 * Opens a tab/page.
	 */
	TabsNav.prototype._openTab = function(tab) {
		// If animating do nothing.
		if( this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;

		// Update current value (index of the current tab).
		this.current = this.DOM.tabs.indexOf(tab);

		var bounds = tab.getBoundingClientRect(),
			currentDimensions = { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
			self = this;
		
		// Choose the dimentions based on the layout mode.
		this.dim = {
			measure: this.options.layout === 'vertical' ? currentDimensions.width : currentDimensions.height,
			position: this.options.layout === 'vertical' ? currentDimensions.left : currentDimensions.top,
			win: this.options.layout === 'vertical' ? win.width : win.height
		};

		this.DOM.bars.forEach(function(bar) {
			// Set transform origin on the respective bar.
			bar.style.transformOrigin = self.options.layout === 'vertical' ? '0% 50%' : '50% 0%';
		});
		
		// Set z-indexes.
		this.DOM.tabs.forEach(function(tab, idx) { tab.style.zIndex = idx === self.current ? 100 : 1; });
		
		// Animate tabs and bars.
		var animeTabs = { targets: this.options.movable === 'all' ? this.DOM.tabs : this.DOM.tabs[this.current] },
			animeBars = { targets: this.options.movable === 'all' ? this.DOM.bars : this.DOM.bars[this.current] },
			animeTabsDelay = function(target, index, cnt) {
				if( cnt === 1 || self.options.animedelay === 0 ) {
					return 0;
				}
				else {
					var total = cnt+1, middle = Math.floor(total/2);
					if( self.current >= middle ) {
						return index <= self.current ? index * self.options.animedelay : (total - index - 1) * self.options.animedelay;
					}
					else {
						return index < self.current ? index * self.options.animedelay : (total - index - 1) * self.options.animedelay;
					}
				}
			},
			animeTabsTranslation = function(target, index, cnt) {
				if( index === self.current || cnt === 1 ) {
					return -1 * self.dim.position;
				}
				else {
					var pixels = 1; // adding an extra pixel for the translation due to the fuzzy rendering.
					return index > self.current ? self.dim.win - (self.dim.position + self.dim.measure) - pixels : -1 * self.dim.position + pixels;
				}
			},
			animeBarsScale = function(target, index, cnt) {
				return index === self.current || cnt === 1 ? self.dim.win/self.dim.measure : 1;
			}

		animeTabs.duration = animeBars.duration = this.options.animeduration;
		animeTabs.easing = animeBars.easing = this.options.animeeasing;
		animeTabs.delay = animeBars.delay = animeTabsDelay;
		animeTabs[this.options.layout === 'vertical' ? 'translateX' : 'translateY'] = animeTabsTranslation;
		animeBars[this.options.layout === 'vertical' ? 'scaleX' : 'scaleY'] = animeBarsScale;
		animeTabs.complete = function() {
			self.isAnimating = false; 
			self.isOpen = true;
			// Callback
			self.options.onOpenTab(self.current, tab);
		};
		animeBars.update = function(anim) { 
			self.options.onOpenBarsUpdate(anim, self.current, tab);
		}
		
		anime(animeTabs);
		anime(animeBars);

		// Animate extramovable elements.
		if( this.extraEl ) {
			var animeExtra = {
					targets: this.extraEl,
					duration: this.options.animeduration,
					easing: this.options.animeeasing,
					delay: 0
				},
				extraBounds = this.extraEl.getBoundingClientRect(),
				animeExtraTranslation = this.options.layout === 'vertical' ? this.dim.win - (this.dim.position + this.dim.measure) + Math.abs(extraBounds.left - this.dim.position) + this.dim.measure : -1 * this.dim.position;

			animeExtra[this.options.layout === 'vertical' ? 'translateX' : 'translateY'] = animeExtraTranslation;	
			anime(animeExtra);
		}
	};

	/**
	 * Closes a tab/page.
	 */
	TabsNav.prototype._closeTab = function(tab) {
		// If animating do nothing.
		if( this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;

		// Animate tabs and bars.
		var self = this,
			animeTabs = { targets: this.options.movable === 'all' ? this.DOM.tabs : this.DOM.tabs[this.current] },
			animeBars = { targets: this.options.movable === 'all' ? this.DOM.bars : this.DOM.bars[this.current] },
			animeTabsDelay = function(target, index, cnt) {
				return cnt === 1 || self.options.animedelay === 0 ? 0 : Math.abs(self.current - index) * self.options.animedelay;
			};

		animeTabs.duration = animeBars.duration = this.options.animeduration;
		animeTabs.easing = animeBars.easing = this.options.animeeasing;
		animeTabs.delay = animeBars.delay = animeTabsDelay;
		animeTabs[this.options.layout === 'vertical' ? 'translateX' : 'translateY'] = 0;
		animeBars[this.options.layout === 'vertical' ? 'scaleX' : 'scaleY'] = 1;
		animeTabs.complete = function() {
			// Reset z-indexes.
			tab.style.zIndex = 1;
			self.isAnimating = false; 
			self.isOpen = false;
			// Callback
			self.options.onCloseTab(self.current, tab);
		};
		
		anime(animeTabs);
		anime(animeBars);

		// Animate extramovable elements.
		if( this.extraEl ) {
			var animeExtra = {
					targets: this.extraEl,
					duration: this.options.animeduration,
					easing: this.options.animeeasing,
					delay: Math.abs(this.current - this.totalTabs) * this.options.animedelay
				};

			animeExtra[this.options.layout === 'vertical' ? 'translateX' : 'translateY'] = 0;	
			anime(animeExtra);
		}
	};

	/**
	 * Closes the tabs.
	 */
	TabsNav.prototype.close = function(tab) {
		this._closeTab(tab || this.DOM.tabs[this.current]);
	}

	/**
	 * Shows the TabsNav element.
	 */
	TabsNav.prototype.show = function(callback) {
		var self = this;

		this.isVisible = true;

		this.DOM.tabs.forEach(function(tab) { 
			var bar = tab.querySelector('.tabsnav__bar'),
				title = tab.querySelector('.tabsnav__title');

			// Set transform origin.
			bar.style.transformOrigin = '50% 50%';
			bar.style.transform = self.options.layout === 'vertical' ? 'scaleX(0)' : 'scaleY(0)';

			title.style.opacity = 0;
			title.style.transform = self.options.layout === 'vertical' ? 'translateX(10) rotate(-90)' : 'translateY(10)';
		});

		this.DOM.el.classList.remove('tabsnav--hidden');
		
		// Animate bars.
		anime.remove(this.DOM.bars);
		var animeBars = {
			targets: this.DOM.bars,
			duration: 500,
			delay: function(t,i) {
				return i*50;
			},
			easing: 'easeOutExpo',
			complete: function() {
				if( typeof callback === 'function' ) {
					callback.call();
				}
			}
		};
		animeBars[this.options.layout === 'vertical' ? 'scaleX' : 'scaleY'] = [0,1];
		anime(animeBars);

		// Animate titles.
		var titles = this.DOM.el.querySelectorAll('.tabsnav__title');
		anime.remove(titles);
		var animeTitles = {
			targets: titles,
			duration: 500,
			delay: function(t,i) {
				return i*50;
			},
			easing: 'easeOutExpo',
			opacity: [0,1]
		};
		animeTitles[this.options.layout === 'vertical' ? 'translateX' : 'translateY'] = [10,0];
		animeTitles.rotate = self.options.layout === 'vertical' ? [-90,-90] : 0;
		anime(animeTitles);
	}
	/**
	 * Hides the TabsNav element.
	 */
	TabsNav.prototype.hide = function(callback) {
		var self = this;

		this.isVisible = false;

		this.DOM.bars.forEach(function(bar) {
			// Set transform origin.
			bar.style.transformOrigin = '50% 50%';
		});

		// Animate bars.
		anime.remove(this.DOM.bars);
		var animeBars = {
			targets: this.DOM.bars,
			duration: 500,
			easing: 'easeOutExpo',
			delay: function(t,i,c) {
				return (c-i-1)*50;
			},
			complete: function() {
				self.DOM.el.classList.add('tabsnav--hidden');
				// reset all values.
				self.DOM.tabs.forEach(function(tab) { 
					var bar = tab.querySelector('.tabsnav__bar'),
						title = tab.querySelector('.tabsnav__title');

					bar.style.transform = self.options.layout === 'vertical' ? 'scaleX(1)' : 'scaleY(1)';

					title.style.opacity = 1;
					title.style.transform = self.options.layout === 'vertical' ? 'translateX(0) rotate(-90)' : 'translateY(0)';
				});

				if( typeof callback === 'function' ) {
					callback.call();
				}
			}
		};
		animeBars[this.options.layout === 'vertical' ? 'scaleX' : 'scaleY'] = [1,0];
		anime(animeBars);

		// Animate titles.
		var titles = this.DOM.el.querySelectorAll('.tabsnav__title');
		anime.remove(titles);
		var animeTitles = {
			targets: titles,
			duration: 100,
			delay: function(t,i,c) {
				return (c-i-1)*50;
			},
			easing: 'linear',
			opacity: [1,0]
		};
		anime(animeTitles);
	}

	/**
	 * Toggle visibility.
	 */
	TabsNav.prototype.toggleVisibility = function() {
		// If animating do nothing.
		if( this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;

		var self = this, endAnimation = function() { self.isAnimating = false; };

		if( this.isVisible ) {
			this.hide(endAnimation);
			return 0;
		}
		else {
			this.show(endAnimation);
			return 1;
		}
	};

	/**
	 * Resizing the window.
	 */
	TabsNav.prototype._resize = function() {
		var self = this;
		win = {width: window.innerWidth, height: window.innerHeight};
		
		// If tabs are open then update translate & scale values taking in consideration the new window sizes.
		if( this.isOpen ) {
			// Update dim.win value.
			this.dim.win = this.options.layout === 'vertical' ? win.width : win.height;	

			var currentTab = this.DOM.tabs[this.current],
				translateStr = this.options.layout === 'vertical' ? 'translateX' : 'translateY',
				scaleStr = this.options.layout === 'vertical' ? 'scaleX' : 'scaleY';

			// Reset tabs/bars translation and scale values.
			this.DOM.tabs.forEach(function(tab, idx) {
				if( self.options.movable === 'all' || self.options.movable === 'single' && idx === self.current ) {
					var bar = self.DOM.bars[idx], tVal, sVal;

					if( idx === self.current ) {
						tVal = -1 * self.dim.position;
						sVal = self.dim.win/self.dim.measure;
					}
					else {
						tVal = idx > self.current ? self.dim.win - (self.dim.position + self.dim.measure) : -1 * self.dim.position;
						sVal = 1;
					}

					tab.style.transform = translateStr + '(' + tVal + 'px)';
					bar.style.transform = scaleStr + '(' + sVal + ')';
				}
			});

			// Reset extramovable elements 
			if( this.extraEl ) {
				this.extraEl.style.transform = translateStr + '(' + (this.options.layout === 'vertical' ? this.dim.win - (this.dim.position + this.dim.measure) : -1 * this.dim.position) + 'px)';
			}
		}
	};

	window.TabsNav = TabsNav;

})(window);
