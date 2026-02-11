// Package mcp provides a single library for the Model Context Protocol (MCP) using
// github.com/modelcontextprotocol/go-sdk. It connects to the Kubernetes MCP server
// (containers/kubernetes-mcp-server) and exposes: a Config and Transport for
// spawning the server over stdio; a Toolset for ADK agents (e.g. api_agent) to call
// tools like pods_log and namespaces_list; and a Client for standalone use (e.g. the
// prototype command). All MCP usage in the project goes through this package.
package mcp

import (
	"os"
	"os/exec"
)

// Config holds options for the Kubernetes MCP server.
// Default command is npx -y kubernetes-mcp-server@latest.
type Config struct {
	// Command name (e.g. "npx").
	Command string
	// Args passed to Command (e.g. ["-y", "kubernetes-mcp-server@latest"]).
	// Optional flags: "--read-only", "--kubeconfig", path.
	Args []string
	// Env is the environment for the server subprocess. If nil, the process
	// inherits the current environment. Set to set KUBECONFIG or other vars
	// without putting --kubeconfig in Args (e.g. for a config fetched at runtime).
	// Use WithEnv or WithKubeconfigEnv to build this.
	Env []string
}

// DefaultK8sConfig returns a Config that runs the Kubernetes MCP server via npx.
func DefaultK8sConfig() Config {
	return Config{
		Command: "npx",
		Args:    []string{"-y", "kubernetes-mcp-server@latest"},
	}
}

// WithReadOnly returns a copy of the config with --read-only appended to Args.
func (c Config) WithReadOnly() Config {
	out := c
	out.Args = append([]string{}, c.Args...)
	out.Args = append(out.Args, "--read-only")
	return out
}

// WithKubeconfig returns a copy of the config with --kubeconfig and path appended to Args.
// The path may be to any kubeconfig file: it can reference a remote cluster (cluster.server
// is the API URL) and use token, client cert, or exec-based auth. Use this when the config
// file is at a known path on this machine (e.g. a file you downloaded or synced).
func (c Config) WithKubeconfig(path string) Config {
	out := c
	out.Args = append([]string{}, c.Args...)
	out.Args = append(out.Args, "--kubeconfig", path)
	return out
}

// WithKubeconfigEnv returns a copy of the config with KUBECONFIG=path set in the
// subprocess environment (and the rest of the environment inherited). Use this when
// you want to point at a kubeconfig without adding --kubeconfig to Args, or when the
// path is only known at runtime (e.g. from a secret or env). The server will use
// KUBECONFIG if set; see kubernetes-mcp-server docs.
func (c Config) WithKubeconfigEnv(path string) Config {
	out := c
	env := os.Environ()
	filtered := make([]string, 0, len(env)+1)
	prefix := "KUBECONFIG="
	for _, e := range env {
		if len(e) < len(prefix) || e[:len(prefix)] != prefix {
			filtered = append(filtered, e)
		}
	}
	out.Env = append(filtered, "KUBECONFIG="+path)
	return out
}

// WithEnv returns a copy of the config with the subprocess environment set to env.
// It replaces the default (inherit). To add one variable and inherit the rest, use
// append(os.Environ(), "KUBECONFIG=/path") and pass to a config that supports Env.
func (c Config) WithEnv(env []string) Config {
	out := c
	out.Env = append([]string(nil), env...)
	return out
}

// Cmd returns an *exec.Cmd for this config. If Config.Env is non-nil, Cmd.Env is set
// so the server subprocess sees that environment. Caller may further set Cmd.Dir, etc.
func (c Config) Cmd() *exec.Cmd {
	cmd := exec.Command(c.Command, c.Args...)
	if c.Env != nil {
		cmd.Env = c.Env
	}
	return cmd
}
