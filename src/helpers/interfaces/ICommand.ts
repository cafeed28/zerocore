import EPermissions from "../EPermissions"

export default interface ICommand {
	name: string,
	requiredPerms: EPermissions[],
	execute(accountID: number, levelID: number, args: string[]): Promise<boolean>
}