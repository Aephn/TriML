package mcp

import (
	"context"
	"errors"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

var errNotConnected = errors.New("mcp client: not connected (call Connect first)")

// Client is a thin wrapper over the go-sdk MCP client for use by the prototype.
// It connects to the Kubernetes MCP server via the same transport as the toolset.
type Client struct {
	cfg       Config
	transport mcp.Transport // optional; for tests or custom transport
	client    *mcp.Client
	session   *mcp.ClientSession
}

// NewClient returns a client that will use the given config to connect to the
// Kubernetes MCP server. Call Connect to establish the session.
func NewClient(cfg Config) *Client {
	return &Client{
		cfg:    cfg,
		client: mcp.NewClient(&mcp.Implementation{Name: "TriML", Version: "1.0.0"}, nil),
	}
}

// NewClientWithTransport returns a client that uses the given transport instead
// of spawning the server. Use for tests with an in-memory or mock transport.
func NewClientWithTransport(cfg Config, transport mcp.Transport) *Client {
	return &Client{
		cfg:       cfg,
		transport: transport,
		client:    mcp.NewClient(&mcp.Implementation{Name: "TriML", Version: "1.0.0"}, nil),
	}
}

// Connect starts the MCP server subprocess (or uses the injected transport) and establishes a session.
// Call Close when done.
func (c *Client) Connect(ctx context.Context) error {
	transport := c.transport
	if transport == nil {
		transport = NewTransport(c.cfg)
	}
	var err error
	c.session, err = c.client.Connect(ctx, transport, nil)
	return err
}

// ListTools returns the list of tools from the MCP server.
func (c *Client) ListTools(ctx context.Context) ([]*mcp.Tool, error) {
	if c.session == nil {
		return nil, errNotConnected
	}
	res, err := c.session.ListTools(ctx, nil)
	if err != nil {
		return nil, err
	}
	return res.Tools, nil
}

// CallTool invokes the named tool with the given arguments.
func (c *Client) CallTool(ctx context.Context, name string, args map[string]any) (*mcp.CallToolResult, error) {
	if c.session == nil {
		return nil, errNotConnected
	}
	return c.session.CallTool(ctx, &mcp.CallToolParams{
		Name:      name,
		Arguments: args,
	})
}

// Close closes the session and the server subprocess.
func (c *Client) Close() error {
	if c.session == nil {
		return nil
	}
	return c.session.Close()
}
