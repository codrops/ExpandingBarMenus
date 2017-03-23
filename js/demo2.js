(function() {
	var tnav = new TabsNav(document.querySelector('nav.tabsnav'), {
			movable: 'all',
			layout: 'vertical',
			animeduration: 1000,
			animeeasing: 'easeOutExpo',
			onOpenBarsUpdate: openTabCallback,
			onOpenTab: function() {
				// Show the back button after the tab is open.
				anime({
					targets: backCtrl,
					duration: 600,
					easing: 'easeOutExpo',
					scale: [0,1],
					opacity: {
						value: 1,
						duration: 300,
						easing: 'linear'
					}
				});
			}
		}),

		// The content items and the back control.
		contentItems = [].slice.call(document.querySelectorAll('.tabscontent > .tabscontent__item')),
		backCtrl = document.querySelector('.tabscontent > button.btn--back'),
		// menu ctrl for smaller screens (the tabs are not initially shown and toggling this button will show/hide the tabs)
		menuCtrl = document.querySelector('button.btn--menu'),
		isContentShown = false, current;

	function openTabCallback(anim, idx, tab) {
		if( anim.progress > 10 && !isContentShown ) {
			isContentShown = true;
			current = idx;

			var contentItem = contentItems[idx],
				content = [].slice.call(contentItem.querySelectorAll('.column > *'));

			// Hide the content elements.
			content.forEach(function(el) { el.style.opacity = 0; });
			// Show content item.
			contentItem.style.opacity = 1;
			contentItem.classList.add('tabscontent__item--current');

			// Animate content elements in.
			anime.remove(content);
			anime({
				targets: content,
				easing: 'easeOutExpo',
				duration: 600,
				delay: function(t,i) {
					return i*30;
				},
				translateY: function(t,i) {
					return [50+10*i,0];
				},
				opacity: {
					value: 1,
					duration: 600,
					easing: 'linear'
				}
			});
		}
	}

	backCtrl.addEventListener('click', closeTabs);

	function closeTabs() {
		if( !tnav.isOpen ) return;

		var contentItem = contentItems[current],
			content = [].slice.call(contentItem.querySelectorAll('.column > *'));

		// Hide the content elements.
		anime.remove(content);
		// Animate content elements out.
		anime({
			targets: content,
			easing: 'easeOutExpo',
			duration: 600,
			delay: function(t,i,c) {
				return (c-i-1)*20;
			},
			translateY: function(t,i) {
				return [0,50+10*i];
			},
			opacity: {
				value: 0,
				duration: 100,
				easing: 'linear'
			},
			update: function(anim) {
				if( anim.progress > 20 && isContentShown ) {
					isContentShown = false;
					// Close tab.
					tnav.close();
				}
			},
			complete: function() {
				// Hide content item.
				contentItem.style.opacity = 0;
				contentItem.classList.remove('tabscontent__item--current');
			}
		});

		// Hide back ctrl
		anime.remove(backCtrl);
		anime({
			targets: backCtrl,
			duration: 300,
			easing: 'easeOutExpo',
			scale: [1,0],
			opacity: {
				value: 0,
				duration: 100,
				easing: 'linear'
			}
		});
	}

	menuCtrl.addEventListener('click', toggleTabs);

	function toggleTabs() {
		var state = tnav.toggleVisibility();
		if( state === 0 ) {
			menuCtrl.classList.remove('btn--menu-active');
		}
		else if( state === 1 ) {
			menuCtrl.classList.add('btn--menu-active');
		}
	}

})();