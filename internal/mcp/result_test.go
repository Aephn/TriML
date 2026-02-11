package mcp

import (
	"strings"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

func TestTextFromResult(t *testing.T) {
	t.Run("nil", func(t *testing.T) {
		if got := TextFromResult(nil); got != "" {
			t.Errorf("TextFromResult(nil) = %q, want \"\"", got)
		}
	})
	t.Run("empty content", func(t *testing.T) {
		r := &mcp.CallToolResult{Content: []mcp.Content{}}
		if got := TextFromResult(r); got != "" {
			t.Errorf("TextFromResult(empty) = %q, want \"\"", got)
		}
	})
	t.Run("text content", func(t *testing.T) {
		r := &mcp.CallToolResult{
			Content: []mcp.Content{
				&mcp.TextContent{Text: "hello"},
				&mcp.TextContent{Text: "world"},
			},
		}
		got := TextFromResult(r)
		want := "hello\nworld"
		if got != want {
			t.Errorf("TextFromResult = %q, want %q", got, want)
		}
	})
}

func TestPrintResult(t *testing.T) {
	var lines []string
	fn := func(s string) { lines = append(lines, s) }
	r := &mcp.CallToolResult{
		Content: []mcp.Content{
			&mcp.TextContent{Text: "a"},
			&mcp.TextContent{Text: "b"},
		},
	}
	PrintResult(r, fn)
	if got := strings.Join(lines, "|"); got != "a|b" {
		t.Errorf("PrintResult called fn with %v, want [a b]", lines)
	}
	PrintResult(nil, fn)
	if len(lines) != 2 {
		t.Errorf("PrintResult(nil) should not call fn; lines = %v", lines)
	}
}
