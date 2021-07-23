const clientId = 'VK-_5v_JjwISU3_wspDxJHk84YuVUJLWO-ERrtUH_0I'
let perPage, page, images, fetchMore, searchText, previousSearchText

const fetchBackgroundImage = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/random/?client_id=${clientId}&orientation=landscape&query=nature`
	)
	const json = await response.json()

	let heroELm = document.querySelector('.hero')
	let backgroundImageUrl = ''

	//calulate which image to use as background Image based on window size
	if (window.innerWidth < 400) backgroundImageUrl = json.urls.small
	else if (window.innerWidth < 1080) backgroundImageUrl = json.urls.regular
	else backgroundImageUrl = json.urls.full

	heroELm.style.background = `black url(${backgroundImageUrl}) no-repeat center center`
	heroELm.style.backgroundSize = 'cover'
}

const fetchQueryImages = async () => {
	const response = await fetch(
		`https://api.unsplash.com/search/photos/?client_id=${clientId}&query=${searchText}&per_page=${perPage}&page=${page}`
	)
	const res = await response.json()

	//render fetched images
	renderImages(res.results)
}

const fetchInitialImages = async () => {
	console.log('feching images')

	const response = await fetch(
		`https://api.unsplash.com/photos/?client_id=${clientId}&per_page=${perPage}&page=${page}`
	)
	const res = await response.json()

	//render fetched images
	renderImages(res)
}

const renderImages = (imgs) => {
	//hide loader when response is empty
	if (imgs.length === 0) {
		document.querySelector('.loader').classList.add('hide')
	}

	const currImages = {}

	imgs.forEach((img) => {
		currImages[img.id] = {
			id: img.id,
			height: img.height,
			width: img.width,
			smallImageUrl: img.urls.small,
			regularImageUrl: img.urls.regular,
			fullImageUrl: img.urls.full,
			downloadLink: img.links.download_location,
			user: img.user.name,
			userProfileImage: img.user.profile_image.large,
			description: img.alt_description
		}
	})

	const misonaryElm = document.querySelector('.misonary')
	let imagesHTML = ''
	for (let id in currImages) {
		const img = currImages[id]

		imagesHTML += `<figure onclick="openModal()" data-id="${img.id}">
			<img
				alt="${img.description} 
				src="${img.smallImageUrl}"
				srcset="${img.smallImageUrl} 600w, ${img.regularImageUrl}"
				sizes="100vw"
			loading="lazy"/>
			<figcaption>
				<div class="user">
					<img
						src="${img.userProfileImage}"
					/>
					<span>${img.user}</span>
				</div>
				<div class="btn-download" onclick="downloadImage()" data-id="${img.id}" data-width="${img.width}" data-height="${img.height}">
					<img src="./img/download.svg" alt="download icon"/>
				</div>
			</figcaption>
		</figure>`
	}

	//append recently fetched images at the end of misonary element
	misonaryElm.insertAdjacentHTML('beforeend', imagesHTML)

	//update page number
	page += 1

	//update images object
	images = { ...images, ...currImages }

	//reset fetchMore variable
	fetchMore = true
}

const fetchInfiniteImages = () => {
	let options = {
		root: null,
		rootMargin: '0px',
		threshold: 0.1
	}

	let observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			console.log('intersecting')
			fetchMore && (searchText ? fetchQueryImages() : fetchInitialImages())
			fetchMore = false
		} else {
			console.log('not Intersecting')
		}
	}, options)

	let target = document.querySelector('.loader')
	observer.observe(target)
}

const search = () => {
	if (previousSearchText === searchText) return
	else previousSearchText = searchText

	//after resetting innerHTML of misonary Element loader will come in view and it will auto trigger fetching of images.
	const misonaryElm = document.querySelector('.misonary')
	misonaryElm.innerHTML = ''

	//reset other variable
	images = {}
	page = 1
	document.querySelector('.loader').classList.remove('hide')
}

const searchInputEventListener = () => {
	const inputElm = document.querySelector('.searchInput')
	inputElm.addEventListener('keydown', (e) => {
		const newValue = e.target.value.trim()
		searchText = e.target.value
	})
}

