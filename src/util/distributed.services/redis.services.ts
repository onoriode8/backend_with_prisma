import { createClient } from 'redis'


const client = createClient()

async function ConnectRedis() {
    client.on("error", err => {
        console.log("ERROR", err.name)
    })

    const connect = await client.connect()
    console.log("CONNECT REDIS", connect)
}

export default ConnectRedis