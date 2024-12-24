const https = require('https')
class SocialLogin {
    async google(token) {
        var data = ''
        return new Promise((resolve, reject) => {
            const request = https.request({
                path: 'GET',
                hostname: 'oauth2.googleapis.com',
                path: `/tokeninfo?id_token=${token}`,
                port: 443
            }, (res) => {
                res.on('data', d => {
                    data += d
                })
                res.on('end', () => {
                    if (res.statusCode !== 200) reject({ message: 'Unauthorized', code: 412 })
                    data = JSON.parse(data)
                    console.log(data)
                    resolve(data)
                })
            })
            request.end()
            request.on('error', (error) => {
                console.log("ERROR : ", error);
                reject({ message: 'Unauthorized', code: 412 })
            })
        })
    }
}

module.exports = new SocialLogin()