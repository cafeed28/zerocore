import log from '../logger'
import config from '../config'

import axios from 'axios'
import jwt from 'jsonwebtoken'

import { IAccount } from '../mongodb/models/account'
import { ILevel } from '../mongodb/models/level'
import { AuthModel } from '../mongodb/models/auth'

import GJHelpers from './GJHelpers'

export default class API {
    static async generateToken(account: IAccount) {
        let token = await jwt.sign({ account }, config.apiKey)

        return token
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
        catch (err) {
            return false
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
                            text: 'ZeroCore Webhook',
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            })

            return true
        }
        catch (e) {
            log.error(e)
        }
    }

    static async sendDiscordLevel(title: any, level: ILevel) {
        try {
            let coin = '<:user_coin:879794944343146546>'
            let coinUnverifed = '<:user_coin_unverified:879801716881629224>'

            let coinString = level.starCoins ? coin.repeat(level.coins) : coinUnverifed.repeat(level.coins)

            await axios.post(config.publicWebhook, {
                content: null,
                embeds: [
                    {
                        title: title,
                        color: null,
                        fields: [
                            {
                                name: `${level.levelName} by ${level}`,
                                value: `**Description:** ${Buffer.from(level.levelDesc, 'base64').toString('ascii')}`
                            },
                            {
                                name: GJHelpers.getDiffFromStars(level.starDifficulty),

                                value: `${coinString}\n<:downloads:879795146194055218> ${level.downloads}\n<:like:879795181703016508> ${level.likes}\n<:length:879795256692973599> ${GJHelpers.getLengthString(level.levelLength)}`
                            }
                        ]
                    }
                ]
            })

            return true
        }
        catch (e) {
            log.error(e)
        }
    }

    static clamp(val: any, min: number, max: number) {
        if (typeof val != 'number') return 0
        return val > max ? max : val < min ? min : val
    }
}