const formSubmitEventListener = () => {
	const form = document.querySelector('form')
	form.addEventListener('submit', (e) => {
		e.preventDefault()
		search()
	})
}

const openModal = (e) => {
	if (!e) var e = window.event

	const target = e.currentTarget
	const modalElm = document.querySelector('.modal')

	modalElm.classList.remove('hide')
	document.body.classList.add('noscroll')

	const modalBodyElm = document.querySelector('.modal__body')
	const bodyImage = `<img
		class="modal__image"
		src="${images[target.dataset.id]['regularImageUrl']}"
		srcset="${images[target.dataset.id]['smallImageUrl']} 600w,
			${images[target.dataset.id]['regularImageUrl']} 1400w,
			${images[target.dataset.id]['fullImageUrl']}"
		sizes="100vw"
		alt="${images[target.dataset.id]['description']}"
		loading="lazy"
	/>`
	modalBodyElm.innerHTML = bodyImage

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
			modalElm.classList.add('hide')
			dropdown.classList.add('hide')
			document.body.classList.remove('noscroll')
		}
		//if dropdown arrow is clicked toggle dropdown
		else if (e.target.closest('.download__dropdown__arrow')) {
			dropdown.classList.toggle('hide')
		}
		//if dropdown background is clicked close dropdown
		else if (!e.target.closest('.dropdown')) {
			dropdown.classList.add('hide')
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
	const downloadHTML = `<span class="modal__download__btn" data-id="${img.id}" data-width="${img.width}" data-height="${img.height}" onclick="downloadImage()">Download</span>
	<span class="download__dropdown__arrow">
		<img src="./img/down-arrow.svg" alt="down-arrow icon" />
	</span>
	<div class="dropdown hide">
		<span class="dropdown__arrow"></span>
		<div class="dropdown__content">
			<span 
				data-id="${img.id}" 
				data-width="${smallWidth}" 
				data-height="${smallHeight}" 
				data-toggle-dropdown="true" 
				onclick="downloadImage()"
			>Small (${smallWidth}x${smallHeight})</span>
			<span 
				data-id="${img.id}" 
				data-width="${mediumWidth}" 
				data-height="${mediumHeight}"
				data-toggle-dropdown="true"
				onclick="downloadImage()"
			>Medium (${mediumWidth}x${mediumHeight})</span>
			<span 
				data-id="${img.id}" 
				data-width="${largeWidth}" 
				data-height="${largeHeight}"
				data-toggle-dropdown="true"
				onclick="downloadImage()"
			>Large (${largeWidth}x${largeHeight})</span>
			<hr />
			<span 
				data-id="${img.id}" 
				data-width="${img.width}" 
				data-height="${img.height}"
				data-toggle-dropdown="true"
				onclick="downloadImage()"
			>Original Size (${img.width}x${img.height})</span>
		</div>
	</div>`

	const modalDownloadElm = document.querySelector('.modal__download')
	modalDownloadElm.innerHTML = downloadHTML
}

const downloadImage = async (e) => {
	if (!e) var e = window.event
	e.stopPropagation()
	const imageId = e.currentTarget.dataset.id
	const width = e.currentTarget.dataset.width
	const height = e.currentTarget.dataset.height
	const toggleDropdown = e.currentTarget.dataset.toggleDropdown

	if (toggleDropdown) {
		const dropdown = document.querySelector('.dropdown')
		dropdown.classList.add('hide')
	}

	//fetch the image url
	const response = await fetch(
		`${images[imageId]['downloadLink']}&client_id=${clientId}`
	)
	const res = await response.json()

	//compute the final url
	//check importance of dl parameter https://docs.imgix.com/apis/rendering/format/dl
	const imageSrc = `${res.url}&w=${width}&h=${height}&dl=unsplash-image-${imageId}.jpg`

	//download the url
	const link = document.createElement('a')
	link.href = imageSrc
	link.click()

	//remove the link element
	link.remove()
}

;(async function () {
	perPage = 12
	page = 1
	images = {}
	fetchMore = true
	searchText = ''
	previousSearchText = ''
	searchInputEventListener()
	formSubmitEventListener()
	fetchInfiniteImages()
	await fetchBackgroundImage()
})()
