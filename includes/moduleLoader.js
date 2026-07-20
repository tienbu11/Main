const { join } = require("path");
const { execSync } = require("child_process");

// Shared loading logic used by both commands and events in mirai.js.
// A "module" here is any object exposing `config` (with optional
// `dependencies`, `envConfig`) and an optional `onLoad` handler.
module.exports = ({ logger, listPackage, listbuiltinModules }) => {
    const nodeModulesPath = join(__dirname, "..", "nodemodules", "node_modules");
    const installCwd = join(__dirname, "..", "nodemodules");

    function requireDependency(name) {
        if (listPackage.hasOwnProperty(name) || listbuiltinModules.includes(name)) return require(name);
        return require(join(nodeModulesPath, name));
    }

    function loadDependencies(mod) {
        if (!(mod.config.dependencies && typeof mod.config.dependencies == "object")) return;
        for (const dependency in mod.config.dependencies) {
            try {
                if (!global.nodemodule.hasOwnProperty(dependency))
                    global.nodemodule[dependency] = requireDependency(dependency);
            } catch {
                let check = false;
                let isError;
                logger.loader(global.getText("mirai", "notFoundPackage", dependency, mod.config.name), "warn");
                const version = mod.config.dependencies[dependency];
                const versionSuffix = version == "*" || version == "" ? "" : "@" + version;
                execSync("npm --package-lock false --save install " + dependency + versionSuffix, {
                    stdio: "inherit",
                    env: process.env,
                    shell: true,
                    cwd: installCwd
                });
                for (let i = 1; i <= 3; i++) {
                    try {
                        require.cache = {};
                        global.nodemodule[dependency] = requireDependency(dependency);
                        check = true;
                        break;
                    } catch (error) { isError = error; }
                    if (check || !isError) break;
                }
                if (!check || isError) throw global.getText("mirai", "cantInstallPackage", dependency, mod.config.name, isError);
            }
        }
        logger.loader(global.getText("mirai", "loadedPackage", mod.config.name));
    }

    function loadEnvConfig(mod) {
        if (!mod.config.envConfig) return;
        try {
            const name = mod.config.name;
            for (const envConfig in mod.config.envConfig) {
                if (typeof global.configModule[name] == "undefined") global.configModule[name] = {};
                if (typeof global.config[name] == "undefined") global.config[name] = {};
                if (typeof global.config[name][envConfig] !== "undefined")
                    global.configModule[name][envConfig] = global.config[name][envConfig];
                else global.configModule[name][envConfig] = mod.config.envConfig[envConfig] || "";
                if (typeof global.config[name][envConfig] == "undefined")
                    global.config[name][envConfig] = mod.config.envConfig[envConfig] || "";
            }
            logger.loader(global.getText("mirai", "loadedConfig", name));
        } catch (error) {
            throw new Error(global.getText("mirai", "loadedConfig", mod.config.name, JSON.stringify(error)));
        }
    }

    function callOnLoad(mod, api, models) {
        if (!mod.onLoad) return;
        try {
            mod.onLoad({ api, models });
        } catch (error) {
            throw new Error(global.getText("mirai", "cantOnload", mod.config.name, JSON.stringify(error)), "error");
        }
    }

    return { loadDependencies, loadEnvConfig, callOnLoad };
};
