export const characters = []

export function setCharacters(data) {
  characters.length = 0
  characters.push(...data)
}

export default characters
