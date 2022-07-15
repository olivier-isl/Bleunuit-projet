let container,
	scene,
	camera,
	renderer,
	plane,
	form = [],
	composer,
	customPass,
	counter,
	textureActive = 1,
	group,
	shader,
	background = [],
	frontground = [],
	vertices,
	lightening,
	cubeCamera,
	textureBackground = [
		'src/img/0.png',
		'src/img/1.jpg',
		'src/img/2.png',
		'src/img/3.jpg',
	],
	simplex = new SimplexNoise(),
	iteration = 0,
	params = {
		simplexVariation: 0.06,
		simplexAmp: 2,
		speed: 200
	};

let c = []


let screenWidth = window.innerWidth,
	screenHeight = window.innerHeight

let videos = ['../src/video/1549106754.mp4'],
	player

let mouse = {
	x: 0,
	y: 0
}

// Lumière
function light() {
	this.light = []
	this.light[0] = new THREE.PointLight(0xffffff, 1)
	this.light[0].position.set(0, 0, -60)
	
	this.light[1] = new THREE.AmbientLight(0x111111, 0)
	
	this.light[2] = new THREE.DirectionalLight(0xcccccc, 2)
	this.light[2].position.set(30, 30, 20)

	this.light[3] = new THREE.DirectionalLight(0xcccccc, 2)
	this.light[3].position.set(-30, 30, 20)

	this.light.forEach(el => {
		scene.add(el)
	})
	return this.light
	
}

function init() {

	// Scene
	scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2(0xcccccc, 0)

	// Camera
	this.viewAngle = 25
	this.nearDistance = 1
	this.farDistance = 100000

	camera = new THREE.PerspectiveCamera(this.viewAngle, screenWidth / screenHeight, this.nearDistance, this.farDistance)
	scene.add(camera)
	camera.position.set(0, 0, -60) // 0,0,60
	camera.lookAt(scene.position)

	renderer = new THREE.WebGLRenderer({
		canvas : document.querySelector('#c3d'),
		antialias: true,
		alpha: true,
		outputEncoding: false
	})
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(screenWidth, screenHeight)

	light()

	background = createBackground(50, [99, 49])

	form.push(createForm(4.5, 32, 32, "Sphere", {
		transparent: true,
		color: 0x555555,
		opacity: 1,
		emissive: 0x111111,
		emissiveIntensity: 1,
		reflectivity: 1,
		shininess: 1,
		// wireframe: false,
		specular: 0x0000cc,
		bumpMap : new THREE.TextureLoader().load('src/img/texture2.jpg'),
		map : new THREE.TextureLoader().load('src/img/texture.jpg'),
		bumpScale : 0.008,
		//smoothShading: THREE.SmoothShading, // useless
		//flatShading: THREE.FlatShading,
	}, {
		x: 0,
		y: 0,
		z: 0
	}))

	//Clone les vertices pour avoir des donées par défaut lors du morphing
	vertices = form[0].geometry.clone().vertices

	/* grouper les forme pour pouvoir les bouger + facilement */
	group = new THREE.Group();
	group.add(form[0])
	scene.add(group)

	//custom shader pass

	composer = new THREE.EffectComposer(renderer);
	let renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);

	let vertShader = document.getElementById('vertexShader').textContent;
	let fragShader = document.getElementById('fragmentShader').textContent;
	counter = 0.0;
	let myEffect = {
		uniforms: {
			"tDiffuse": {
				value: null
			},
			"amount": {
				value: counter
			}
		},
		vertexShader: vertShader,
		fragmentShader: fragShader
	}

	customPass = new THREE.ShaderPass(myEffect);
	customPass.renderToScreen = true;
	composer.addPass(customPass);

	initNav()
}

/* Event Mouse */

	window.addEventListener('mousemove', function (e) {
		onMouseMove(e, group)
	}, false)

	window.addEventListener('click', function() {
		//gsap.to(circle.geometry.parameters, {innerRadius:1, duration: 0.2})
		//circle.geometry.parameters.innerRadius = 1
		//c[1].r = c[0].r
		gsap.fromTo(c[1], {
			r : c[0].r
		}, {
			r : 5,
			duration: 0.5
		})
	})

	document.querySelectorAll("a").forEach(el => {
		el.addEventListener("mouseover", function (e) {
			navOver(e, circle)
		}, false)
		el.addEventListener("mouseout", function (e) {
			navOut(e, circle)
		}, false)
	})

