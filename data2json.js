const superagent = require('superagent')
const events = require('events')
const cheerio = require('cheerio')
const fs = require('fs')

const config = require('./config.json')

const records = []

const emitter = new events.EventEmitter()
getCookie()
emitter.on('setCookie', getStudents)
emitter.on('setStudents', getHistory)
emitter.on('setHistory', save)

function getCookie() {
    superagent.post(config.urls.login)
              .set('Cookie', config.cookie)
              .type('form')
              .send({
                username: config.admin.username,
                password: config.admin.password,
                type: 'json'
              })
              .end(function(err, res) {
                  if(err) {
                      console.log('fail to login')
                  } else {
                      config.cookie += res.header['set-cookie']
                      emitter.emit('setCookie')
                  }
              })
}

function getStudents() {
    superagent.get(config.urls.rank.replace('@', config.probset.id))
              .set('Cookie', config.cookie)
              .end(function(err, res) {
                  if(err) {
                      console.log('fail to get rank')
                  } else {
                      const $ = cheerio.load(res.text)
                      const $table = $('.listtable')
                      const $tr = $table.find('tr').slice(1)
                      $tr.each(function() {
                          if($('td', $(this)).length) {
                              records.push({
                                  id: $('td', $(this)).eq(1).text(),
                                  name: $('td', $(this)).eq(3).text()
                              })
                          }
                      })
                      emitter.emit('setStudents')
                  }
              })
}

async function getHistory() {
    let cnt_student = 0
    for(const record_idx in records) {
        const record = records[record_idx]
        record.probs = []
        console.log(record.id)
        for(const prob_id of config.probset.prob_ids) {
            const prob = { id: prob_id }
            let submissions = []
            for(let i = 1, flag = true; flag === true; ++i) {
                console.log(i)
                await superagent.get(config.urls.history.replace('@', config.probset.id)
                                                 .replace('#', prob_id)
                                                 .replace('$', record.id)
                                                 .replace('%', i))
                                 .set('Cookie', config.cookie)
                                 .timeout({
                                     response: 5000,
                                     deadline: 30000
                                 })
                                 .retry(3)
                                 .then(res => {
                                     const $ = cheerio.load(res.text)
                                     const $table = $('#listtable')
                                     const $tr = $table.find('tr').slice(1)
                                     $tr.each(function() {
                                         submissions.push({
                                             state: $('td', $(this)).eq(1).text(),
                                             time: $('td', $(this)).eq(6).text()
                                         })
                                     })
                              
                                     if($tr.length === 0) {
                                         flag = false
                                     }
                                 })
            }
            submissions = submissions.filter(submission => submission.time <= config.probset.ddl)

            prob.submissions = submissions
            prob.times = submissions.length
            prob.accept = submissions.filter(submission => submission.state === 'Passed').length
            prob.testing = submissions.filter(submission => submission.state === 'Testing').length
            prob.fail = prob.times - prob.accept - prob.testing
            // Assume all the submissions can be displayed in one page. 
            // If not, it is almost sufficient to prove the student didn't cheat. 
            // In fact, Programming Grid has bug on page switching.
            prob.first_submission_date = submissions.length? submissions[submissions.length - 1].time: null
            prob.last_submission_date = submissions.length? submissions[0].time: null
            if(prob.times) {
                const start_date = new Date(prob.first_submission_date)
                const end_date = new Date(prob.last_submission_date)
                let date_diff = end_date.getTime() - start_date.getTime()
                const day_diff = Math.floor(date_diff / (24 * 60 * 60 * 1000))
                date_diff %= (24 * 60 * 60 * 1000)
                const hour_diff = Math.floor(date_diff / (60 * 60 * 1000))
                date_diff %= (60 * 60 * 1000)
                const minute_diff = Math.floor(date_diff / (60 * 1000))
                date_diff %= (60 * 1000)
                const second_diff = Math.round(date_diff / 1000)
                prob.date_diff = day_diff + '天' + hour_diff + '小时' + minute_diff + '分钟' + second_diff + '秒'
            } else {
                prob.date_diff = null
            }
            record.probs.push(prob)
        }
        records[record_idx] = record
        console.log(++cnt_student)
    }
    emitter.emit('setHistory')
}

function save() {
    const writer = fs.createWriteStream('probset' + config.probset.no + '.json')
    writer.write(JSON.stringify(records, undefined, 4), 'utf-8')
    writer.end()
}


