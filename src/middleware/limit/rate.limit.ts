import expressRateLimit from 'express-rate-limit'



const expressLimit = expressRateLimit({
    limit: 4,
    statusCode: 429,
    message: "Too many request, please try again later.",
    // keyGenerator: (req, res) => {
    //     req.body.email || req.body.userData
    // }
})


export default expressLimit;