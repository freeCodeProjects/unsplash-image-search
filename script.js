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

		imagesHTML += `<figure>
			<img src="${img.smallImageUrl}" alt="${img.description}" data-id="${img.id}" loading="lazy"/>
			<figcaption>
				<div class="user">
					<img
						src="${img.userProfileImage}"
					/>
					<span>${img.user}</span>
				</div>
				<div class="btn-download">
					<img src="./img/download.svg" alt="download icon" />
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
