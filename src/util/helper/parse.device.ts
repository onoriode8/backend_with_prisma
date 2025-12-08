import { Request } from 'express'
import { UAParser } from 'ua-parser-js'

interface WhereLoginProps {
    OSVersion:       String
    device:          String
    browser:         String
    browserVersion:  String
}

type Props =  WhereLoginProps[] | []

export const ParseDevice = (req: Request) => {
    const parser = new UAParser(req.headers['user-agent'])
    const result = parser.getResult()
    
    return { result }
}


export const checkDeviceSecurity = (req: Request, whereLogin: Props) => {
    const parser = new UAParser(req.headers['user-agent'])
    const result = parser.getResult()

    const device = whereLogin?.filter(d => d.device !== result.device.model && d.OSVersion !== result.os.version);
    const browser = whereLogin?.filter(d => d.browser !== result.browser.name && d.browserVersion !== result.browser.version);

    if(device?.length === 0 || browser?.length === 0) { //security to protect user cookie from unknown device or browser
        // return res.status(406).json("Not allowed."); // comment back on
    }
}