function createBackground(z, size) {
	this.geometry = new THREE.PlaneGeometry(...size)

	this.backgroundTexture = new THREE.TextureLoader().load(textureBackground[1]);
	this.backgroundTexture.minFilter = THREE.LinearFilter
	//this.backgroundTexture.needsUpdate = true;
	this.material = new THREE.MeshBasicMaterial({
		opacity: 1,
		transparent: true,
		map: this.backgroundTexture,
		side: THREE.BackSide
	});

	this.materialShader = new THREE.MeshBasicMaterial({
		opacity: 0.2,
		transparent: true,
		color: 0x000000,
		side: THREE.BackSide
	});

	this.form = new THREE.Mesh(this.geometry, this.material)
	this.form.receiveShadow = true
	this.form.position.z = z

	this.form2 = new THREE.Mesh(this.geometry, this.materialShader )
	this.form2.position.z = this.form.position.z
	this.form.scale.x = -1
	scene.add(this.form)
	scene.add(this.form2)
	
	//this.backgroundTexture.needsUpdate = true
	return this.form
}


function createForm(radius, length, width, type, options, position, boolShader = 0) {
	this.options = options
	this.options.envMap = new THREE.CubeTextureLoader().load([
		'src/img/'+textureActive+'/'+textureActive+'.right.jpg',
		'src/img/'+textureActive+'/'+textureActive+'.left.jpg',
		'src/img/'+textureActive+'/'+textureActive+'.up.jpg',
		'src/img/'+textureActive+'/'+textureActive+'.down.jpg',
		'src/img/'+textureActive+'/'+textureActive+'.front.jpg',
		'src/img/'+textureActive+'/'+textureActive+'.back.jpg'
	]);
	// var customMaterial = new THREE.ShaderMaterial( 
	// 	{
	// 		uniforms: {
	// 			"c": { type: "f", value: 0.6 },
	// 			"p": { type: "f", value: 6 },
	// 			//size : { type: 'f', value : 0.0 },
	// 			// near : { type: 'f', value : camera.near },
	// 			// far  : { type: 'f', value : camera.far },
	// 			viewVector: { type: "v3", value: camera.position},
	// 			glowColor: {
	// 				type: "c",
	// 				value: new THREE.Color(0xffffff)
	// 			}
	// 		},
	// 		vertexShader:   document.getElementById( 'vertexShader2'   ).textContent,
	// 		fragmentShader: document.getElementById( 'fragmentShader2' ).textContent,
	// 		side: THREE.BackSide,
	// 		blending: THREE.AdditiveBlending,
	// 		transparent: true
	// 	});

	if (type == "Circle") {
		this.geometry = new THREE.CircleGeometry(radius, length, width)
	}
	if (type == "Sphere") {
		this.geometry = new THREE.SphereGeometry(radius, length, width)
	}

	this.material = new THREE.MeshPhongMaterial(this.options);
	this.mesh = new THREE.Mesh(this.geometry, this.material)
	this.mesh.position.x = position.x
	this.mesh.position.y = position.y
	this.mesh.position.z = position.z
	
	scene.add(this.mesh)
	this.mesh.visible = true
	
	return this.mesh
}

function navOver(e, form) {
	e.preventDefault()
	gsap.to(c[0], {
		r : 30,
		duration: 0.5
	})
}

function navOut(e, form) {
	e.preventDefault()
	gsap.to(c[0], {
		r : 20,
		duration: 0.5
	})
}

