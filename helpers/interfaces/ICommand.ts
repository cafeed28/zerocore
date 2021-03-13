export default interface ICommand {
	name: string,
	modLevel: number,
	execute(accountID: number, message: string): Promise<void>
}