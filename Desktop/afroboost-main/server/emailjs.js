const https = require('https')
function sendEmail(templateId, templateParams) {
    console.log("What is comming");
    console.log(templateParams);
    let data = JSON.stringify({
        template_id: "template_qnv1kqm",
        service_id: "service_lg4dcgr",
        user_id: "9v7ne97OTLNnfAJ-i",
        accessToken: "MRAx5NnrowNT1slW_1Vgp",
        template_params: templateParams

    })
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.emailjs.com',
            path: '/api/v1.0/email/send',
            port: 443,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            res.on('data', d => {
                console.log(d.toString());
            })
            res.on('end', () => {
                console.log(res.statusCode)

                resolve()
            })
        })
        req.write(data)
        req.end()
        req.on('error', (error) => {
            console.log("ERROR : ", error);
            reject(error)
        })
    })

}
module.exports = {
    sendEmail
}