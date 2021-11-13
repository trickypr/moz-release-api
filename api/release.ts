import { VercelRequest, VercelResponse } from '@vercel/node'
import fetch from 'node-fetch'
import cheerio from 'cheerio'

export default async (request: VercelRequest, response: VercelResponse) => {
  const { tag } = request.query

  const tagRawHg = await (
    await fetch(`https://hg.mozilla.org/releases/mozilla-release/rev/${tag}`)
  ).text()

  const $ = cheerio.load(tagRawHg)

  const tables = $('table tbody tr')

  const items = {}

  tables.each((i, row) => {
    const children = row.children as any[]

    if (typeof children === 'undefined') return

    if (children.length !== 2 || typeof children.length === 'undefined') return

    const nameNode = children[0].children[0]
    const dataNode = children[1].children as any[]

    if (typeof nameNode == 'undefined' || typeof dataNode == 'undefined') return

    const name = nameNode.data.replace(' ', '_')
    const data = dataNode.reduce((prev, curr) => prev + curr.data, '')

    items[name] = data
  })

  response.status(200).send(items)
}
