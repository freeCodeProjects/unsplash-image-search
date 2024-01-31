let clientId = 'VK-_5v_JjwISU3_wspDxJHk84YuVUJLWO-ERrtUH_0I'
let perPage,
	page,
	images,
	fetchMore,
	searchText,
	previousSearchText,
	colHeight1,
	colHeight2,
	colHeight3

const initalizeGridColumns = () => {
	colHeight1 = 1
	colHeight2 = 2
	colHeight3 = 3
	const viewportWidth = window.innerWidth
	const masnoryElm = document.querySelector('.masonry')
	if (viewportWidth > 960) {
		document.documentElement.style.setProperty('--column', 3)
		masnoryElm.innerHTML = `
		<div class="column column-1"></div>
		<div class="column column-2"></div>
		<div class="column column-3"></div>
		`
	} else if (viewportWidth > 560) {
		document.documentElement.style.setProperty('--column', 2)
		masnoryElm.innerHTML = `
		<div class="column column-1"></div>
		<div class="column column-2"></div>
		`
	} else {
		document.documentElement.style.setProperty('--column', 1)
		masnoryElm.innerHTML = `
		<div class="column column-1"></div>
		`
	}
}

const fetchBackgroundImage = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/random/?client_id=${clientId}&orientation=landscape&query=nature`
	)
	let json
	try {
		json = await response.json()
	} catch (error) {
		console.log('Error in fetchBackgroundImage response.json')
		return null
	}

	let heroELm = document.querySelector('.hero')
	let backgroundImageUrl = ''

	//calulate which image to use as background Image based on window size
	if (window.innerWidth < 400) backgroundImageUrl = json.urls.small
	else if (window.innerWidth < 1080) backgroundImageUrl = json.urls.regular
	else backgroundImageUrl = json.urls.full

	heroELm.style.background = `linear-gradient(to right, #ff6f0088, #ff480080), black url(${backgroundImageUrl}) no-repeat center center`
	heroELm.style.backgroundSize = 'cover'
}

const fetchImages = async () => {
	if (!fetchMore) {
		return null
	}
	fetchMore = false
	const myUrl = new URL('https://api.unsplash.com')
	myUrl.searchParams.append('client_id', clientId)
	myUrl.searchParams.append('per_page', perPage)
	myUrl.searchParams.append('page', page)

	if (searchText) {
		myUrl.searchParams.append('query', searchText)
		myUrl.pathname = '/search/photos'
	} else {
		myUrl.pathname = '/photos'
	}

	const response = await fetch(myUrl.href)

	let res
	try {
		res = await response.json()
	} catch (error) {
		console.log('Error in fetchImages response.json')
		alert('Rate Limit Exceeded')
		fetchMore = true
		return null
	}

	const result = Array.isArray(res) ? res : res.results

	//hide loader when response is empty
	if (result.length === 0) {
		hideLoaderSection()

		//show Empty State if no result found
		if (Object.keys(images).length === 0) {
			showNoResultSection()
		}
	}

	const currImages = {}

	result.forEach((img) => {
		currImages[img.id] = {
			id: img.id,
			height: img.height,
			width: img.width,
			blurHash: blurhash.createPngDataUri(img.blur_hash),
			smallImageUrl: img.urls.small,
			regularImageUrl: img.urls.regular,
			fullImageUrl: img.urls.full,
			downloadLink: img.links.download,
			user: img.user.name,
			userProfileImage: img.user.profile_image.large,
			description: img.alt_description
		}
	})

	//render fetched images
	renderImages(currImages)

	//update page number
	page += 1

	//update images object
	images = { ...images, ...currImages }

	//reset fetchMore variable
	fetchMore = true
}

const renderImages = (currImages) => {
	const column1Elm = document.querySelector('.column-1')
	const column2Elm = document.querySelector('.column-2')
	const column3Elm = document.querySelector('.column-3')
	let col1NewHTML = ''
	let col2NewHTML = ''
	let col3NewHTML = ''

	for (let id in currImages) {
		const img = currImages[id]
		const aspectRatio = img.height / img.width
		// 300 is assumed width of column. It can be anything.
		const approxNewHeight = Math.round(aspectRatio * 300)
		const column = minHeigthColumn()
		if (column === 1) {
			colHeight1 += approxNewHeight
			col1NewHTML += getImageHTML(img)
		} else if (column === 2) {
			colHeight2 += approxNewHeight
			col2NewHTML += getImageHTML(img)
		} else {
			colHeight3 += approxNewHeight
			col3NewHTML += getImageHTML(img)
		}
	}

	//append recently fetched images at the end of masonry element
	column1Elm.insertAdjacentHTML('beforeend', col1NewHTML)
	if (column2Elm) {
		column2Elm.insertAdjacentHTML('beforeend', col2NewHTML)
	}
	if (column3Elm) {
		column3Elm.insertAdjacentHTML('beforeend', col3NewHTML)
	}
}

