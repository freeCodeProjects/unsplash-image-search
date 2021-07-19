//@ts-check
const clientId = 'VK-_5v_JjwISU3_wspDxJHk84YuVUJLWO-ERrtUH_0I'
let perPage, page, images, fetchMore

const fetchBackgroundImage = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/random/?client_id=${clientId}&orientation=landscape&query=nature`
	)
	const json = await response.json()

	let heroELm = document.querySelector('.hero')
	heroELm.style.background = `black url(${json.urls.full}) no-repeat center center`
	heroELm.style.backgroundSize = 'cover'
}

const fetchImages = async () => {
	console.log('feching images')

	const response = await fetch(
		`https://api.unsplash.com/photos/?client_id=${clientId}&per_page=${perPage}&page=${page}`
	)
	const imgs = await response.json()
	const tempImages = {}

	imgs.forEach((img) => {
		tempImages[img.id] = {
			id: img.id,
			height: img.height,
			width: img.width,
			regularImageUrl: img.urls.small,
			fullImageUrl: img.urls.full,
			user: img.user.name,
			userProfileImage: img.user.profile_image.large,
			description: img.alt_description
		}
	})

	//render fetched images
	renderImages(tempImages)

	//update page number
	page += 1

	images = { ...images, ...tempImages }
	console.log(images)
}

const renderImages = (imgs) => {
	const misonaryElm = document.querySelector('.misonary')

	let imagesHTML = ''
	for (let id in imgs) {
		const img = imgs[id]

		imagesHTML += `<figure>
			<img src="${img.regularImageUrl}" alt="${img.description}" data-id="${img.id}" loading="lazy"/>
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
			fetchMore && fetchImages()
			fetchMore = false
		} else {
			console.log('not Intersecting')
		}
	}, options)

	let target = document.querySelector('.loader')
	observer.observe(target)
}

;(async function () {
	perPage = 12
	page = 1
	images = {}
	fetchMore = true
	fetchInfiniteImages()
	await fetchBackgroundImage()
})()