function onMouseMove(event, form) {
	event.preventDefault()
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
	
	// var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5)
	// vector.unproject(camera)
	// var dir = vector.sub(camera.position).normalize()
	// var distance = -camera.position.z / dir.z
	// var pos = camera.position.clone().add(dir.multiplyScalar(distance))
	// /* Injecte nouvelle coordonnée dans la forme */
	c[1].x = (event.clientX)
	c[1].y = (event.clientY)
	gsap.to(c[0], {
		duration: 0.2,
		x: c[1].x,
		y: c[1].y
	})

	if(event.clientX > window.innerWidth/2 - 150 && event.clientX < window.innerWidth/2 + 150 && 
		event.clientY > window.innerHeight/2 - 150 && event.clientY < window.innerHeight/2 + 150 ) {
		gsap.set(params, {
			simplexVariation: 0.08,
			simplexAmp: 1.5,
			speed: 50,
			duration: 0.5
		})
	} else {
		gsap.set(params, {
			simplexVariation: 0.05,
			simplexAmp: 1,
			speed: 100,
			duration: 0.5
		})
	}

	gsap.fromTo(group.children[0].rotation, {x : group.children[0].rotation.x},{x: mouse.y * 2, duration: 0.5})
	gsap.fromTo(group.children[0].rotation, {y : group.children[0].rotation.y},{y: mouse.x * 2, duration: 0.5})
}

function simplexNoise(item) {
	return simplex.noise4d(
		item.x * params.simplexVariation,
		item.y * params.simplexVariation,
		item.z * params.simplexVariation,
		iteration / params.speed
		) * params.simplexAmp;
}

function deform(f, geo) {
	f.geometry.vertices.forEach((v, i) => {
		// v.y = vertices[i].y + simplexNoise(v)
		// v.x = vertices[i].x + simplexNoise(v)
		// v.z = vertices[i].z + simplexNoise(v)
		gsap.to(v, {
			duration: 0.2,
			x: vertices[i].x + simplexNoise(v),
			y: vertices[i].y + simplexNoise(v),
			z: vertices[i].z + simplexNoise(v)
		});
		
	})

	f.geometry.dynamic = true;
	f.verticesNeedUpdate = true;
	f.geometry.verticesNeedUpdate = true;
}

	// Animation
	function animate() {
		iteration++
		requestAnimationFrame(animate)
		deform(form[0], geometry[0])
		group.rotation.y += 0.01
		render()
	}

	// Rendering
	function render() {
		form[0].visible = true
		renderer.autoClear = false
		renderer.clear()
		// effet de grésillement
		counter += 0.01;
		customPass.uniforms["amount"].value = counter;
		composer.render();
		renderer.render(scene, camera)
	}

	/* Navigation System */
	const translate = {
		translate: 0,
		chaseTranslate: 0,
		TranslateFactor: 10,
		min: 0.0001,
		max: 10,
		accel: 0.1,
	}
	const diff = 10
	const backgroundNav = document.querySelector('.navWorks .background').getBoundingClientRect()
	let items = []
	items[0] = document.querySelectorAll('.worksItem')
	items[1] = [...items[0]].map(el => {
		return el.getBoundingClientRect()
	})


	var throwTween = gsap.to({}, 0, {});

	let test = [],
		test2 = []

	function initNav() {
		items[0].forEach((item, j) => {
			items[1][j] = item.getBoundingClientRect()
			gsap.to(items[0][j], {
				duration: 0.5,
				x: 0,
				y: translate.chaseTranslate,
				z: 0
			})

			/* Vers le centre ou sortir du centre vers le bas */
			if (items[1][j].top <= backgroundNav.top + diff) {
				test[j] = 0
			}
			if (items[1][j].top > backgroundNav.top + diff) {
				test[j] = ((items[1][j].top - backgroundNav.top) / backgroundNav.top) * 100 // 100
			}

			/* Vers le centre ou sortir du centre vers le haut */
			if (items[1][j].bottom >= backgroundNav.bottom - diff) {
				test2[j] = 0
			}
			if (items[1][j].bottom < backgroundNav.bottom - diff) {
				const calcul = (test[j] / 100 - ((items[1][j].bottom - backgroundNav.bottom) / backgroundNav.bottom)) * 100
				test2[j] = calcul
			}

			gsap.to(item.querySelector('.title'), {
				'--clipping': 'inset(' + test2[j] + '% 0% ' + test[j] + '% 0%)',
				duration: 0.5
			})

			if (items[1][j].top >= backgroundNav.top - diff && items[1][j].bottom <= backgroundNav.bottom + diff) {
				item.classList.add('active')
			} else {
				item.classList.remove('active')
			}

		})

		window.addEventListener("mousewheel", function (e) {
			mouseWheel(e)
		}, false);
		window.addEventListener("DOMMouseScroll", function (e) {
			mouseWheel(e)
		}, false);
	}


	items[0].forEach((el, i) => {
		el.addEventListener('click', () => {
			translate.chaseTranslate = -backgroundNav.height * (i - 1)
			items[0].forEach((item, j) => {
				gsap.to(items[0][j], 0.5, {
					x: 0,
					y: translate.chaseTranslate,
					z: 0,
					onUpdate: () => {
						items[0].forEach((item, j) => {
							items[1][j] = item.getBoundingClientRect()

							/* Vers le centre ou sortir du centre vers le bas */
							if (items[1][j].top <= backgroundNav.top + diff) {
								test[j] = 0
							}
							if (items[1][j].top > backgroundNav.top + diff) {
								test[j] = ((items[1][j].top - (backgroundNav.top + diff)) / (backgroundNav.top + diff)) * 100 // 100
							}

							/* Vers le centre ou sortir du centre vers le haut */
							if (items[1][j].top >= backgroundNav.top - diff) {
								test2[j] = 0
							}
							if (items[1][j].top < backgroundNav.top + diff) {
								test2[j] = -((items[1][j].top - (backgroundNav.top + diff)) / (backgroundNav.top + diff)) * 100
							}

							gsap.to(item.querySelector('.title'), {
								'--clipping': 'inset(' + test2[j] + '% 0% ' + test[j] + '% 0%)',
								duration: 0.5,
							})

							if (test[j] <= 5 && test2[j] <= 5) {
								item.classList.add('active')
							} else {
								item.classList.remove('active')
							}
						})

						changeMap(i)

					}
				})
			})
		});


		if (test[i] <= 5 && test2[i] <= 5) {
			el.classList.add('active')
		} else {
			if (el.classList.contains('active')) {
				el.classList.remove('active')
			}
		}
	})

