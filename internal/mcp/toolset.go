package mcp

import (
	"google.golang.org/adk/tool"
	"google.golang.org/adk/tool/mcptoolset"
)

// NewToolset returns an ADK tool.Toolset that exposes the Kubernetes MCP server
// tools to agents. Uses the same transport as the client (spawns k8s MCP server
// on first tool use).
func NewToolset(cfg Config) (tool.Toolset, error) {
	return mcptoolset.New(mcptoolset.Config{
		Transport: NewTransport(cfg),
	})
}
