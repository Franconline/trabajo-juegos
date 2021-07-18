let adivinanza;

const palabras = [
    {
        id: 1,
        palabra: 'Palabra1'
    },
    {
        id: 2,
        palabra: 'Word2'
    },
    {
        id: 3,
        palabra: 'Palabraaa3'
    }
]

function determinarPalabra(){

    let random = Math.random() * palabras.length | 0;
    
    let adivinanza = {
        id : palabras[random].id,
        palabraDeterminada : palabras[random].palabra.toLowerCase(),
        palabraActual : ''
    }
    return adivinanza;
}

module.exports.determinarPalabra = determinarPalabra;
module.exports.adivinanza = adivinanza;