function changeMap(i) {
	if (textureActive != i) {
		textureActive = i
		/* change TextureBackground */
		gsap.to(background.material, {
			duration: 0.2,
			opacity: 0,
			onComplete() {
				gsap.to(background.material, {
					duration: 0,
					map: new THREE.TextureLoader().load(textureBackground[i]),
					onComplete() {
						gsap.to(background.material, {
							duration: 0.2,
							opacity: 1
						}).delay(1)
					}
				})
			}
		})
		//form[0].material.reflectivity = 0
		let tempColor = new THREE.Color().setHex(0x000000)
		gsap.to(form[0].material.color, {
			duration: 0.5,
			r: tempColor.r,
			g: tempColor.g,
			b: tempColor.b,
			onComplete() {
				form[0].material.envMap = new THREE.CubeTextureLoader().load([
					'src/img/'+textureActive+'/'+textureActive+'.right.jpg',
					'src/img/'+textureActive+'/'+textureActive+'.left.jpg',
					'src/img/'+textureActive+'/'+textureActive+'.up.jpg',
					'src/img/'+textureActive+'/'+textureActive+'.down.jpg',
					'src/img/'+textureActive+'/'+textureActive+'.front.jpg',
					'src/img/'+textureActive+'/'+textureActive+'.back.jpg'
				]);
				tempColor = new THREE.Color().setHex(0x555555)
				gsap.to(form[0].material.color, {
					duration: 0.5,
					r: tempColor.r,
					g: tempColor.g,
					b: tempColor.b,
					delay: 0.6
				})
			}
		})
		
		//form[0].material.reflectivity = 1.5
		// setTimeout(() => {
		// 	form[0].material.color.setHex(0xCCCCCC)
		// },1000)
		background.material.needsUpdate = true;
		form[0].material.needsUpdate = true;
	}
}



	/* Touch systeme */
	// const start = {}
	// window.addEventListener("touchstart", e => {
	// 	start.y = e.touches[0].pageY;
	// }, false);

	// window.addEventListener("touchmove", function(e) {
	// 	mouseWheel(e)
	// }, false);



//var throwTween = gsap.to({}, 0, {});

