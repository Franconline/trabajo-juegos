const apiRoot = 'http://localhost:3000/api/palabras/';
const adivinanzaRoot = 'http://localhost:3000/api/adivinanza/';
const letraIngresada = document.getElementById('letra');
const letrasPreviamenteIngresadas = document.querySelector('.letrasIngresadas');
const intentosRestantesHTML = document.querySelector('.intentosRestantes');
const letrasAhorcado = document.getElementById('letras');
const botonLetra = document.getElementById('botonLetra');
const canvas = document.getElementById('canvas-id');
const context = canvas.getContext('2d');


let datosJuego = {
    idJuegoActual: '',
    juegoTerminado: undefined,
    cantLetrasPalabra: 0,
    cantLetrasAcertadas: 0,
    intentosRestantes: 6,
    letrasProbadas: ['']
}


letraIngresada.addEventListener('keyup', function (event) {
    if (event.key == "Enter") {
        botonLetra.click();
        event.preventDefault();
    }
})
// Para que cuando toque enter, se lea la letra ingresada

function empezarJuego() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", adivinanzaRoot, true);
    xhttp.send();
    xhttp.onreadystatechange = stateChangeHandlerAdivinanza;
}


function stateChangeHandlerAdivinanza() {
    if (this.readyState == 4 && this.status == 200) {
        let objetoDevuelto = JSON.parse(this.responseText);
        datosJuego.cantLetrasPalabra = objetoDevuelto.cantLetras;
        datosJuego.idJuegoActual = objetoDevuelto.idJuegoActual;
        datosJuego.letrasProbadas = [''];
        datosJuego.juegoTerminado = false;
        datosJuego.intentosRestantes = 6;
        datosJuego.cantLetrasAcertadas = 0;
        letrasAhorcado.innerHTML = '';
        letrasPreviamenteIngresadas.innerHTML = 'Letras ya ingresadas: ';
        intentosRestantesHTML.innerHTML = 'Intentos Restantes: ' + datosJuego.intentosRestantes;

        for (let i = 0; i < datosJuego.cantLetrasPalabra; i++) {
            var nuevaLetra = document.createElement("li");
            nuevaLetra.classList.add('li')
            let contNuevaLetra = document.createTextNode(" _ ");
            nuevaLetra.appendChild(contNuevaLetra)
            letrasAhorcado.appendChild(nuevaLetra);
        }
        letrasAhorcado.style.gridTemplateColumns = `repeat(${datosJuego.cantLetrasPalabra}, 1fr)`;
        dibujarAhorcadoInicial();
    }
}
function preguntarPorLetra() {
    if ((!datosJuego.juegoTerminado) && (datosJuego.juegoTerminado != undefined)) {
        let letraActual = letraIngresada.value.toLowerCase();
        letraIngresada.value = '';
        letraIngresada.placeholder = 'Vuelve a ingresar otra letra';
        if (!datosJuego.letrasProbadas.includes(letraActual) && (letraActual != '')) { // si la letra ingresada no fue ingresada ya antes o no ingreso nada
            datosJuego.letrasProbadas.push(letraActual); // lo primero q hacemos es agregar la letra a este array
            letrasPreviamenteIngresadas.innerHTML += letraActual + ' - ';


            var xhttp = new XMLHttpRequest();
            xhttp.open("PUT", adivinanzaRoot, true);
            xhttp.setRequestHeader("Content-Type", "application/json");

            const obj = {
                letra: letraActual,
                idJuegoActual: datosJuego.idJuegoActual
            };
            var sendString = JSON.stringify(obj);
            xhttp.send(sendString);

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let letrasEnPalabra = JSON.parse(this.responseText);

                    if (letrasEnPalabra.cantApariciones != 0) {
                        let letrasLista = document.querySelectorAll('li');
                        for (let i = 0; i < letrasEnPalabra.posLetra.length; i++) {
                            if (letrasEnPalabra.posLetra[i] == 1) {
                                letrasLista[i].innerText = letraActual;
                            }
                        }
                    }
                    datosJuego.cantLetrasAcertadas += letrasEnPalabra.cantApariciones;
                    if (datosJuego.cantLetrasAcertadas == datosJuego.cantLetrasPalabra) {
                        datosJuego.juegoTerminado = true;
                        alert('Juego ganado.')
                    } else if (letrasEnPalabra.cantApariciones == 0) {
                        datosJuego.intentosRestantes--;
                        pierdeVida();
                        if (datosJuego.intentosRestantes == 0) {
                            datosJuego.juegoTerminado = true;
                            alert('Juego perdido');
                        }
                    }
                    if (datosJuego.juegoTerminado) {
                        eliminarPartida();
                    }
                    intentosRestantesHTML.innerHTML = 'Intentos Restantes: ' + datosJuego.intentosRestantes;
                }
            }
        } else {
            alert('Letra previamente ingresada o ingresada en blanco, proba otra.');
        }
    } else {
        alert('Juego terminado o no empezado, prueba a empezar un nuevo juego');
    }
}
function eliminarPartida() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", adivinanzaRoot + datosJuego.idJuegoActual + '/borrar', true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    const obj = {
        idJuegoActual: datosJuego.idJuegoActual
    };
    var sendString = JSON.stringify(obj);
    xhttp.send(sendString);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('Partida borrada');
        }
    }
}


// ------------- Funciones dibujo ahorcado ---------------------------
function dibujarAhorcadoInicial() {
    context.canvas.width = context.canvas.width; // me resetea el dibujo

    context.lineWidth = 3;
    context.moveTo(130, 475);
    context.lineTo(30, 475);
    context.lineTo(30, 25);
    context.lineTo(200, 25);
    context.lineTo(200, 75);
    context.stroke();
}

function pierdeVida() {
    context.lineWidth = 4;
    switch (datosJuego.intentosRestantes) {
        case 5:
            {
                context.beginPath();
                context.arc(200, 125, 50, 0, Math.PI * 2, true);
                context.closePath();
            }
            break;
        case 4:
            {
                context.moveTo(200, 175);
                context.lineTo(200, 325);
            }
            break;
        case 3:
            {
                context.moveTo(200, 200);
                context.lineTo(165, 265);
            }
            break;
        case 2:
            {
                context.moveTo(200, 200);
                context.lineTo(235, 265);
            }
            break;
        case 1:
            {
                context.moveTo(200, 324);
                context.lineTo(165, 384);
            }
            break;
        case 0:
            {
                context.moveTo(200, 324);
                context.lineTo(235, 384);
            }
    }
    context.stroke();
}
