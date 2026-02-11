package mcp

import (
	"strings"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// TextFromResult returns the concatenated text from a CallToolResult's content.
// TextContent items are appended; other content types are skipped.
func TextFromResult(r *mcp.CallToolResult) string {
	if r == nil {
		return ""
	}
	var out []string
	for _, c := range r.Content {
		if tc, ok := c.(*mcp.TextContent); ok {
			out = append(out, tc.Text)
		}
	}
	return strings.Join(out, "\n")
}

// PrintResult writes each text content item from r to the given writer function.
// If fn is nil, nothing is written. Used by the prototype to fmt.Println each part.
func PrintResult(r *mcp.CallToolResult, fn func(string)) {
	if r == nil || fn == nil {
		return
	}
	for _, c := range r.Content {
		if tc, ok := c.(*mcp.TextContent); ok {
			fn(tc.Text)
		}
	}
}
