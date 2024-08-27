import { MidiModel } from "./midiModel.js";
import { HtmlView } from "./htmlView.js";
import { HtmlController } from "./htmlController.js";

const app = new HtmlController(new MidiModel(), new HtmlView());
