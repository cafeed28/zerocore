import axios from 'axios'
import jwt from 'jsonwebtoken'
import config from '../config'
import { IAccount } from '../mongodb/models/account'
import { AuthModel } from '../mongodb/models/auth'

export default class API {
    static generateToken(account: IAccount) {
        return jwt.sign(
            { account },
            config.tokenSecret, { expiresIn: '48h' }
        )
    }

    static async checkToken(token: string) {
        let auth = await AuthModel.findOne({ token: token })
        if (auth) return auth.accountID
        return 0
    }

    static async verifySongUrl(url: string) {
        let res
        try {
            res = await axios.get(url)
        }
        catch (e) {
            throw e
        }

        if (res.status == 200) {
            let type: string = res.headers['content-type']
            if (type.startsWith('audio') || type.startsWith('application/octet-stream') || type.startsWith('application/binary')) {
                return true
            }
            else return false
        }
        return false
    }

    static async sendDiscordLog(title: any, fieldName: any, fieldValue: any) {
        try {
            await axios.post(config.webhook, {
                content: null,
                embeds: [
                    {
                        title: title,
                        color: 3715756,
                        fields: [
                            {
                                name: fieldName,
                                value: fieldValue,
                            },
                        ],
                        footer: {
                            text: "ZeroCore Webhook",
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            })

            return true
        }
        catch (e) {
            throw e
        }
    }

    static clamp(val: any, min: number, max: number) {
        if (typeof val != 'number') return 0
        return val > max ? max : val < min ? min : val
    }
}