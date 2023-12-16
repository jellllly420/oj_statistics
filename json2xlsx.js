const xlsx = require('node-xlsx')
const fs = require('fs')

const config = require('./config.json')

let res = []

for(const i of config.probset_ids) {
    let data = require('./probset' + i + '.json')

    let res_ = [['id', 'name', 'pass']]

    let sheetOptions = {'!cols': [{wch: 11}, {wch: 8}, {wch: 6}]}

    for(const idx in data[0].probs) {
        res_[0].push(idx + '_submissions')
        sheetOptions['!cols'].push({wch: 8})
        res_[0].push(idx + '_pass')
        sheetOptions['!cols'].push({wch: 8})
        res_[0].push(idx + '_cost')
        sheetOptions['!cols'].push({wch: 21})
    }

    data.map(d => {
        let d_ = [
            d.id,
            d.name,
            d.probs.filter(prob => prob.accept != 0).length
        ]
    
        for(const idx in d.probs) {
            d_.push(d.probs[idx].times - d.probs[idx].testing)
            d_.push(d.probs[idx].accept != 0? 1: 0)
            d_.push(d.probs[idx].date_diff)
        }
        res_.push(d_)
    })
    
    res.push({name: 'probset' + i, data: res_, sheetOptions})
}

let buffer = xlsx.build(res)
fs.writeFileSync('./statistics.xlsx', buffer, {'flag': 'w'})
