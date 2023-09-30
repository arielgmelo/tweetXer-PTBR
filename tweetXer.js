// ==UserScript==
// @name         TweetXer
// @namespace    https://gist.github.com/lucahammer/a4d1e957ec9e061e3cccafcbed599e16/
// @version      0.3
// @description  Delete all your Tweets for free.
// @author       Luca
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        unsafeWindow
// ==/UserScript==

/*
 TweetXer

 You can use this script to delete all your Tweets. Even if they don't show up on your profile. But you need your Data Export for it to work.
 Because this automates the deletion, it may get your account banned. Not that bad. Copies of your Tweets may still exist on backups and so on.

 # Usage
 0. Log into your Twitter account
 1. You must have at least one visible Tweet on your profile. Post a new one, if there isn't one.
 2. Open the browser console (F12)
 3. Paste the whole script into the console and press enter
 4. A light blue bar appears at the top of the window
 5. Use the file picker to select your tweets.js
 6. Wait a long time for all your Tweets to vanish

 If the process is interrupted at any time, you can enter how many Tweets have been deleted in the previous run to not start at zero again.

 # How it works
 Never use something like this from an untrusted source. The script intercepts requests from your browser to Twitter and replaces the Tweet-IDs
 with IDs from your tweets.js file. This allows it to access the old Tweets and delete them.

 XHR interception inspired by https://github.com/ttodua/Tamper-Request-Javascript-Tool
 Faster deletion inspired by https://github.com/Lyfhael/DeleteTweets

 Copyright 2023 Nobody
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var TweetsXer = {
    allowed_requests: [],
    dId: "exportUpload",
    tIds: [],
    tId: "",
    ratelimitreset: 0,
    more: '[data-testid="tweet"] [aria-label="More"][data-testid="caret"]',
    skip: 0,
    total: 0,
    dCount: 0,
    lastHeaders: {},
    deleteURL: 'https://twitter.com/i/api/graphql/VaenaVgh5q5ih7kvyVjgtg/DeleteTweet',
    unfavURL: 'https://twitter.com/i/api/graphql/ZYKSe-w7KEslx3JhSIk5LA/UnfavoriteTweet',
    username: '',
    action: '',

    init() {
        // document.querySelector('header>div>div').setAttribute('class', '')
        TweetsXer.username = document.location.href.split('/')[3]
        this.createUploadForm()
        TweetsXer.initXHR()
    },

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    },
    async waitForElemToExist(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector))
            }

            var observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector))
                    observer.disconnect()
                }
            })

            observer.observe(document.body, {
                subtree: true,
                childList: true,
            })
        })
    },

    initXHR() {
        if (typeof AjaxMonitoring_notfired == "undefined")
            var AjaxMonitoring_notfired = false
        if (!AjaxMonitoring_notfired) {
            AjaxMonitoring_notfired = true

            /* NOTE: XMLHttpRequest actions happen in this sequence: at first "open"[readyState=1] happens, then "setRequestHeader", then "send", then "open"[readyState=2] */

            var XHR_SendOriginal = XMLHttpRequest.prototype.send
            XMLHttpRequest.prototype.send = function () {
                XHR_SendOriginal.apply(this, arguments)
            }

            var XHR_OpenOriginal = XMLHttpRequest.prototype.open
            XMLHttpRequest.prototype.open = function () {
                if (arguments[1] && arguments[1].includes("DeleteTweet")) {
                    // POST /DeleteTweet
                    TweetsXer.deleteURL = arguments[1]
                }
                XHR_OpenOriginal.apply(this, arguments)
            }

            var XHR_SetRequestHeaderOriginal = XMLHttpRequest.prototype.setRequestHeader
            XMLHttpRequest.prototype.setRequestHeader = function (a, b) {
                TweetsXer.lastHeaders[a] = b
                XHR_SetRequestHeaderOriginal.apply(this, arguments)
            }
        }
    },

    updateProgressBar() {
        document.getElementById('progressbar').setAttribute('value', this.dCount)
        document.getElementById("info").textContent = `${this.dCount} deleted`
    },

    processFile() {
        let file = false
        let tn = document.getElementById(`${TweetsXer.dId}_file`)
        if (tn.files && tn.files[0]) {
            file = true
            let fr = new FileReader()
            fr.onloadend = function (evt) {
                TweetsXer.skip = document.getElementById('skipCount').value
                console.log(`Skipping oldest ${TweetsXer.skip} Tweets`)

                // window.YTD.tweet_headers.part0
                // window.YTD.tweets.part0
                // window.YTD.like.part0
                let cutpoint = evt.target.result.indexOf('= ')
                let filestart = evt.target.result.slice(0, cutpoint)
                let json = JSON.parse(evt.target.result.slice(cutpoint + 1))

                if (filestart.includes('.tweet_headers.')) {
                    console.log('File contains Tweets.')
                    TweetsXer.action = 'untweet'
                    TweetsXer.tIds = json.map((x) => x.tweet.tweet_id)
                }
                else if (filestart.includes('.tweets.')) {
                    console.log('File contains Tweets.')
                    TweetsXer.action = 'untweet'
                    TweetsXer.tIds = json.map((x) => x.tweet.id_str)
                }
                else if (filestart.includes('.like.')) {
                    console.log('File contains Favs.')
                    TweetsXer.action = 'unfav'
                    TweetsXer.tIds = json.map((x) => x.like.tweetId)
                }
                else {
                    console.log('File contain not recognized. Please use a file from the Twitter data export.')
                }

                document
                    .querySelector('[data-testid="AppTabBar_Profile_Link"]')
                    .click()

                TweetsXer.total = TweetsXer.tIds.length
                document.getElementById('start').remove()
                TweetsXer.createProgressBar()

                if (TweetsXer.action == 'untweet') {
                    TweetsXer.tIds.reverse()
                    TweetsXer.tIds = TweetsXer.tIds.slice(TweetsXer.skip)
                    TweetsXer.dCount = TweetsXer.skip
                    TweetsXer.tIds.reverse()
                    document.getElementById(
                        `${TweetsXer.dId}_title`
                    ).textContent = `Deleting ${TweetsXer.total} Tweets`

                    TweetsXer.deleteTweets()
                }

                else if (TweetsXer.action == 'unfav') {
                    TweetsXer.tIds.reverse()
                    document.getElementById(
                        `${TweetsXer.dId}_title`
                    ).textContent = `Deleting ${TweetsXer.total} Favs`
                    TweetsXer.deleteFavs()
                }

                else {
                    document.getElementById(
                        `${TweetsXer.dId}_title`
                    ).textContent = `Please try a different file`
                }



            }
            fr.readAsText(tn.files[0])
        }
    },

    createUploadForm() {
        var h2_class = document.querySelectorAll("h2")[1].getAttribute("class")
        var div = document.createElement("div")
        div.id = this.dId
        if (document.getElementById(this.dId))
            document.getElementById(this.dId).remove()
        div.innerHTML = `<style>#${this.dId}{ z-index:99999; position: sticky; top:0px; left:0px; width:auto; margin:0 auto; padding: 20px 10%; background:#87CEFA; opacity:0.9; } #${this.dId} > *{padding:5px;}</style>
        <div>
            <h2 class="${h2_class}" id="${this.dId}_title">TweetXer</h2>
            <p id="info">Select your tweet-headers.js from your Twitter Data Export to start the deletion of all your Tweets. </p>
        <p id="start">
          <input type="file" value="" id="${this.dId}_file"  />
          <a href="#" id="toggleAdvanced">Advanced Options</a>
          <div id="advanced" style="display:none">
          <label for="skipCount">Enter how many Tweets to skip (useful for reruns) before selecting a file.</label>
          <input id="skipCount" type="number" value="0" />
          <p>To delete your Favs (aka Likes), select your like.js file.</p>
          <p>Instead of your tweet-headers.js file, you can use the tweets.js file. Unfaving is limited to 500 unfavs per 15 minutes.</p>
          </div>
        </p>
        </div>`
        document.body.insertBefore(div, document.body.firstChild)
        document.getElementById("toggleAdvanced").addEventListener("click", (() => { let adv = document.getElementById('advanced'); if (adv.style.display == 'none') { adv.style.display = 'block' } else { adv.style.display = 'none' } }));
        document.getElementById(`${this.dId}_file`).addEventListener("change", this.processFile, false)
    },

    createProgressBar() {
        let progressbar = document.createElement("progress")
        progressbar.setAttribute('id', "progressbar")
        progressbar.setAttribute('value', this.dCount)
        progressbar.setAttribute('max', this.total)
        progressbar.setAttribute('style', 'width:100%')
        document.getElementById(this.dId).appendChild(progressbar)
    },

    async deleteFavs() {
        // 500 unfavs per 15 Minutes
        // x-rate-limit-remaining
        // x-rate-limit-reset
        while (!('authorization' in this.lastHeaders)) {
            await this.sleep(1000)
        }
        TweetsXer.username = document.location.href.split('/')[3]

        while (this.tIds.length > 0) {
            this.tId = this.tIds.pop()
            let response = await fetch(this.unfavURL, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": 'en-US,en;q=0.5',
                    "authorization": this.lastHeaders.authorization,
                    "content-type": "application/json",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-client-transaction-id": this.lastHeaders['X-Client-Transaction-Id'],
                    "x-client-uuid": this.lastHeaders['x-client-uuid'],
                    "x-csrf-token": this.lastHeaders['x-csrf-token'],
                    "x-twitter-active-user": "yes",
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-language": 'en'
                },
                "referrer": `https://twitter.com/${this.username}/likes`,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `{\"variables\":{\"tweet_id\":\"${this.tId}\"},\"queryId\":\"${this.unfavURL.split('/')[6]}\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })

            if (response.status == 200) {
                TweetsXer.dCount++
                TweetsXer.updateProgressBar()
            }
            else {
                console.log(response)
            }

            if (response.headers.get('x-rate-limit-remaining') < 1) {
                console.log('rate limit hit')
                let ratelimitreset = response.headers.get('x-rate-limit-reset')
                let sleeptime = ratelimitreset - Math.floor(Date.now() / 1000)
                while (sleeptime > 0) {
                    sleeptime = ratelimitreset - Math.floor(Date.now() / 1000)
                    document.getElementById("info").textContent = `Ratelimited. Waiting ${sleeptime} seconds. ${TweetsXer.dCount} deleted.`
                    await this.sleep(1000)
                }
            }
        }
    },

    async deleteTweets() {
        while (!('authorization' in this.lastHeaders)) {
            await this.sleep(1000)
        }
        TweetsXer.username = document.location.href.split('/')[3]

        while (this.tIds.length > 0) {
            this.tId = this.tIds.pop()
            let response = await fetch(this.deleteURL, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": 'en-US,en;q=0.5',
                    "authorization": this.lastHeaders.authorization,
                    "content-type": "application/json",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-client-transaction-id": this.lastHeaders['X-Client-Transaction-Id'],
                    "x-client-uuid": this.lastHeaders['x-client-uuid'],
                    "x-csrf-token": this.lastHeaders['x-csrf-token'],
                    "x-twitter-active-user": "yes",
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-language": 'en'
                },
                "referrer": `https://twitter.com/${this.username}/with_replies`,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `{\"variables\":{\"tweet_id\":\"${this.tId}\",\"dark_request\":false},\"queryId\":\"${this.deleteURL.split('/')[6]}\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })
            if (response.status == 200) {
                TweetsXer.dCount++
                TweetsXer.updateProgressBar()
            }
            else {
                console.log(response)
            }
        }
    },

}

window.addEventListener('load', function () {
    // necessary when used as a userscript
    TweetsXer.init()
}, false)

TweetsXer.init()