function mouseWheel(e) {
	throwTween.kill()

	const wheel = e.detail || e.deltaY || 0

	//test Touch move pour téléphone
	// if(start.y < e.touches[0].pageY) {
	// 	translate.chaseTranslate -= e.touches[0].pageY / translate.TranslateFactor
	// } else {
	// 	translate.chaseTranslate += e.touches[0].pageY / translate.TranslateFactor
	// }

	if (wheel > 0) {
		translate.chaseTranslate -= translate.TranslateFactor
	} else {
		translate.chaseTranslate += translate.TranslateFactor
	}

	items[0].forEach((el, i) => {
		let calcul
		gsap.fromTo(el,
			{
				x: 0,
				y: translate.chaseTranslate,
				z: 0,
				// skewY: wheel/50
			}, {
			duration: 0.2,
			x: 0,
			y: translate.chaseTranslate,
			z: 0,
			// skewY: 0
		})

		items[1][i] = el.getBoundingClientRect()

		/* Vers le centre ou sortir du centre vers le bas */
		if (items[1][i].top <= backgroundNav.top + diff) {
			test[i] = 0
		}
		if (items[1][i].top > backgroundNav.top + diff) {
			test[i] = ((items[1][i].top - (backgroundNav.top + diff)) / (backgroundNav.top + diff)) * 100 // 100
		}

		/* Vers le centre ou sortir du centre vers le haut */
		if (items[1][i].top >= backgroundNav.top - diff) {
			calcul = 0
		}
		if (items[1][i].top < backgroundNav.top + diff) {
			calcul = -((items[1][i].top - (backgroundNav.top + diff)) / (backgroundNav.top + diff)) * 100
			test2[i] = calcul
		}

		gsap.to(el.querySelector('.title'), {
			'--clipping': 'inset(' + test2[i] + '% 0% ' + test[i] + '% 0%)',
			duration: 0.5,
		})
		//items[0][i].querySelector('.title').style.setProperty('--clipping','inset('+test2[i]+'% 0% '+test[i] +'% 0%)','');
		if (test[i] <= 5 && test2[i] <= 5) {
			el.classList.add('active')
			changeMap(i)
		} else {
			el.classList.remove('active')
		}
	})
}

function clamp(value, min, max) {
	return value < min ? min : (value > max ? max : value);
}

init()
animate()

gsap.fromTo(
	document.querySelector('.loading'),
	{
		'--progress': 0
	}, {
		'--progress': 1,
		duration: 2,
		delay: 1,
		onComplete() {
			gsap.to(document.querySelector('.loading'), {
				opacity: 0,
				duration: 1,
				onComplete() {
					document.querySelector('.loading').classList.add('finished')
					gsap.to([document.querySelector('#c3d'), document.querySelector('#c-cursor')], {
						opacity: 1,
						duration: 1,
						onComplete() {
							document.querySelectorAll('.worksItem').forEach((el, i) => {
								el.style.setProperty('animation-play-state','running','')
								setTimeout(() => {
									el.classList.remove('running')
								}, 500 * i)
							})
						}
					})
				}
			})
		}
	}
)

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = screenWidth/ screenHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( screenWidth, screenHeight);
}

const canvas = document.querySelector("#c-cursor")
canvas.width = screenWidth
canvas.height = screenHeight
const ctx = canvas.getContext('2d')

class circle {
	constructor(x,y,r,ad,color) {
		this.x = x || 100
		this.y = y || 75
		this.r = r || 50
		this.ad = ad || 0
		this.af = 2 * Math.PI
		this.color = color ||'rgb(255,255,255)'
	}

	draw(type) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, this.ad, this.af);
		switch(type) {
			case 'stroke':
				ctx.strokeStyle = this.color
				ctx.stroke();
			break;
			case 'fill':
				ctx.fillStyle = this.color
				ctx.fill();
			break;
		}
		
	}
}

function init2d() {
	c[0] = new circle(screenWidth/2, screenHeight/2, 20, 0, 'rgb(255,255,255)')
	c[1] = new circle(screenWidth/2, screenHeight/2, 5, 0, 'rgb(255,255,255)')
}

function draw() {
	c[0].draw('stroke')
	c[1].draw('fill')
}

function animate2d() {
	ctx.clearRect(0,0, screenWidth, screenHeight)
	draw()
	requestAnimationFrame(animate2d)
}

init2d()
animate2d()

document.querySelectorAll('.running').forEach((el, i) => {
	el.style.setProperty('animation-delay', (0.1*i)+'s','')
})
