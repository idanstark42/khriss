const { parse } = require('node-html-parser')

const { summarize } = require('./nazh')

async function all (searchTerm) {
  const [arcanumData, coppermindData] = await Promise.all([arcanum(searchTerm), coppermind(searchTerm)])
  let sources = []
  if (arcanumData.sources) sources = [...sources, arcanumData.sources]
  if (coppermindData.sources) sources = [...sources, coppermindData.sources]
  return {
    arcanum: arcanumData.summary || arcanumData,
    coppermind: coppermindData.summary || coppermindData,
    sources
  }
}

// ARCANUM

const ARCANUM_URL = 'https://wob.coppermind.net'

async function arcanum (searchTerm) {
  const entriesInPage = pageHTML => {
    const links = pageHTML.querySelectorAll('.entry-options a:first-child')
      .map(link => `${ARCANUM_URL}${link.getAttribute('href')}`)
    const contents = pageHTML.querySelectorAll('.entry-content')
      .map(content => content.textContent)
      .map(text => text.replace(/\s+/g, ' ').trim())
    if (links.length !== contents.length) throw new Error('Mismatch between links and contents')
    return links.map((link, i) => ({ link, content: contents[i] }))
  }

  const loadPageHTML = async page => {
    const pageContent = await request(`${ARCANUM_URL}/adv_search/?ordering=rank&query=${searchTerm}&page=${page}`)
    return parse(pageContent)
  }

  const entriesCount = pageHTML => {
    const match = pageHTML.innerHTML.match(/Found (\d+) entries/)
    return match ? parseInt(match[1]) : 0
  }

  const firstPageHTML = await loadPageHTML(1)
  const numberOfEntries = entriesCount(firstPageHTML)
  const numberOfPages = Math.ceil(numberOfEntries / 50)
  const pagesEtnries = await Promise.all([...Array(numberOfPages).keys()].map(async page => entriesInPage(await loadPageHTML(page + 1))))
  const entries = pagesEtnries.flat()

  const summaries = await Promise.all(entries.map(async entry => await summarize(entry.content, searchTerm)))
  const summary = await summarize(summaries.join('\n\n').replace(/undefined/g, ''), searchTerm)

  const sources = entries.map(entry => `<a href="${entry.link}">${entry.link}</a>`)

  return { summary, sources }
}


// COPPERMIND

const COPPERMIND_API_URL = 'https://coppermind.net/w/api.php'
const COPPERMIND_WIKI_URL = 'https://coppermind.net/wiki/w/api.php'

async function coppermind (searchTerm) {
  const pages = (await request(`${COPPERMIND_API_URL}?action=opensearch&search=${searchTerm}`, 'json'))[1]
  const contents = await Promise.all(pages.map(async page => await request(`${COPPERMIND_WIKI_URL}?action=raw&title=${page}`)))

  const summary = (await summarize(contents.join('\n\n'), searchTerm)).replace(/undefined/g, '')
  return {
    summary,
    sources: pages.map((page, i) => `<a href="https://coppermind.net/wiki/${page}">${page}</a>`).join(', ')
  }
}

async function request (url, action = 'text') {
  (url)
  const response = await fetch(url)
  const data = await response[action]()
  return data
}

module.exports = { all, arcanum, coppermind }
