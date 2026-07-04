import './menu';
import './title-screen-button';
declare global {
    namespace sc {
        interface OptionsMenu {
            modsButton: sc.ButtonGui;
        }
    }
}
