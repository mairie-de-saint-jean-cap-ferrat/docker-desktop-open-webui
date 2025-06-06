system({
    title: "Loads tools from Model Context Protocol server",
    description:
        "This system script should be configured with a MCP server configuration.",
    parameters: {
        id: {
            type: "string",
            description: "The unique identifier for the MCP server.",
            required: true,
        },
        command: {
            type: "string",
            description: "The command to run the MCP server.",
            required: true,
        },
        args: {
            type: "array",
            items: { type: "string" },
            description: "The arguments to pass to the command.",
        },
        params: {
            type: "array",
            items: { type: "string" },
            description: "The parameters to pass to the command.",
        },
        version: {
            type: "string",
            description: "The version of the MCP server.",
        },
        maxTokens: {
            type: "integer",
            minimum: 16,
            description: "Maximum number of tokens returned by the tools.",
        },
        toolsSha: {
            type: "string",
            description:
                "The SHA256 hash of the tools returned by the MCP server.",
        },
    },
})

export default function (ctx: ChatGenerationContext) {
    const { env, defTool } = ctx
    const { vars } = env
    const dbg = host.logger("genaiscript:mcp:system")

    const id = vars["system.mcp.id"] as string
    const command = vars["system.mcp.command"] as string
    const args = (vars["system.mcp.args"] as string[]) || []
    const params = (vars["system.mcp.params"] as string[]) || []
    const version = vars["system.mcp.version"] as string
    const maxTokens = vars["system.mcp.maxTokens"] as number
    const toolsSha = vars["system.mcp.toolsSha"] as string
    const contentSafety = vars[
        "system.mcp.contentSafety"
    ] as ContentSafetyOptions["contentSafety"]
    const detectPromptInjection = vars[
        "system.mcp.detectPromptInjection"
    ] as ContentSafetyOptions["detectPromptInjection"]

    if (!id) throw new Error("Missing required parameter: id")
    if (!command) throw new Error("Missing required parameter: command")

    const config = {
        command,
        args,
        params,
        version,
        toolsSha,
        contentSafety,
        detectPromptInjection,
    } satisfies Omit<McpServerConfig, "id">
    const toolOptions = {
        maxTokens,
        contentSafety,
        detectPromptInjection,
    } satisfies DefToolOptions
    dbg(`loading %s %O %O`, id, config, toolOptions)
    const configs = {
        [id]: config,
    } satisfies McpServersConfig
    defTool(configs, toolOptions)
}
