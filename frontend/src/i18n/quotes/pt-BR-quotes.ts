import type { QuoteSet } from "./quote-set-type";

/** Adventurer dialogue (pt-BR). `{name}` is replaced with the agent's name. */
const ptBR: QuoteSet = {
  accept: [
    "A caminho.",
    "Considere feito.",
    "Missão aceita.",
    "Vou pelo túnel da esquerda.",
    "Pode guiar.",
    "Afio a espada e vou.",
    "O mapa já está na mochila.",
    "Volto antes das tochas apagarem.",
    "Deixa comigo.",
    "Agora mesmo, Mestre.",
    "Conheço esses corredores.",
    "Não precisa dizer mais.",
    "Para o escuro, então.",
    "Já estou arrumando a mochila.",
  ],
  complete: [
    "Missão cumprida.",
    "Pronto. Nem um arranhão.",
    "Aqui está o espólio.",
    "Limpo e mapeado.",
    "Aguentou. Por pouco.",
    "Voltei com a encomenda.",
    "Tudo conferido.",
    "Pronto para inspeção.",
    "O túnel está livre.",
    "Selado e entregue.",
    "Estava onde você disse.",
    "O relatório está na mesa.",
    "Esse resistiu.",
    "Feito, e o mapa atualizado.",
  ],
  farewell: [
    "Para a taverna.",
    "Até a próxima missão.",
    "A tocha é sua.",
    "Vou descansar os pés.",
    "Me chame se as paredes se mexerem.",
    "Até lá em cima.",
    "Boa caçada.",
    "Estarei perto da fogueira.",
    "Mantenha as luzes acesas.",
    "Adeus, Mestre.",
  ],
  assign: [
    "Sua missão, {name}.",
    "Pegue esta, {name}.",
    "{name}, é a sua vez.",
  ],
  receive: [
    "Muito bem, {name}.",
    "Bom trabalho, {name}. Eu fico com isso.",
    "Ótimo trabalho, {name}.",
  ],
};

export default ptBR;
