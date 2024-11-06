const { parse } = require('node-html-parser')

module.exports = function search (req, res) {
  const term = req.query.term
  if (!term) {
    res.status(400).send('Missing term')
    return
  }

  Promise.all([searchArcanum(term), searchCoppermind(term)])
    .then(([arcanum, coppermind]) => res.json({ arcanum, coppermind }))
    .catch(error => {
      console.error(error)
      res.status(500).send('An error occurred')
    })
}

// ARCANUM

const ARCANUM_URL = 'https://wob.coppermind.net/adv_search/'

async function searchArcanum (searchTerm) {
  const entriesInPage = pageHTML => {
    const elements = pageHTML.querySelectorAll('.entry-content')
    return elements
      .map(element => element.textContent)
      .map(text => text.replace(/\s+/g, ' ').trim())
  }

  const loadPageHTML = async page => {
    const pageContent = await request(`${ARCANUM_URL}?ordering=rank&query=${searchTerm}&page=${page}`)
    return parse(pageContent)
  }

  const entriesCount = pageHTML => {
    const match = pageHTML.innerHTML.match(/Found (\d+) entries/)
    return match ? parseInt(match[1]) : 0
  }

  const firstPageHTML = await loadPageHTML(1)
  const numberOfEntries = entriesCount(firstPageHTML)
  const numberOfPages = Math.ceil(numberOfEntries / 50)
  console.log('Found %d WOB entries in %d pages', numberOfEntries, numberOfPages)
  const pagesEtnries = await Promise.all([...Array(numberOfPages).keys()].map(async page => await entriesInPage(await loadPageHTML(page + 1))))
  return pagesEtnries.flat()
}


// COPPERMIND

const COPPERMIND_API_URL = 'https://coppermind.net/w/api.php'
const COPPERMIND_WIKI_URL = 'https://coppermind.net/wiki/w/api.php'

async function searchCoppermind (searchTerm) {
  const pages = (await request(`${COPPERMIND_API_URL}?action=opensearch&search=${searchTerm}`, 'json'))[1]
  console.log('Found %d wiki pages', pages.length)
  const contents = []
  for (const page of pages) {
    if (page.includes('Gallery')) continue
    const content = await request(`${COPPERMIND_WIKI_URL}?action=raw&title=${page}`)
    contents.push(content)
  }
  return contents
}

async function request (url, action = 'text') {
  console.log(url)
  const response = await fetch(url)
  const data = await response[action]()
  return data
}