const minHeigthColumn = () => {
	const viewportWidth = window.innerWidth
	minCol = 1
	minHeight = colHeight1

	if (viewportWidth > 960) {
		if (colHeight2 < minHeight) {
			minCol = 2
			minHeight = colHeight2
		}
		if (colHeight3 < minHeight) {
			minCol = 3
			minHeight = colHeight3
		}
	} else if (viewportWidth > 560) {
		if (colHeight2 < minHeight) {
			minCol = 2
		}
	}
	return minCol
}

const getImageHTML = (img) => {
	return `<div class="figure" onclick="openModal()" data-id="${img.id}">
		<img
			data-placeholder-img="${img.id}"
			alt="${img.description}"
			src="${img.blurHash}"
			style="aspect-ratio: ${img.width}/${img.height}"
		/>
		<img
			data-img="${img.id}"
			alt="${img.description}"
			src="${img.smallImageUrl}"
			srcset="${img.smallImageUrl} 600w, ${img.regularImageUrl}" sizes="100vw"
			onload="imageLoaded('${img.id}')" loading="lazy"
			style="aspect-ratio: ${img.width}/${img.height}; opacity: 0;"
		/>
		<div class="figcaption">
			<div class="user">
				<img src="${img.userProfileImage}" />
				<span>${img.user}</span>
			</div>
			<a
				href="${img.downloadLink}&w=${img.width}&h=${img.height}&force=true"
				class="btn-download"
				data-id="${img.id}"
				data-width="${img.width}"
				data-height="${img.height}"
				onclick="event.stopPropagation()"
			>
				<img src="./img/download.svg" alt="download icon" />
			</a
				href=${img.downloadLink}>
		</div>
	</div>`
}

const imageLoaded = (id) => {
	//using querySelectorAll because images can be repeated
	const mainImages = document.querySelectorAll(`[data-img="${id}"]`)
	mainImages.forEach((image) => {
		image.style.opacity = '1'
		image.style.transition = 'opacity 0.5s ease'
	})
}

const fetchInfiniteImages = () => {
	let options = {
		root: null,
		rootMargin: '0px',
		threshold: 0.1
	}

	let observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			console.log('intersecting', fetchMore)
			fetchImages()
		} else {
			console.log('not Intersecting')
		}
	}, options)

	let target = document.querySelector('.loader')
	observer.observe(target)
}

const search = () => {
	initalizeGridColumns()
	//reset other variable
	images = {}
	page = 1
	showLoaderSection()
	hideNoResultSection()
	fetchImages()
}

const formSubmitEventListener = () => {
	const form = document.querySelector('form')
	form.addEventListener('submit', (e) => {
		console.log('form submitted')
		e.preventDefault()
		searchText = e.target.query.value.trim()
		search()
	})
}

const openModal = (e) => {
	if (!e) var e = window.event

	const target = e.currentTarget
	const modalElm = document.querySelector('.modal')

	modalElm.classList.add('show')
	document.body.classList.add('noscroll')

	const modalBodyElm = document.querySelector('.modal__body')
	const bodyImage = `<img
		class="modal__image"
		src="${images[target.dataset.id]['regularImageUrl']}"
		srcset="${images[target.dataset.id]['smallImageUrl']} 300w,
			${images[target.dataset.id]['regularImageUrl']}"
		sizes="50vw"
		alt="${images[target.dataset.id]['description']}"
		loading="lazy"
	/>`

	//scroll to top everytime modal is visible
	modalBodyElm.scrollTo(0, 0)

	modalBodyElm.innerHTML = bodyImage

	//update the sizes attribute so that high quality image can be loaded in background
	setTimeout(() => {
		document.querySelector('.modal__image').setAttribute('sizes', '100vw')
		document.querySelector('.modal__image').setAttribute(
			'srcset',
			`${images[target.dataset.id]['smallImageUrl']} 300w,
		${images[target.dataset.id]['regularImageUrl']} 600w,
		${images[target.dataset.id]['fullImageUrl']}`
		)
	}, 500)

	imageLoadEventListener()

	//generate the modal download HTML
	generateModalDownloadHTML(target.dataset.id)

	//add click event listener to modal
	modalClickEventListener()
}

