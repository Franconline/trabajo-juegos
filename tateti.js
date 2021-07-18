const fs = require('fs');
const JSON_FILENAME = 'partidas_tateti.json';
const VACIO = '';
const CRUZ = 'X';
const CIRCULO = 'O';
const COMBINACIONES_GANADORAS = [
    [[0, 0], [0, 1], [0, 2]], // 1° fila
    [[1, 0], [1, 1], [1, 2]], // 2° fila
    [[2, 0], [2, 1], [2, 2]], // 3° fila
    //Fila 1, 2 y 3

    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
    // Diagonales

    [[0, 0], [1, 0], [2, 0]], // 1° columna
    [[0, 1], [1, 1], [2, 1]], // 2° columna
    [[0, 2], [1, 2], [2, 2]], // 3° columna


    //Columnas

]

function empezarTateti() { // esta function es para el jugador que entra
    let infoPartida = {
        tablero: [
            [VACIO, VACIO, VACIO],
            [VACIO, VACIO, VACIO],
            [VACIO, VACIO, VACIO]
        ],
        turno: CRUZ,
        id: generarID(),
        jugadorCruz: generarID(),
        jugadorCirculo: '',
        juegoTerminado: undefined,
        idGanador: '',
        figuraGanador: '',
        movimientosDisponibles: 9 // total movs en el tablero -> si esta variable = 0, draw
    }
    guardarTateti(infoPartida);
    return {
        idPartida: infoPartida.id,
        idJugador: infoPartida.jugadorCruz
    };

}
function entrarTateti(idTablero) { // esta function es para el 2do jugador
    let tablero = leerTablero(idTablero); // q entre al json, busque el objeto del tablero y lo retorne
    tablero.jugadorCirculo = generarID();
    tablero.juegoTerminado = false; // ahora el juego empezó
    if(tablero != -1){
        actualizarTablero(tablero); // actualizarTablero busca la partida en el json y actualiza los campos
        return {
            idPartida: tablero.id,
            idJugador: tablero.jugadorCirculo
        }
    }else{
        return {
            idPartida : -1
        }
    }
}

function guardarTateti(infoPartida) {

    fs.readFile(JSON_FILENAME, (error, contenido) => {
        if (error) {
            throw error;
        } else {
            obj = JSON.parse(contenido);
            obj.push(infoPartida);
            json = JSON.stringify(obj, null, 6); //con estos parametros al metódo stringify, el json se escribe de manera legible
            fs.writeFile(JSON_FILENAME, json, 'utf8', err => {
                if (err) throw err;
            })

        }
    })
}
function leerTablero(idTablero) {
    let objeto = JSON.parse(fs.readFileSync(JSON_FILENAME, 'utf8'));
    let i = 0;
    while ((i < objeto.length) && (objeto[i].id != idTablero)) {
        i++;
    } // se busca en el arreglo si está el id que manda el front

    if (i < objeto.length) {  // se pregunta esto por que, si i >= json.length es porque llego al ult elemento del array y aun asi el id que manda el front diferia del que tenia el json
        return objeto[i]; // retorno la info de partida
    } else {
        return -1; // retorno valor simbolico de error
    }

}
function actualizarTablero(tablero) {
    let objeto = JSON.parse(fs.readFileSync(JSON_FILENAME, 'utf8'));
    let i = 0;
    while ((i < objeto.length) && (objeto[i].id != tablero.id)) {
        i++;
    } // se busca en el arreglo si está el id que manda el front

    if (i < objeto.length) {  // se pregunta esto por que, si i >= json.length es porque llego al ult elemento del array y aun asi el id que manda el front diferia del que tenia el json
        objeto[i].jugadorCirculo = tablero.jugadorCirculo;
        objeto[i].juegoTerminado = tablero.juegoTerminado;
        objeto[i].tablero = tablero.tablero;
        objeto[i].turno = tablero.turno;
        objeto[i].movimientosDisponibles = tablero.movimientosDisponibles;
        objeto[i].juegoTerminado = tablero.juegoTerminado;
        objeto[i].idGanador = tablero.idGanador;
        objeto[i].figuraGanador = tablero.figuraGanador;

        if ((objeto[i].movimientosDisponibles == 0) && (tablero.idGanador == '')) {
            objeto[i].idGanador = 'EMPATE';
            objeto[i].juegoTerminado = true;
        }
        fs.writeFile(JSON_FILENAME, JSON.stringify(objeto, null, 2), err => {
            if (err) {
                throw err;
            }
        });
    }
}

