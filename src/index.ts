import * as fs from "fs-extra";
import * as path from "path";

import ConfigInfo from "./configInfo";
import HostBuilder from "./host/hostBuilder";
import Helper from "./helper";

export default class GitUrls {
    public static async getUrlsAsync(filePath: string, startLine?: number, endLine?: number): Promise<string> {
        const repoRoot = Helper.getRepoRoot(filePath);
        if (!repoRoot) {
            throw new Error(`Can't find repo root for ${filePath}.`);
        }

        const configInfo = await Helper.parseConfigAsync(repoRoot);
        configInfo.relativePath = Helper.normarlize(path.relative(repoRoot, filePath));
        configInfo.startLine = startLine;
        configInfo.endLine = endLine;

        return this.getUrlsCoreAsync(configInfo);
    }

    public static async tryUrlsAsync(filePath: string, startLine?: number, endLine?: number): Promise<string | null> {
        try {
            return this.getUrlsAsync(filePath, startLine, endLine);
        } catch (err) {
            console.error(err);
        }

        return null;
    }

    private static async getUrlsCoreAsync(configInfo: ConfigInfo): Promise<string> {
        const host = HostBuilder.create(configInfo);
        let gitInfo = host.parse(configInfo);

        gitInfo.startLine = configInfo.startLine;
        gitInfo.endLine = configInfo.endLine;
        if (configInfo.relativePath !== undefined) {
            let parts = configInfo.relativePath.split('/');
            parts = parts.map(p => encodeURIComponent(p));
            gitInfo.relativefilePath = parts.join('/');
        }

        return host.assemble(gitInfo);
    }
}