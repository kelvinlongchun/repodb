import Repodb from "./models/Repodb";
import { GithubOptions } from "./models/GithubRepo";
import Data from "./models/Data";

const repodb = new Repodb();
export default repodb;

export { GithubOptions, Data };
