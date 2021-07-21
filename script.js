//@ts-check
const clientId = 'VK-_5v_JjwISU3_wspDxJHk84YuVUJLWO-ERrtUH_0I'
let perPage, page, images, fetchMore, searchText, previousSearchText

const fetchBackgroundImage = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/random/?client_id=${clientId}&orientation=landscape&query=nature`
	)
	const json = await response.json()

	let heroELm = document.querySelector('.hero')
	heroELm.style.background = `black url(${json.urls.full}) no-repeat center center`
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
				<div class="btn-download">
					<img src="./img/download.svg" alt="download icon" loading="lazy"/>
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

const closeModal = () => {
	const modalElm = document.querySelector('.modal')
	modalElm.addEventListener('click', (e) => {
		/* console.log(e) */
		if (!e.target.closest('.modal-content')) {
			modalElm.classList.add('hide')
			document.body.classList.remove('noscroll')
		}
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
		src="${images[target.dataset.id]['smallImageUrl']}"
		srcset="${images[target.dataset.id]['smallImageUrl']} 600w,
			${images[target.dataset.id]['regularImageUrl']} 1280w,
			${images[target.dataset.id]['fullImageUrl']}"
		sizes="100vw"
		alt="${images[target.dataset.id]['description']}"
		loading="lazy"
	/>`
	modalBodyElm.innerHTML = bodyImage
	//adding imageLoadEventListener
	imageLoadEventListener()
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
	closeModal()
	await fetchBackgroundImage()
})()
