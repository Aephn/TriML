package mcp

import (
	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// NewTransport returns an MCP transport that spawns the Kubernetes MCP server
// as a subprocess. Same transport can be used for the ADK toolset and for
// the prototype client.
func NewTransport(cfg Config) mcp.Transport {
	return &mcp.CommandTransport{Command: cfg.Cmd()}
}
