const sendAjaxRequest = ({ data, onSuccess, onEnd }) => {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/ajax', true);
	xhr.setRequestHeader('X-REQUESTED-WITH', 'XMLHttpRequest');
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.onload = () => {
		try {
			if (xhr.status === 200) {
				onSuccess(JSON.parse(xhr.responseText));
			}
			else {
				console.error('An error occurred while sending data. Response:', xhr.responseText);
			}
		}
		catch (err) {
			console.error('An error has occurred.', err);
		}
		finally {
			onEnd();
		}
	};
	xhr.onerror = () => {
		console.error('A network error has occurred');
		onEnd();
	};
	xhr.send(JSON.stringify(data));
};

const likeIconProcess = (likeInfoElem, userId, authorId) => {
	likeInfoElem.classList.add('cursor_pointer');
	likeInfoElem.addEventListener('click', (e) => {
		let elem = e.target || e.src;
		if (!elem.dataset['filename']) {
			elem = elem.parentNode;
		}
		authorId = authorId || elem.dataset['authorid'].trim();
		if (authorId == userId) {
			return;
		}
		if (elem.classList.contains('processing')) {
			return;
		}
		elem.classList.add('processing');
		const fileName = elem.dataset['filename'].trim();

		sendAjaxRequest({
			data: { authorId, fileName },
			onSuccess: (response) => {
				if (typeof response === 'object' && response !== null) {
					const { status, likesCount } = response;
					if (status == 'added') {
						elem.querySelector('.likeIcon').classList.add('added');
					}
					else if (status == 'removed') {
						elem.querySelector('.likeIcon').classList.remove('added');
					}
					if (likesCount !== undefined && likesCount !== null) {
						elem.querySelector('.likesCount').innerHTML = likesCount;
					}
				}
			},
			onEnd: () => {
				elem.classList.remove('processing');
			}
		});


	});
};

document.addEventListener('DOMContentLoaded', (e) => {
	// sortBy images in gallery
	const sortByElem = document.querySelector('#sortBy');
	if (sortByElem) {
		sortByElem.addEventListener('change', (ee) => {
			window.location.href = window.location.pathname + '?sortBy=' + sortByElem.value;
		});
	}
	// add or remove like
	const userIdElem = document.querySelector('#userid');
	if (!userIdElem) {
		return;
	}
	const userId = userIdElem.value.trim();
	if (!userId) {
		return;
	}
	document.querySelectorAll('.imagesList').forEach((imageList) => {
		const authorId = imageList.dataset['authorid'].trim();
		if (authorId && userId == authorId) {
			return;
		}
		imageList.querySelectorAll('.likeInfo').forEach((el) => likeIconProcess(el, userId, authorId));
	});
});

