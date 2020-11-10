const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const scoreEl = document.querySelector('#scoreEl')
const starGame = document.querySelector('#starGame')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

let audio = new Audio('sound/sound-effects-library-laser-gun.mp3')
let audio1 = new Audio('sound/albatross.mp3')
audio1.volume = 0.4;
let audio2 = new Audio('sound/000990601_prev.mp3')
let audio3 = new Audio('sound/boom.mp3')



class Jugador {
    constructor(x, y, radio, color) {
        this.x = x
        this.y = y
        this.radio = radio
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radio, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Disparo {
    constructor(x, y, radio, color, velocidad) {
        this.x = x
        this.y = y
        this.radio = radio
        this.color = color
        this.velocidad = velocidad
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radio, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocidad.x
        this.y = this.y + this.velocidad.y
    }
}

class Enemigo {
    constructor(x, y, radio, color, velocidad) {
        this.x = x
        this.y = y
        this.radio = radio
        this.color = color
        this.velocidad = velocidad
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radio, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocidad.x
        this.y = this.y + this.velocidad.y
    }
}

const friccion = 0.99
class Particula {
    constructor(x, y, radio, color, velocidad) {
        this.x = x
        this.y = y
        this.radio = radio
        this.color = color
        this.velocidad = velocidad
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radio, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocidad.x *= friccion
        this.velocidad.y *= friccion
        this.x = this.x + this.velocidad.x
        this.y = this.y + this.velocidad.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let jugador = new Jugador(x, y, 10, 'white')
let disparos = []
let enemigos = []
let particulas = []

function init(){
    jugador = new Jugador(x, y, 10, 'white')
    disparos = []
    enemigos = []
    particulas = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnemigos() {
    setInterval(() => {
        const radio = Math.random() * (30 - 4) + 4
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radio : canvas.width + radio
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radio : canvas.height + radio
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angulo = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        console.log(angulo)

        const velocidad = {
            x: Math.cos(angulo),
            y: Math.sin(angulo)
        }
        enemigos.push(new Enemigo(x, y, radio, color, velocidad))
        //console.log(enemigos)
    }, 1000)
}

let animationId
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    jugador.draw()
    particulas.forEach((particula, index) => {
        if (particula.alpha <= 0) {
            particulas.slice(index, 1)
        } else {
            particula.update()
        }
    });
    disparos.forEach((disparo, index) => {
        disparo.update()
        if (disparo.x + disparos.radio < 0 ||
            disparo.x - disparos.radio > canvas.width ||
            disparo.y + disparos.radio < 0 ||
            disparo.y - disparos.radio > canvas.height) {
            setTimeout(() => {
                disparos.splice(index, 1)
            }, 0)
        }
    })
    enemigos.forEach((enemigo, index) => {
        enemigo.update()

        const distancia = Math.hypot(jugador.x - enemigo.x, jugador.y - enemigo.y)

        //end game
        if (distancia - enemigo.radio - jugador.radio < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        disparos.forEach((disparo, indexDisparo) => {
            const distancia = Math.hypot(disparo.x - enemigo.x, disparo.y - enemigo.y)

            //Cuando los disparos toquen a un enemigo
            if (distancia - enemigo.radio - disparo.radio < 1) {
                audio3.play()
                audio3.currentTime=0
                //Creacion de explosiones
                for (let index = 0; index < enemigo.radio * 2; index++) {
                    particulas.push(new Particula(
                        disparo.x, disparo.y,
                        Math.random() * 3,
                        enemigo.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: Math.random() - 0.5 * (Math.random() * 6)
                        }
                    ))
                }
                if (enemigo.radio - 10 > 5) {

                    //Contacto con el enemigo aumenta la puntación 100
                    score += 100
                    scoreEl.innerHTML = score

                    gsap.to(enemigo, {
                        radio: enemigo.radio - 10
                    })
                    setTimeout(() => {
                        disparos.splice(indexDisparo, 1)
                    }, 0)
                } else {
                    audio2.play()
                    audio2.currentTime=0
                    //Destrozar al enemigo aumenta la puntuacion 250
                    score += 250
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                        enemigos.splice(index, 1)
                        disparos.splice(indexDisparo, 1)
                    }, 0)
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    audio.play()
    audio1.play()
    audio.currentTime=0
    const angulo = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2)
    console.log(angulo)

    const velocidad = {
        x: Math.cos(angulo) * 5,
        y: Math.sin(angulo) * 5
    }

    disparos.push(new Disparo(
        canvas.width / 2, canvas.height / 2, 5, 'white', velocidad
    )
    )
})
starGame.addEventListener('click', () => {
    init()
    animate()
    spawnEnemigos()

    modalEl.style.display = 'none'
})
