package mcp

import (
	"context"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

func TestClient_ListTools_NotConnected(t *testing.T) {
	c := NewClient(DefaultK8sConfig())
	ctx := context.Background()
	tools, err := c.ListTools(ctx)
	if err != errNotConnected {
		t.Errorf("ListTools() err = %v, want errNotConnected", err)
	}
	if tools != nil {
		t.Errorf("ListTools() tools = %v, want nil", tools)
	}
}

func TestClient_CallTool_NotConnected(t *testing.T) {
	c := NewClient(DefaultK8sConfig())
	ctx := context.Background()
	res, err := c.CallTool(ctx, "namespaces_list", nil)
	if err != errNotConnected {
		t.Errorf("CallTool() err = %v, want errNotConnected", err)
	}
	if res != nil {
		t.Errorf("CallTool() result = %v, want nil", res)
	}
}

func TestClient_Close_NotConnected(t *testing.T) {
	c := NewClient(DefaultK8sConfig())
	if err := c.Close(); err != nil {
		t.Errorf("Close() when not connected = %v, want nil", err)
	}
}

// TestClient_WithMockServer runs the client against an in-memory mock MCP server
// (no npx or real K8s server). It verifies ListTools and CallTool.
func TestClient_WithMockServer(t *testing.T) {
	ctx := context.Background()
	clientTransport, serverTransport := mcp.NewInMemoryTransports()

	// Mock server: one tool "namespaces_list" that returns fake namespaces.
	server := mcp.NewServer(&mcp.Implementation{Name: "test-k8s-mock", Version: "0.0.1"}, nil)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "namespaces_list",
		Description: "List namespaces (mock)",
	}, func(_ context.Context, _ *mcp.CallToolRequest, _ any) (*mcp.CallToolResult, any, error) {
		return &mcp.CallToolResult{
			Content: []mcp.Content{
				&mcp.TextContent{Text: "default\nkube-system"},
			},
		}, nil, nil
	})

	_, err := server.Connect(ctx, serverTransport, nil)
	if err != nil {
		t.Fatalf("server.Connect: %v", err)
	}

	cfg := DefaultK8sConfig()
	client := NewClientWithTransport(cfg, clientTransport)
	if err := client.Connect(ctx); err != nil {
		t.Fatalf("client.Connect: %v", err)
	}
	defer client.Close()

	tools, err := client.ListTools(ctx)
	if err != nil {
		t.Fatalf("ListTools: %v", err)
	}
	if len(tools) < 1 {
		t.Errorf("ListTools: got %d tools, want at least 1", len(tools))
	}
	var found bool
	for _, tool := range tools {
		if tool.Name == "namespaces_list" {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("ListTools: namespaces_list not in %v", tools)
	}

	res, err := client.CallTool(ctx, "namespaces_list", nil)
	if err != nil {
		t.Fatalf("CallTool: %v", err)
	}
	text := TextFromResult(res)
	if text != "default\nkube-system" {
		t.Errorf("CallTool result text = %q, want %q", text, "default\nkube-system")
	}
}
