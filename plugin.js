export default class CCModManager {
	async prestart() {
		await import('./gui.js');
	}
}