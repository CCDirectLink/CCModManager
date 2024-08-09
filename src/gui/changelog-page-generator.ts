import { ReleasePage } from 'ccmoddb/build/src/types'
import * as marked from 'marked'

export function generateChangelogPage(page: ReleasePage): sc.MultiPageBoxGui.ConditionalPage {
    const white = '\\c[0]'
    const yellow = '\\c[3]'

    let bodyTxt = markdownToTxt(page.body)
    bodyTxt = htmlDecode(bodyTxt)

    let listDepth = 0
    let popNext = false
    const lines = bodyTxt.split('\n').reduce((acc, line) => {
        if (line == '@listOpen') {
            listDepth++
            acc.pop()
            popNext = true
        } else if (line == '@listClose') {
            listDepth--
            if (listDepth > 0) popNext = true
        } else if (popNext) {
            popNext = false
        } else {
            acc.push(' '.repeat((Math.max(listDepth, 1) - 1) * 2) + line)
        }
        return acc
    }, [] as string[])

    return {
        content: [lines.join('\n')],

        title:
            yellow +
            (page.version.startsWith('v') ? '' : 'v') +
            page.version +
            white +
            ' from ' +
            yellow +
            new Date(page.timestamp).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }) +
            ` (${timeAgo(page.timestamp)})` +
            white,
    }
}

function markdownToTxt(markdown: string, options?: marked.MarkedOptions): string {
    const white = '\\c[0]'
    const yellow = '\\c[3]'

    const TxtRenderer: marked.Renderer = {
        code: code => code,
        blockquote: quote => quote,
        html: () => '',
        heading: (text, level) => '\n' + yellow + '#'.repeat(level) + ' ' + text + white + '\n',
        hr: () => '\n',
        list: body => '\n@listOpen\n' + body + '\n@listClose\n',
        listitem: (text, _task, _checked) => '\n- ' + text + '',
        checkbox: _checked => '',
        paragraph: text => text + '\n\n',
        table: (header, body) => header + body + '\n',
        tablerow: content => content.trim() + '\n',
        tablecell: (content, _flags) => content + ' ',

        strong: text => text,
        em: text => text,
        codespan: text => text,
        br: () => '\n',
        del: text => text,
        link: (_href, _title, text) => text,
        image: (_href, _title, text) => text,
        text: text => text,

        options: {},
    }
    options ??= {}
    options.renderer = TxtRenderer

    const unmarked = marked.marked(markdown, options) as string
    const unescaped = unmarked
    const trimmed = unescaped.trim()
    return trimmed
}

function htmlDecode(input: string): string {
    const doc = new DOMParser().parseFromString(input, 'text/html')
    return doc.documentElement.textContent!
}

function timeAgo(time: number): string {
    const timeFormats = [
        [60, 'seconds', 1],
        [120, '1 minute ago'],
        [3600, 'minutes', 60],
        [7200, '1 hour ago'],
        [86400, 'hours', 3600],
        [172800, 'yesterday'],
        [604800, 'days', 86400],
        [1209600, 'last week'],
        [2419200, 'weeks', 604800],
        [4838400, 'last month'],
        [29030400, 'months', 2419200],
        [58060800, 'last year'],
        [2903040000, 'years', 29030400],
        [5806080000, 'last century'],
        [58060800000, 'centuries', 2903040000],
    ] as const

    const seconds = (+new Date() - time) / 1000

    for (const format of timeFormats) {
        if (seconds < format[0]) {
            if (format.length == 2) {
                return format[1]
            } else {
                return `${Math.floor(seconds / format[2])} ${format[1]} ago`
            }
        }
    }

    return 'damn your old bro'
}
