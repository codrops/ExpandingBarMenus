(function() {
	var tnav = new TabsNav(document.querySelector('nav.tabsnav'), {
			movable: 'all',
			layout: 'horizontal',
			animeduration: 600,
			animeeasing: [0.2,1,0.3,1],
			animedelay: 50,
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
		if( anim.progress > 40 && !isContentShown ) {
			isContentShown = true;
			current = idx;

			var contentItem = contentItems[idx],
				content = contentItem.querySelector('.box');

			// Hide the content elements.
			content.style.opacity = 0;
			// Show content item.
			contentItem.style.opacity = 1;
			contentItem.classList.add('tabscontent__item--current');

			// Animate content elements in.
			anime.remove(content);
			anime({
				targets: content,
				easing: [0.2,1,0.3,1],
				duration: 600,
				translateY: [400,0],
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
			content = contentItem.querySelector('.box');

		// Hide the content elements.
		anime.remove(content);
		// Animate content elements out.
		anime({
			targets: content,
			duration: 600,
			easing: [0.2,1,0.3,1],
			translateY: [0,400],
			opacity: {
				value: 0,
				duration: 100,
				easing: 'linear'
			},
			update: function(anim) {
				if( anim.progress > 30 && isContentShown ) {
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

			// Scale up content
			anime.remove('.content');
			anime({
				targets: '.content',
				duration: 600,
				easing: [0.2,1,0.7,1],
				opacity: 1,
				scale: 1
			});
		}
		else if( state === 1 ) {
			menuCtrl.classList.add('btn--menu-active');

			// Scale down content
			anime.remove('.content');
			anime({
				targets: '.content',
				duration: 600,
				easing: [0.2,1,0.7,1],
				opacity: 0.2,
				scale: 0.9
			});
		}
	}
})();