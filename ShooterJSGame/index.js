const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')



canvas.width = innerWidth
canvas.height = innerHeight

const ScoreEl = document.querySelector('#ScoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const startModel = document.querySelector('#startModel')
const bigScoreEl = document.querySelector('#bigScoreEl')

class Player {
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
	}
	
	draw(){
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, 0,
		Math.PI*2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
	
}

class Projectile{
	constructor(x, y, radius, color, velocity){
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}
	
draw(){
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, 0,
		Math.PI*2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
	

update(){
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}

class Enemy{
	constructor(x, y, radius, color, velocity){
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}
	
draw(){
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, 0,
		Math.PI*2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
	

update(){
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}
const friction = 0.99
class Gut{
	constructor(x, y, radius, color, velocity){
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.alpha =1
	}
	
draw(){
		ctx.save()
		ctx.globalAlpha = this.alpha
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, 0,
		Math.PI*2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.restore()
	}
	

update(){
		this.draw()
		this.velocity.x *= friction
		this.velocity.y *= friction
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
		this.alpha -= 0.01
	}
}

let player = new Player(canvas.width / 2, canvas.height / 2, 15, 'green')
let projectiles = []
let enemies = []
let guts = []

function init(){
	player = new Player(canvas.width / 2, canvas.height / 2, 15, 'green')
	projectiles = []
	enemies = []
	guts = []
	score = 0
	ScoreEl.innerHTML = score
	bigScoreEl.innerHTML = score
}

function spawnEnemies(){
	setInterval(()=>{
		const radius = Math.random()* (35 - 7) + 7
		let x
		let y
		if(Math.random() < 0.5){
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
			y = Math.random() * canvas.height
		} else {
			x = Math.random()* canvas.width
			y = Math.random() < 0.5 ? 0 - radius : canvas.height  + radius 
		}
		
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`
		const angle  = Math.atan2(
			canvas.height / 2 - y,
			canvas.width / 2 - x)
		const velocity = {
			x: Math.cos(angle)*3/4,
			y: Math.sin(angle)*3/4
		}
		enemies.push(new Enemy(x, y, radius, color, velocity))
		
		
	}, 250)
}
let animationId 
let score = 0
function animate(){
	animationId = requestAnimationFrame(animate)
	ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	player.draw()
	guts.forEach((gut, gindex) => {
		if (gut.alpha <= 0) {
			guts.splice(gindex, 1)
			
		}else{
			gut.update()
			
		}
		
	})
	//remove "unredered" projectiles
	projectiles.forEach((projectile, index) =>{
		projectile.update()
		if(projectile.x + projectile.radius  < 0 ||
		projectile.x - projectile.radius  > canvas.width||
		projectile.y - projectile.radius  > canvas.height||
		projectile.y + projectile.radius  < 0){
			setTimeout(() =>{

					projectiles.splice(index, 1)
				}, 0)
			
		}
		projectile.update()
	})
	enemies.forEach((enemy, index) => {
		enemy.update()
		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
		//end game
		if ( dist - enemy.radius - player.radius < 1){
			cancelAnimationFrame(animationId)
			startModel.style.display = 'flex'
			bigScoreEl.innerHTML = score
		}

		projectiles.forEach((projectile, pindex) => {
			const dist = Math.hypot(
			projectile.x - enemy.x, 
			projectile.y - enemy.y)
			
			//when projectiles touch enemy
			if(dist - enemy.radius -projectile.radius < 1){
				
				
				
				//create explosion
				for (let i = 0; i < enemy.radius*3/4; i++){
					guts.push(new Gut(projectile.x, projectile.y, Math.random()*3, enemy.color, {x: (Math.random() - 0.5) *(Math.random() * 4), y: (Math.random() - 0.5) *(Math.random()*4)}))
				}
				if(enemy.radius - 10 > 7) {
					//increase score by shrinking
					score+=100
					ScoreEl.innerHTML = score
					
					gsap.to(enemy, {
						radius: enemy.radius - 10
					})
					setTimeout(() =>{
					projectiles.splice(pindex, 1)
					}, 0)
				} else {
					//increase score by killing
					score+=250
					ScoreEl.innerHTML = score
				setTimeout(() =>{
					enemies.splice(index, 1)
					projectiles.splice(pindex, 1)
					}, 0)
				}
			}
		});
	})
}

addEventListener('click', (event) => {
		
		const angle  = Math.atan2(event.clientY - canvas.height / 2,
		event.clientX - canvas.width / 2)
		const velocity = {
			x: Math.cos(angle)*4 ,
			y: Math.sin(angle)*4
		}
		projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'green',
		velocity))
})

startGameBtn.addEventListener('click', ()=>{
	init()
	startModel.style.display = 'none'
	animate()
	spawnEnemies()
	
})
