const express = require('express');
const cors = require('cors');
const fs = require('fs');
const moduloAhorcado = require('./ahorcado.js');
const moduloTateti = require('./tateti.js');
const app = express();

app.use(express.static('public'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

const port = process.env.PORT || 3000; // si no tiene la variable PORT, denonimada variable de entorno,  declarada, va a valer 3000

// --------------------- AHORCADO ---------------------------------
app.get('/api/palabras', (req, res) => {
    res.send(palabras);
});
app.get('/api/palabras/cant', (req, res) => {
    res.send(`${palabras.length}`);  // parseo a string pq si no el send interpreta que estoy mandando un status.
});
app.get('/api/palabras/:id', (req, res) => {
    const pal = palabras.find(p => p.id === parseInt(req.params.id));
    if (!pal) {
        res.status(404).send('La palabra con el ID especificado no fue encontrada');
    } // estas lineas se hacen como buena practica, ya que yo declaro /cant para que me diga cuantos elementos tengo y a partir de ahi es q el front sortea.
    res.send(pal);
});

app.post('/api/adivinanza', (req, res) => {
    let adivinanza = moduloAhorcado.determinarPalabra();
    let datosFront = {
        cantLetras: adivinanza.palabraDeterminada.length,
        idJuegoActual: generarID()
    }
    let datosJSON = {
        cantLetras: adivinanza.palabraDeterminada.length,
        idJuegoActual: datosFront.idJuegoActual,
        palabraDeterminada: adivinanza.palabraDeterminada
    }

    fs.readFile('partidas_ahorcado.json', (error, contenido) => {
        if (error) {
            throw error;
        } else {
            obj = JSON.parse(contenido);
            obj.push(datosJSON);
            json = JSON.stringify(obj, null, 2); //con estos parametros al metódo stringify, el json se escribe de manera legible
            fs.writeFile('partidas_ahorcado.json', json, 'utf8', err => {
                if (err) throw err;
            })

        }
    })
    res.send(datosFront);
})



app.put('/api/adivinanza', checkearAdivinanza)

function checkearAdivinanza(req, res) {
    const letra = req.body['letra'];
    const idJuegoActual = req.body['idJuegoActual'];

    let i = 0;
    let apariciones = {
        cantApariciones: 0,
        posLetra: ['']
    }
    let json = JSON.parse(fs.readFileSync('partidas_ahorcado.json', 'utf8'));

    while ((i < json.length) && (json[i].idJuegoActual != idJuegoActual)) {
        i++;
    } // se busca en el arreglo si está el id que manda el front

    if (i < json.length) {  // se pregunta esto por que, si i >= json.length es porque llego al ult elemento del array y aun asi el id que manda el front diferia del que tenia el json
        for (let letter in json[i].palabraDeterminada) {
            if (letra == json[i].palabraDeterminada.charAt(letter)) {
                apariciones.posLetra[parseInt(letter, 10)] = 1;  // en vez de declarar una variable j, parseo la variable letter(string) a int
                apariciones.cantApariciones++;
            } else {
                apariciones.posLetra[parseInt(letter, 10)] = 0;
            }
        }

    }

    res.send(apariciones);
}

app.delete('/api/adivinanza/:idJuego/borrar', (req, res) => {
    const idJuego = req.body['idJuegoActual'];
    let i = 0;
    let json = JSON.parse(fs.readFileSync('partidas_ahorcado.json', 'utf8'));
    
    while ((i < json.length) && (json[i].idJuegoActual != idJuego)) {
        i++;
    } // se busca en el arreglo si está el id que manda el front

    if (i < json.length) {  // se pregunta esto por que, si i >= json.length es porque llego al ult elemento del array y aun asi el id que manda el front diferia del que tenia el json
        json.splice(i, 1);
        jsonActualizado = JSON.stringify(json, null, 2); //con estos parametros al metódo stringify, el json se escribe de manera legible
        fs.writeFile('partidas_ahorcado.json', jsonActualizado, 'utf8', err => {
            if (err) throw err;
        })
    }
    res.sendStatus(200);

})
// ---------------------- FIN AHORCADO ----------------------------
// ---------------------- INICIO TATETI ----------------------------
app.put('/api/tateti/:boardId/estado', (req, res) => {
    res.send(moduloTateti.estadoTablero(req.body));
})

app.post('/api/tateti/', (req, res) => {
    res.send(moduloTateti.empezarTateti());
})
app.put('/api/tateti/:boardId', (req, res) => {
    res.send(moduloTateti.entrarTateti(req.body['idPartida']));
})
app.put('/api/tateti/:boardId/jugada', (req, res) => {
    let idTablero = req.body['idPartida'];
    let idJugador = req.body['idJugador'];
    let pos = req.body['movimientoRealizado'];
    res.send(moduloTateti.hacerJugada(idTablero, idJugador, pos));
})
// ---------------------- FIN TATETI ----------------------------

// ---------------- GENERATE ID CODE ----------------

function generarID() {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

app.listen(port, () => console.log(`Listening on port ${port}`));  // estas comilas se hacen con alt-gr + boton de al lado del enter, el de cerrar corchete