const imageLoadEventListener = () => {
	//this listener will help vertically center align image when image height is smaller than modal body
	const imageElm = document.querySelector('.modal__image')
	imageElm.addEventListener('load', function () {
		const modalBodyElm = document.querySelector('.modal__body')
		if (imageElm.clientHeight < modalBodyElm.clientHeight) {
			imageElm.style.top = 'unset'
		} else {
			imageElm.style.top = '0'
		}
	})
}

const modalClickEventListener = () => {
	const modalElm = document.querySelector('.modal')
	const dropdown = document.querySelector('.dropdown')
	modalElm.addEventListener('click', (e) => {
		//if close button or modal body background is clicked close the modal and dropdown
		if (
			!e.target.closest('.modal-content') ||
			e.target.closest('.modal__close__btn')
		) {
			modalElm.classList.remove('show')
			dropdown.classList.remove('show')
			document.body.classList.remove('noscroll')
		}
		//if dropdown arrow is clicked toggle dropdown
		else if (e.target.closest('.download__dropdown__arrow')) {
			dropdown.classList.toggle('show')
		}
		//if dropdown background is clicked close dropdown
		else if (!e.target.closest('.dropdown')) {
			dropdown.classList.remove('show')
		}
	})
}

const generateModalDownloadHTML = (id) => {
	const img = images[id]

	const smallWidth = 640
	const smallHeight = Math.floor((img.height / img.width) * smallWidth)
	const mediumWidth = 1920
	const mediumHeight = Math.floor((img.height / img.width) * mediumWidth)
	const largeWidth = 2400
	const largeHeight = Math.floor((img.height / img.width) * largeWidth)

	const downloadHTML = `<a
			href="${img.downloadLink}&w=${img.width}&h=${img.height}&force=true"
			class="modal__download__btn"
			data-id="${img.id}"
			>Download</a
		>
		<span class="download__dropdown__arrow">
			<img src="./img/down-arrow.svg" alt="down-arrow icon" />
		</span>
		<div class="dropdown">
			<span class="dropdown__arrow"></span>
			<div class="dropdown__content">
				<a
					href="${img.downloadLink}&w=${smallWidth}&h=${smallHeight}&force=true"
					>Small (${smallWidth}x${smallHeight})</a
				>
				<a
					href="${img.downloadLink}&w=${mediumWidth}&h=${mediumHeight}&force=true"
					>Medium (${mediumWidth}x${mediumHeight})</a
				>
				<a
					href="${img.downloadLink}&w=${largeWidth}&h=${largeHeight}&force=true"
					>Large (${largeWidth}x${largeHeight})</a
				>
				<hr />
				<a
					href="${img.downloadLink}&w=${img.width}&h=${img.height}&force=true"
					>Original Size (${img.width}x${img.height})</a
				>
			</div>
		</div>`

	const modalDownloadElm = document.querySelector('.modal__download')
	modalDownloadElm.innerHTML = downloadHTML
}

const widowResizeEventListener = () => {
	let windowResizeTimeout = undefined
	window.addEventListener('resize', (e) => {
		clearTimeout(windowResizeTimeout)
		windowResizeTimeout = setTimeout(() => {
			initalizeGridColumns()
			renderImages(images)
		}, 500)
	})
}

const floatedActionButton = () => {
	const fabElm = document.querySelector('.fab-button')
	const fabButtonElm = document.querySelector('.fab-button button')

	fabButtonElm.addEventListener('click', () => {
		window.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth'
		})
	})

	let options = {
		root: null,
		rootMargin: '0px',
		threshold: 0.1
	}

	let observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			fabElm.style.display = 'none'
		} else {
			fabElm.style.display = 'block'
		}
	}, options)

	let target = document.querySelector('.hero')
	observer.observe(target)
}

const showLoaderSection = () => {
	document.querySelector('.loader').classList.remove('hide')
}

const hideLoaderSection = () => {
	document.querySelector('.loader').classList.add('hide')
}

const showNoResultSection = () => {
	document.querySelector('.empty-state').classList.remove('hide')
}

const hideNoResultSection = () => {
	document.querySelector('.empty-state').classList.add('hide')
}

;(async function () {
	perPage = 20
	page = 1
	images = {}
	fetchMore = true
	searchText = ''
	formSubmitEventListener()
	initalizeGridColumns()
	fetchInfiniteImages()
	await fetchBackgroundImage()
	widowResizeEventListener()
	floatedActionButton()
})()
