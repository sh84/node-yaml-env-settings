'use strict';

const YAML = require('yaml').default;
const fs = require('fs');
let settings = {};

module.exports = function(yml_file_path) {
  if (settings[yml_file_path]) return settings[yml_file_path];
  let env = process.env.NODE_ENV || 'development';
  let yaml_file = fs.readFileSync(yml_file_path, {encoding: 'utf8'});
  yaml_file = yaml_file.replace(/:.*\$\{.+?\}.*/g, str => {
    let r = str.match(/:\s*(.*)\$\{(.+?)\}(.*)/);
    let env_val = process.env[r[2]] || '';
    let expression = `${r[1]}"${env_val}"${r[3]}`;
    let val;
    try {
      val = eval(expression);
    } catch (e) {
      console.error(`setting parse error: ${expression} is invalid`);
      process.exit(1);
    }
    return ': '+val;
  });
  let yaml = YAML.parse(yaml_file, {merge: true});
  settings[yml_file_path] = yaml[env];
  settings[yml_file_path].env = env;
  return settings[yml_file_path];
}
