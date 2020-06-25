import { NodeCG } from "nodecg/types/server";
import { NodeCGIOCore } from "nodecg-io-core/extension";
import { Service, ServiceProvider } from "nodecg-io-core/extension/types";
import { emptySuccess, success, error, Result } from "nodecg-io-core/extension/utils/result";
import { IntelliJ } from "./intellij"

interface IntelliJServiceConfig {
    address: string
}

export interface IntelliJServiceClient {
    getRawClient(): IntelliJ
}

module.exports = (nodecg: NodeCG): ServiceProvider<IntelliJServiceClient> | undefined => {
    nodecg.log.info("IntelliJ bundle started");
    const core: NodeCGIOCore | undefined = nodecg.extensions["nodecg-io-core"] as any;
    if (core === undefined) {
        nodecg.log.error("nodecg-io-core isn't loaded! IntelliJ bundle won't function without it.");
        return undefined;
    }

    const service: Service<IntelliJServiceConfig, IntelliJServiceClient> = {
        schema: core.readSchema(__dirname, "../intellij-schema.json"),
        serviceType: "intellij",
        validateConfig: validateConfig,
        createClient: createClient(nodecg),
        stopClient: stopClient
    };

    return core.registerService(service);
};

async function validateConfig(config: IntelliJServiceConfig): Promise<Result<void>> {
    try {
        const address = config.address;
        const ij = new IntelliJ(address);
        await ij.rawRequest('available_methods', {})
        return emptySuccess();
    } catch (err) {
        return error(err.toString());
    }
}

function createClient(nodecg: NodeCG): (config: IntelliJServiceConfig) => Promise<Result<IntelliJServiceClient>> {
    return async (config) => {
        const ij = new IntelliJ(config.address)
        nodecg.log.info("Successfully connected to IntelliJ at " + config.address + ".");
        return success({
            getRawClient() {
                return ij;
            }
        });
    }
}

function stopClient(client: IntelliJServiceClient): void {
    
}