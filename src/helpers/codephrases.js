const { collection } = require('./data-access')

exports.getMeaning = async function (phrase) {
  const codephrases = await collection('codephrases')
  // find the first document for which the pattern matches the phrase
  const codephrase = await codephrases.findOne({ $expr: { $regexMatch: { input: phrase, regex: '$pattern', options: 'i' } } })
  if (!codephrase || !codephrase.meaning) {
    return null
  }
  return codephrase.meaning
}