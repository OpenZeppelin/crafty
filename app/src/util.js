
const uid = () => {
  return `${+(new Date())}-${Math.random()}`
}

module.exports = {
  uid,
}
