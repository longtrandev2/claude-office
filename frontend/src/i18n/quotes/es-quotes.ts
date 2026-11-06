import type { QuoteSet } from "./quote-set-type";

/** Adventurer dialogue (es). `{name}` is replaced with the agent's name. */
const es: QuoteSet = {
  accept: [
    "En camino.",
    "Dalo por hecho.",
    "Misión aceptada.",
    "Tomo el túnel de la izquierda.",
    "Guía tú.",
    "Afilo la espada y voy.",
    "El mapa ya está en la mochila.",
    "Vuelvo antes de que se apaguen las antorchas.",
    "Déjamelo a mí.",
    "Enseguida, Maestro.",
    "Conozco estos pasillos.",
    "No digas más.",
    "Pues a la oscuridad.",
    "Ya estoy empacando.",
  ],
  complete: [
    "Misión cumplida.",
    "Hecho. Ni un rasguño.",
    "Aquí está el botín.",
    "Despejado y cartografiado.",
    "Aguantó. Por poco.",
    "Volví con la mercancía.",
    "Todo en orden.",
    "Listo para revisión.",
    "El túnel está despejado.",
    "Sellado y entregado.",
    "Estaba donde dijiste.",
    "El informe está en la mesa.",
    "Ese se resistió.",
    "Hecho, y el mapa actualizado.",
  ],
  farewell: [
    "A la taberna.",
    "Hasta la próxima misión.",
    "La antorcha es tuya.",
    "A descansar los pies.",
    "Avísame si se mueven las paredes.",
    "Nos vemos en la superficie.",
    "Buena caza.",
    "Estaré junto al fuego.",
    "Mantén las luces encendidas.",
    "Adiós, Maestro.",
  ],
  assign: [
    "Tu misión, {name}.",
    "Toma esta, {name}.",
    "{name}, te toca.",
  ],
  receive: [
    "Bien hecho, {name}.",
    "Buen trabajo, {name}. Me lo quedo.",
    "Gran trabajo, {name}.",
  ],
};

export default es;
