export default interface ICommand {
	name: string,
	modLevel: number,
	execute(accountID: number, args: string[]): Promise<void>
}