function hacerJugada(idTablero, idJugador, pos) {
    let infoPartida = leerTablero(idTablero);
    let objetoDevolver = {
        mensaje: '',
        figura: VACIO,
        juegoTerminado: undefined
    };

    if (!infoPartida.juegoTerminado) { // checkeo que el juego no esté terminado
        if ((idJugador == infoPartida.jugadorCirculo) || (idJugador == infoPartida.jugadorCruz)) { // checkeo que la id que me mandan sea de este tablero
            if (idJugador == infoPartida.jugadorCirculo) {
                if (infoPartida.turno == CIRCULO) {
                    if (infoPartida.tablero[pos['x']][pos['y']] == VACIO) {  // pos es un objeto con 2 campos : x e y, y de esta manera validamos que el mov se pueda hacer
                        infoPartida.tablero[pos['x']][pos['y']] = CIRCULO;
                        infoPartida.turno = CRUZ;
                        infoPartida.movimientosDisponibles--;
                        let ganoPartida = checkearGanador(infoPartida.tablero, CIRCULO);
                        objetoDevolver.mensaje = 'ok';
                        objetoDevolver.figura = CIRCULO;
                        if (ganoPartida) {
                            infoPartida.juegoTerminado = true,
                                infoPartida.idGanador = infoPartida.jugadorCirculo,
                                infoPartida.figuraGanador = CIRCULO
                        }
                        actualizarTablero(infoPartida);
                    } else {
                        objetoDevolver.mensaje = "Movimiento no valido";
                    }
                } else {
                    objetoDevolver.mensaje = "No es tu turno";
                }
            } else { // como estoy adentro del if que pregunta si el idJugador es o cruz o circulo, se que si no es circulo es cruz
                if (infoPartida.turno == CRUZ) {
                    if (infoPartida.tablero[pos['x']][pos['y']] == VACIO) {  // pos es un objeto con 2 campos : x e y, y de esta manera validamos que el mov se pueda hacer
                        infoPartida.tablero[pos['x']][pos['y']] = CRUZ;
                        infoPartida.turno = CIRCULO; // si el mov de cruz es valido, ahora actualizo campos del tablero para actualizar el json
                        infoPartida.movimientosDisponibles--;
                        let ganoPartida = checkearGanador(infoPartida.tablero, CRUZ);
                        objetoDevolver.mensaje = 'ok';
                        objetoDevolver.figura = CRUZ;
                        if (ganoPartida) {
                            infoPartida.juegoTerminado = true,
                                infoPartida.idGanador = infoPartida.jugadorCruz,
                                infoPartida.figuraGanador = CRUZ;
                        }
                        actualizarTablero(infoPartida);
                    } else {
                        objetoDevolver.mensaje = "Movimiento no valido";
                    }
                } else {
                    objetoDevolver.mensaje = "No es tu turno";
                }
            }
        } else {
            objetoDevolver.mensaje = "Id jugador no pertenece a esta partida";
        }

    } else {
        objetoDevolver.mensaje = "Juego terminado";
    }
    return objetoDevolver;
}
function estadoTablero(datos) {
    let datosPartida = leerTablero(datos.idPartida);
    let objetoDevolver = {
        tablero: datosPartida.tablero,
        juegoTerminado: datosPartida.juegoTerminado,
        gane: datos.idJugador == datosPartida.idGanador ? true : false,
        idGanador: datosPartida.idGanador,
        figuraGanador: datosPartida.figuraGanador
    }
    return objetoDevolver;
}

function checkearGanador(tablero, figura) {
    let ganoFigura = false;
    if (tablero[0][0] == figura) {
        if (((tablero[0][1] == figura) && (tablero[0][2] == figura)) || ((tablero[1][0] == figura) && (tablero[2][0] == figura)) || ((tablero[1][1] == figura) && (tablero[2][2] == figura))) {
            ganoFigura = true;
            // checkeo fila 0, columna 0, y diagonal 0
        }
    } else if (tablero[1][1] == figura) {
        if (((tablero[1][0] == figura) && (tablero[1][2] == figura)) || ((tablero[0][1] == figura) && (tablero[2][1] == figura)) || ((tablero[2][0] == figura) && (tablero[0][2] == figura))) {
            ganoFigura = true;
            // checkeo fila 2, columna 2 y diagonal 1
        }
    } else if (tablero[2][2] == figura) {
        if (((tablero[2][0] == figura) && (tablero[2][1] == figura)) || ((tablero[1][2] == figura) && (tablero[0][2] == figura))) {
            ganoFigura = true;
            // checkeo fila 3 y columna 3;
        }
    }

    return ganoFigura;
    // let posFigura = [];
    // for(let x = 0; x < tablero.length; x++){
    //     for(let y = 0; y < tablero[x].length; y++){
    //         if(tablero[x][y] == figura){
    //             posFigura.push([x,y]);
    //         }
    //     }
    // }
    // if(posFigura.length > 3){
    //     posFigura.pop();
    // }
    // COMBINACIONES_GANADORAS.forEach(y =>{
    //     console.log("Este es una posible combinacion: " + y);
    //     if(JSON.stringify(posFigura) == JSON.stringify(y)){
    //         return true; // se devuelve que ganó
    //     }
    // });
}

function generarID() {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

module.exports.empezarTateti = empezarTateti;
module.exports.entrarTateti = entrarTateti;
module.exports.hacerJugada = hacerJugada;
module.exports.estadoTablero = estadoTablero;