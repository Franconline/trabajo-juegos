const API = 'http://localhost:3000/api/tateti/';
const INPUTID = document.getElementById('input-id');
const VACIO = '';
const CRUZ = 'X';
const CIRCULO = 'O';
const DIVREJUEGO = document.getElementById('rejuego');
const DIVFORM = document.getElementById('form');

let datosPartida = {
    idJugador: '',
    idPartida: '',
    juegoTerminado: undefined,
    movimientoRealizado: {
        x: '',
        y: ''
    },
    tablero: [
        [VACIO, VACIO, VACIO],
        [VACIO, VACIO, VACIO],
        [VACIO, VACIO, VACIO]
    ]
}



function comenzarJuego() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", API, true);
    xhttp.send();
    xhttp.onreadystatechange = stateChangeHandlerComenzar;
}

function stateChangeHandlerComenzar() {
    if (this.readyState == 4 && this.status == 200) {
        let datosServidor = JSON.parse(this.responseText);
        datosPartida.idPartida = datosServidor.idPartida;
        datosPartida.idJugador = datosServidor.idJugador;
        DIVFORM.innerHTML = `<p id="p" class="p"> Codigo de sala generado, pasale este id a tu amigo -> ${datosPartida.idPartida}</p>`
        console.log('estoy acá');
    }
}


function ingresarSalaExistente() {
    if (INPUTID.value != '') {
        datosPartida.idPartida = INPUTID.value;
        var xhttp = new XMLHttpRequest();
        xhttp.open("PUT", API + datosPartida.idPartida, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(datosPartida));
        xhttp.onreadystatechange = stateChangeHandlerEntrar;
    } else {
        alert('Ingrese un id para comenzar el juego.');
    }
}

function stateChangeHandlerEntrar() {
    if (this.readyState == 4 && this.status == 200) {
        let datosServidor = JSON.parse(this.responseText);
        if (datosServidor.idPartida != -1) {
            datosPartida.idJugador = datosServidor.idJugador;
            datosPartida.juegoTerminado = false;
            DIVFORM.innerHTML = '<p id="p" class="p"> Partida empezada...</p>'
        } else {
            alert('Codigo ingresado no encontrado, checkea que el codigo ingresado esté bien escrito. ');
        }
    }
}


window.onload = prenderTablero;

function prenderTablero() {
    document.getElementById('container').onclick = (e) => {
        if (e.target.tagName == 'BUTTON') {
            datosPartida.movimientoRealizado.x = e.target.id.charAt(0);
            datosPartida.movimientoRealizado.y = e.target.id.charAt(2);
            if (datosPartida.juegoTerminado != undefined && !datosPartida.juegoTerminado) {
                hacerMovimiento();
            } else {
                alert('Juego terminado o no empezado.');
            }
        }
    };
}

function hacerMovimiento() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", API + datosPartida.idPartida + "/jugada", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(datosPartida));
    xhttp.onreadystatechange = stateChangeHandlerJugada;
}

function stateChangeHandlerJugada() {
    if (this.readyState == 4 && this.status == 200) {
        let objetoDevuelto = JSON.parse(this.responseText);
        if (objetoDevuelto.mensaje == 'ok') {
            botonPulsado(datosPartida.movimientoRealizado['x'], datosPartida.movimientoRealizado['y'], objetoDevuelto.figura);
        } else {
            alert(objetoDevuelto.mensaje);
        }
    }
}

function botonPulsado(x, y, figura) {
    let pos = x + '-' + y;
    datosPartida.tablero[x][y] = figura;
    document.getElementById(pos).innerHTML = figura;
    if (figura == CRUZ) {
        document.getElementById(pos).style.backgroundColor = '#6decff';
    } else if (figura == CIRCULO) {
        document.getElementById(pos).style.backgroundColor = '#977af2';
    }
}

var intervaloId = setInterval(function () {
    if (datosPartida.idPartida != '') {
        var xhttp = new XMLHttpRequest();
        xhttp.open("PUT", API + datosPartida.idPartida + "/estado", true);
        let datosIndiv = {
            idPartida: datosPartida.idPartida,
            idJugador: datosPartida.idJugador
        }
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(datosIndiv));
        xhttp.onreadystatechange = stateChangeHandlerEstadoTablero;
    }
}, 500); // Cada 0.5 segs pregunta si el juego termino y si ganó

function stateChangeHandlerEstadoTablero() {
    if (this.readyState == 4 && this.status == 200) {
        let datosServidor = JSON.parse(this.responseText);
        checkearTablero(datosServidor.tablero);
        if (datosServidor.juegoTerminado == false && datosPartida.juegoTerminado == undefined) {  // si pongo !datosPartida.juegoTerminado, y es = undefined, me entra al bloque y no es lo que busco
            DIVFORM.innerHTML = '<p id="p" class="p"> Partida empezada...</p>'
        }  // con este nuevo if no me resetea cada vez que trae el estado el innerHTML de .form => lo cambia la 1era vez

        datosPartida.juegoTerminado = datosServidor.juegoTerminado;
        if (datosPartida.juegoTerminado) {
            clearInterval(intervaloId); // con esto se deja de pedir request de estado al servidor
            if (datosServidor.idGanador != 'EMPATE') {
                DIVFORM.innerHTML = `<p id="p" class="p"> Partida terminada. Ganador -> ${datosServidor.figuraGanador}</p>`
                alert(`Partida terminada. Ganador: ${datosServidor.figuraGanador}`);
            } else {
                DIVFORM.innerHTML = `<p id="p" class="p"> Partida terminada. EMPATE</p>`
                alert(`Partida terminada. Hubo empate`);
            }
            preguntarRejuego();
        }
    } else if (this.status == 404) {
        alert('Todavia no has entrado a partida o esperando a oponente');
    }
}

function checkearTablero(tableroServidor) {

    if (datosPartida.tablero.toString() != tableroServidor.toString()) {
        datosPartida.tablero = tableroServidor;
        actualizarTableroPagina();
    }
}
function actualizarTableroPagina() {
    for (x = 0; x < datosPartida.tablero.length; x++) {
        for (y = 0; y < datosPartida.tablero[x].length; y++) {
            let pos = x + '-' + y;
            document.getElementById(pos).innerHTML = datosPartida.tablero[x][y];
            if (datosPartida.tablero[x][y] == CRUZ) {
                document.getElementById(pos).style.backgroundColor = '#6decff';
            } else if (datosPartida.tablero[x][y] == CIRCULO) {
                document.getElementById(pos).style.backgroundColor = '#977af2';
            }
        }
    }
}



function preguntarRejuego() {
    let btn = document.createElement("button");
    btn.innerHTML = "Deseas volver a jugar?";
    btn.type = "submit";
    btn.onclick = _ => {  // el _ es para decirle que la funcion no tiene parametros
        location.reload();
        return false;
    }
    document.getElementById('p').style.gridColumn = "1/3";
    btn.style.gridColumn = "3/4";
    btn.style.width = "100%";
    DIVFORM.appendChild(btn);
}
