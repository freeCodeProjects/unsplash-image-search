//@ts-check
const clientId = 'VK-_5v_JjwISU3_wspDxJHk84YuVUJLWO-ERrtUH_0I'
let perPage, page, images

const fetchBackgroundImage = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/random/?client_id=${clientId}&orientation=landscape&query=nature`
	)
	const json = await response.json()
	console.log(json)

	let heroELm = document.querySelector('.hero')
	heroELm.style.background = `black url(${json.urls.full}) no-repeat center center`
	heroELm.style.backgroundSize = 'cover'
}

const fetchInitialImages = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/?client_id=${clientId}&per_page=${perPage}&page=${page}`
	)
	const imgs = await response.json()
	imgs.forEach((img) => {
		images.push({
			id: img.id,
			height: img.height,
			width: img.width,
			regularImageUrl: img.urls.regular,
			fullImageUrl: img.urls.full,
			user: img.user.name,
			userProfileImage: img.user.profile_image.large,
			description: img.alt_description
		})
	})
	renderImages()
	console.log(images)
}

const renderImages = () => {
	const misonaryElm = document.querySelector('.misonary')

	let imagesHTML = ''
	images.forEach((img, idx) => {
		imagesHTML += `<img src="${img.regularImageUrl}" alt="image from unsplash" loading="lazy"/>`
	})

	misonaryElm.innerHTML = imagesHTML
}

;(async function () {
	console.log('hello')
	perPage = 12
	page = 1
	images = []
	await fetchBackgroundImage()
	await fetchInitialImages()
	console.log('world!')
})()
