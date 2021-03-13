import ICommand from '../interfaces/ICommand';

export default class CMDRate implements ICommand {
	name = 'rate';
	modLevel = 1;
	execute = async (accountID: number, message: string) => {
		
	};
}